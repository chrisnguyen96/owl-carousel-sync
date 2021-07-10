$(document).ready(function () {
  pluginThumbnail();
  syncVer2();

  $("#owl-1").owlCarousel({
    // Enable thumbnails
    thumbs: true,
    items: 1,

    // When only using images in your slide (like the demo) use this option to dynamicly create thumbnails without using the attribute data-thumb.
    thumbImage: false,

    // Enable this if you have pre-rendered thumbnails in your html instead of letting this plugin generate them. This is recommended as it will prevent FOUC
    thumbsPrerendered: true,

    // Class that will be used on the thumbnail container
    thumbContainerClass: "owl-thumbs",

    // Class that will be used on the thumbnail item's
    thumbItemClass: "owl-thumb-item",
  });
});

function pluginThumbnail() {
  /**
   * Thumbs Plugin
   * @version 2.0.0
   * @author Gijs RogÃ©
   * @license The MIT License (MIT)
   */
  (function ($, window, document, undefined) {
    "use strict";

    /**
     * Creates the thumbs plugin.
     * @class The thumbs Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Thumbs = function (carousel) {
      /**
       * Reference to the core.
       * @protected
       * @type {Owl}
       */
      this.owl = carousel;

      /**
       * All DOM elements for thumbnails
       * @protected
       * @type {Object}
       */
      this._thumbcontent = [];

      /**
       * Instance identiefier
       * @type {number}
       * @private
       */
      this._identifier = 0;

      /**
       * Return current item regardless of clones
       * @protected
       * @type {Object}
       */
      this.owl_currentitem = this.owl.options.startPosition;

      /**
       * The carousel element.
       * @type {jQuery}
       */
      this.$element = this.owl.$element;

      /**
       * All event handlers.
       * @protected
       * @type {Object}
       */
      this._handlers = {
        "prepared.owl.carousel": $.proxy(function (e) {
          if (
            e.namespace &&
            this.owl.options.thumbs &&
            !this.owl.options.thumbImage &&
            !this.owl.options.thumbsPrerendered &&
            !this.owl.options.thumbImage
          ) {
            if (
              $(e.content).find("[data-thumb]").attr("data-thumb") !== undefined
            ) {
              this._thumbcontent.push(
                $(e.content).find("[data-thumb]").attr("data-thumb")
              );
            }
          } else if (
            e.namespace &&
            this.owl.options.thumbs &&
            this.owl.options.thumbImage
          ) {
            var innerImage = $(e.content).find("img");
            this._thumbcontent.push(innerImage);
          }
        }, this),

        "initialized.owl.carousel": $.proxy(function (e) {
          if (e.namespace && this.owl.options.thumbs) {
            this.render();
            this.listen();
            this._identifier = this.owl.$element.data("slider-id");
            this.setActive();
          }
        }, this),

        "changed.owl.carousel": $.proxy(function (e) {
          if (
            e.namespace &&
            e.property.name === "position" &&
            this.owl.options.thumbs
          ) {
            this._identifier = this.owl.$element.data("slider-id");
            this.setActive();
          }
        }, this),
      };

      // set default options
      this.owl.options = $.extend({}, Thumbs.Defaults, this.owl.options);

      // register the event handlers
      this.owl.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     */
    Thumbs.Defaults = {
      thumbs: true,
      thumbImage: false,
      thumbContainerClass: "owl-thumbs",
      thumbItemClass: "owl-thumb-item",
      moveThumbsInside: false,
    };

    /**
     * Listen for thumbnail click
     * @protected
     */
    Thumbs.prototype.listen = function () {
      //set default options
      var options = this.owl.options;

      if (options.thumbsPrerendered) {
        this._thumbcontent._thumbcontainer = $(
          "." + options.thumbContainerClass
        );
      }

      //check what thumbitem has been clicked and move slider to that item
      $(this._thumbcontent._thumbcontainer).on(
        "click",
        this._thumbcontent._thumbcontainer.children(),
        $.proxy(function (e) {
          // find relative slider
          this._identifier = $(e.target)
            .closest("." + options.thumbContainerClass)
            .data("slider-id");

          // get index of clicked thumbnail
          var index = $(e.target)
            .parent()
            .is(this._thumbcontent._thumbcontainer)
            ? $(e.target).index()
            : $(e.target)
                .closest("." + options.thumbItemClass)
                .index();

          if (options.thumbsPrerendered) {
            // slide to slide :)
            $(
              "[data-slider-id=" + this._identifier + "]"
            ).trigger("to.owl.carousel", [index, options.dotsSpeed, true]);
          } else {
            this.owl.to(index, options.dotsSpeed);
          }

          e.preventDefault();
        }, this)
      );
    };

    /**
     * Builds thumbnails
     * @protected
     */
    Thumbs.prototype.render = function () {
      //set default options
      var options = this.owl.options;

      //create thumbcontainer
      if (!options.thumbsPrerendered) {
        this._thumbcontent._thumbcontainer = $("<div>")
          .addClass(options.thumbContainerClass)
          .appendTo(this.$element);
      } else {
        this._thumbcontent._thumbcontainer = $(
          "." + options.thumbContainerClass + ""
        );
        if (options.moveThumbsInside) {
          this._thumbcontent._thumbcontainer.appendTo(this.$element);
        }
      }

      //create thumb items
      var i;
      if (!options.thumbImage) {
        for (i = 0; i < this._thumbcontent.length; ++i) {
          this._thumbcontent._thumbcontainer.append(
            "<button class=" +
              options.thumbItemClass +
              ">" +
              this._thumbcontent[i] +
              "</button>"
          );
        }
      } else {
        for (i = 0; i < this._thumbcontent.length; ++i) {
          this._thumbcontent._thumbcontainer.append(
            "<button class=" +
              options.thumbItemClass +
              '><img src="' +
              this._thumbcontent[i].attr("src") +
              '" alt="' +
              this._thumbcontent[i].attr("alt") +
              '" /></button>'
          );
        }
      }
    };

    /**
     * Updates active class on thumbnails
     * @protected
     */
    Thumbs.prototype.setActive = function () {
      // get startslide
      this.owl_currentitem = this.owl._current - this.owl._clones.length / 2;
      if (this.owl_currentitem === this.owl._items.length) {
        this.owl_currentitem = 0;
      }

      //set default options
      var options = this.owl.options;

      // set relative thumbnail container
      var thumbContainer = options.thumbsPrerendered
        ? $(
            "." +
              options.thumbContainerClass +
              '[data-slider-id="' +
              this._identifier +
              '"]'
          )
        : this._thumbcontent._thumbcontainer;
      thumbContainer.children().filter(".active").removeClass("active");
      thumbContainer.children().eq(this.owl_currentitem).addClass("active");
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Thumbs.prototype.destroy = function () {
      var handler, property;
      for (handler in this._handlers) {
        this.owl.$element.off(handler, this._handlers[handler]);
      }
      for (property in Object.getOwnPropertyNames(this)) {
        typeof this[property] !== "function" && (this[property] = null);
      }
    };

    $.fn.owlCarousel.Constructor.Plugins.Thumbs = Thumbs;
  })(window.Zepto || window.jQuery, window, document);
}

function syncVer2() {
  var sync1 = $(".slider");
  var sync2 = $(".navigation-thumbs");

  var thumbnailItemClass = ".owl-item";

  var slides = sync1
    .owlCarousel({
      video: true,
      startPosition: 0,
      items: 1,
      loop: true,
      margin: 10,
      autoplay: false,
      autoplayTimeout: 6000,
      autoplayHoverPause: false,
      nav: false,
      dots: true,
    })
    .on("changed.owl.carousel", syncPosition);

  function syncPosition(el) {
    $owl_slider = $(this).data("owl.carousel");
    var loop = $owl_slider.options.loop;

    if (loop) {
      var count = el.item.count - 1;
      var current = Math.round(el.item.index - el.item.count / 2 - 0.5);
      if (current < 0) {
        current = count;
      }
      if (current > count) {
        current = 0;
      }
    } else {
      var current = el.item.index;
    }

    var owl_thumbnail = sync2.data("owl.carousel");
    var itemClass = "." + owl_thumbnail.options.itemClass;

    var thumbnailCurrentItem = sync2
      .find(itemClass)
      .removeClass("synced")
      .eq(current);

    thumbnailCurrentItem.addClass("synced");

    if (!thumbnailCurrentItem.hasClass("active")) {
      var duration = 300;
      sync2.trigger("to.owl.carousel", [current, duration, true]);
    }
  }
  var thumbs = sync2
    .owlCarousel({
      startPosition: 0,
      items: 5,
      loop: false,
      margin: 10,
      autoplay: false,
      nav: false,
      dots: false,
      onInitialized: function (e) {
        var thumbnailCurrentItem = $(e.target)
          .find(thumbnailItemClass)
          .eq(this._current);
        thumbnailCurrentItem.addClass("synced");
      },
    })
    .on("click", thumbnailItemClass, function (e) {
      e.preventDefault();
      var duration = 300;
      var itemIndex = $(e.target).parents(thumbnailItemClass).index();
      sync1.trigger("to.owl.carousel", [itemIndex, duration, true]);
    })
    .on("changed.owl.carousel", function (el) {
      var number = el.item.index;
      $owl_slider = sync1.data("owl.carousel");
      $owl_slider.to(number, 100, true);
    });
}
