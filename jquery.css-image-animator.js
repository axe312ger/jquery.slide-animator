/*!
 * css-image-animator
 * Original author: @axe312ger
 * Further changes, code style: @zcei
 * Licensed under the MIT license
 */

/*
  * Usage with required options:
  *
  * jQuery('.any-block-element').cssImageAnimator({
  *   src: '//example.com/ajax/slides.json',
  *   animationClass: '',
  *   urlParam: 'image.src'
  * });
  */

 // Allow safety semicolon & shadowing of undefined
 /* eslint-disable */
 /* global jQuery */
;(function ($, window, document, undefined) {
  /* eslint-enable */
  // Create the defaults once
  var pluginName = 'cssImageAnimator',
    defaults = {
      template: '<figure>{{img}}<figcaption>{{caption}}</figcaption></figure>',
      cssClass: 'css-image-animator',
      animatingClass: 'animating',
      root: 'slides',
      child: 'slide',
      preLoadImages: 5,
      loop: true,
      shuffle: false,
      autostart: true,
      fitToContainer: true,
      backgroundImage: false,
      animateBackslide: false,
      onAnimationStart: false,
      onAnimationEnd: false
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    var ghostElement;
    var duration = NaN;
    var durationWebkit = NaN;

    this.$element = $(element);
    this.options = $.extend({}, defaults, options);
    this.slides = [];
    this.defaultSlide = {
      url: '',
      options: {},
      preLoaded: false
    };
    this.currentSlide = 0;
    this.$frontSlide = null;
    this.$backSlide = null;
    this.animating = false;


    // Check for missing required options.
    if (this.options.src === 'undefined'
        || typeof this.options.animationClass === 'undefined'
        || typeof this.options.urlParam === 'undefined') {
      throw new Error('Missing required options. Check the docs.');
    }

    // Read animation duration from a invisible ghost element.
    ghostElement = $('<div/>').addClass(this.options.animationClass).hide().appendTo($('body'));
    duration = parseFloat(ghostElement.css('animation-duration')) * 1000;
    durationWebkit = parseFloat(ghostElement.css('-webkit-animation-duration')) * 1000;

    ghostElement.remove();

    if (isNaN(duration)) {
      if (isNaN(durationWebkit)) {
        throw new Error('Can not read animation duration. Check the docs.');
      }
      this.animationDuration = durationWebkit;
    } else {
      this.animationDuration = duration;
    }

    this.init();
  }

  Plugin.prototype = {

    init: function () {
      // Set up basic markup for the animation.
      this.$frontSlide = $('<div class="frontSlide"/>');
      this.$backSlide = $('<div class="backSlide"/>');

      this.$element
        .addClass(this.options.cssClass)
        .append(this.$frontSlide)
        .append(this.$backSlide);


      // Load images and initialize the animation.
      $.ajax({
        dataType: 'json',
        url: this.options.src,
        context: this,
        success: this.prepareSlides,
        error: function (jqXHR) {
          throw new Error('Could not load json file: ' + jqXHR.status + ' - ' + jqXHR.statusText);
        }
      });
    },

    prepareSlides: function (data) {
      var that = this;

      // Loop through dataset and create the slide objects
      $.each(data[this.options.root], function (key, val) {
        var levels = that.options.urlParam.split('.');
        var result = val[that.options.child],
            imageUrl,
            slide;

        levels.forEach(function (level) {
          result = result[level] || {};
        });
        if (typeof result !== 'string') {
          throw new Error('Cannot locate image url for image #' + key);
        }

        imageUrl = result;


        slide = $.extend({}, that.defaultSlide, {
          url: imageUrl,
          options: val[that.options.child]
        });
        that.slides.push(slide);
      });

      // Shuffle
      if (this.options.shuffle) {
        this.shuffleSlides();
      }

      // Preload the images
      if (this.options.preLoadImages > 0) {
        this.preLoad();
      } else if (this.options.autostart) {
        this.startAnimation();
      }
    },

    preLoad: function () {
      var autostart = this.options.autostart,
          that = this,
          candidates,
          cnt;

      // Gather slide id's to preload
      candidates = Object.keys(this.slides).slice(this.currentSlide, this.options.preLoadImages);

      cnt = candidates.length;
      $.each(candidates, function (key) {
        var img = $('<img/>');

        var autostartGuard = function () {
          cnt--;

          img.unbind('load', autostartGuard);

          if (cnt === 0) {
            that.startAnimation();
          }
        };
        var loadHandler = function () {
          that.slides[key].preLoaded = true;
          that.slides[key].naturalWidth = this.naturalWidth;
          that.slides[key].naturalHeight = this.naturalHeight;

          img.unbind('load', loadHandler);

          img.remove();
        };

        if (that.slides[key].preLoaded) {
          if (autostart) {
            autostartGuard();
          }
          return;
        }

        // Bind load event to estimate finished preloading.
        if (autostart) {
          img.bind('load', autostartGuard);
        }

        img.bind('load', loadHandler);

        // Start preload for image.
        img.attr('src', that.slides[key].url);
      });
    },

    preLoadSlide: function (slideId) {
      var img = $('<img/>');
      var that = this;
      var loadHandler = function () {
        that.slides[slideId].preLoaded = true;
        that.slides[slideId].naturalWidth = this.naturalWidth;
        that.slides[slideId].naturalHeight = this.naturalHeight;

        img.unbind('load', loadHandler);
        img.remove();

        that.startAnimation();
      };

      if (this.slides[slideId].preLoaded) {
        this.startAnimation();
        return;
      }

      img.bind('load', loadHandler);

      // Start preload for image.
      img.attr('src', this.slides[slideId].url);
    },

    startAnimation: function () {
      var newSlide, frontSlide, backSlide, frontSlideId, backSlideId, nextSlideId;

      if (this.animating) {
        return;
      }

      // Looping
      if (this.currentSlide === this.slides.length - 1 && !this.options.loop) {
        this.animating = false;
        this.$element.removeClass(this.options.animatingClass);
        return;
      }

      // For the last animation, we need to use the first image as backslide
      frontSlideId = this.currentSlide;
      frontSlide = this.slides[frontSlideId];
      if (this.currentSlide < this.slides.length - 1) {
        backSlideId = this.currentSlide + 1;
      } else {
        backSlideId = 0;
      }
      backSlide = this.slides[backSlideId];

      // Ensure the backSlide is already loaded
      if (backSlide.preLoaded === false) {
        this.preLoadSlide(backSlideId);
        return;
      }

      // Load next image while animation is running
      nextSlideId = backSlideId + 1;
      if (nextSlideId >= this.slides.length - 1) {
        nextSlideId = 0;
      }
      if (this.slides[nextSlideId].preLoaded === false) {
        this.preLoadSlide(nextSlideId);
      }

      // Generate Frontslide
      if (this.$frontSlide.is(':empty')) {
        // Create first slide.
        newSlide = this.generateSlide($('<img/>').attr('src', frontSlide.url), frontSlide);
        this.$frontSlide.append(newSlide);
      } else {
        // Move content from backSlide to frontSlide.
        this.$frontSlide.empty().append(this.$backSlide.children());
      }

      // Generate new Backslide
      newSlide = this.generateSlide($('<img/>').attr('src', backSlide.url), backSlide);
      this.$backSlide.append(newSlide);

      // Start animation
      this.animating = true;
      this.$element.addClass(this.options.animatingClass);
      this.$frontSlide.find('.animated-image').addClass(this.options.animationClass);

      if (this.options.animateBackslide) {
        this.$backSlide.find('.animated-image').addClass(this.options.animationClass);
      }

      // Callback for the start of the animation
      if (this.options.onAnimationStart) {
        this.options.onAnimationStart(this.currentSlide, this.$frontSlide, this.$backSlide);
      }

      // Animate next slide
      setTimeout(this.finishAnimation.bind(this), this.animationDuration);
    },

    finishAnimation: function () {
      if (this.currentSlide === this.slides.length - 1) {
        this.currentSlide = 0;
      } else {
        this.currentSlide++;
      }
      this.animating = false;

      // Callback for the end of the animation
      if (this.options.onAnimationEnd) {
        this.options.onAnimationEnd(this.currentSlide, this.$frontSlide, this.$backSlide);
      }

      // Animate next slide
      this.startAnimation();
    },

    generateSlide: function ($img, data) {
      var template = this.options.template;
      var placeholderRegex;
      var imgDimensions;

      // Fit image to container
      var fitToContainer = function () {
        var containerWidth = this.$element.innerWidth();
        var containerHeight = this.$element.innerHeight();

        var imgWidth = data.naturalWidth;
        var imgHeight = data.naturalHeight;

        var scaleH = containerWidth / imgWidth;
        var scaleV = containerHeight / imgHeight;
        var scale = scaleH > scaleV ? scaleH : scaleV;

        if (containerWidth === 0 || containerHeight === 0) {
          throw new Error('Can not fit to container since width or height are equal 0.'
            + 'Please check your css.');
        }

        imgWidth = scale * imgWidth;
        imgHeight = scale * imgHeight;

        return { width: imgWidth, height: imgHeight };
      };

      if (this.options.backgroundImage) {
        $img = $('<div/>').css('background-image', 'url(' + $img.attr('src') + ')');

        if (this.options.fitToContainer) {
          $img.css('background-size', 'cover');
        }
      } else if (this.options.fitToContainer) {
        imgDimensions = fitToContainer.call(this);

        $img.width(imgDimensions.width);
        $img.height(imgDimensions.height);

        $img.css('margin-left', imgDimensions.width / 2 * -1);
        $img.css('margin-top', imgDimensions.height / 2 * -1);
      } else {
        $img.css('margin-left', data.naturalWidth / 2 * -1);
        $img.css('margin-top', data.naturalHeight / 2 * -1);
      }

      $img.addClass('animated-image');

      // Place image into the template.
      template = template.replace(/\{\{img\}\}/g, $img.get(0).outerHTML);

      // Replace all placeholders with the options for that image.
      Object.keys(data.options).forEach(function (value) {
        placeholderRegex = new RegExp('\\{\\{' + value + '\\}\\}', 'g');
        template = template.replace(placeholderRegex, data.options[value]);
      });

      // Remove all tags which got not replaced.
      template = template.replace(/\{\{[^}]+\}\}/g, '');

      return $(template);
    },

    // http://stackoverflow.com/a/6274398
    shuffleSlides: function () {
      var counter = this.slides.length, temp, index;

      while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;

        // And swap the last element with it
        temp = this.slides[counter];
        this.slides[counter] = this.slides[index];
        this.slides[index] = temp;
      }
    },

    nextSlide: function () {
      this.finishAnimation();
    },

    start: function () {
      this.animating = false;
      this.startAnimation();
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
          new Plugin(this, options));
      }
    });
  };
}(jQuery, window, document));
