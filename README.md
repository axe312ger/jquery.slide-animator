jquery.slide-animator
========
[![devDependency Status](https://david-dm.org/axe312ger/jquery.slide-animator/dev-status.svg)](https://david-dm.org/axe312ger/jquery.slide-animator#info=devDependencies)

This library can be used to map animations to a list of images. The animations will run after each other. The typical usecase might be an image slideshow.

# Why?
My usecase was to optimize a fullscreen background image slideshow with scaling images, opacity and other moving elements on the website. The original code used elements with css background images including ```background-size: cover;``` to resize these images to the viewport. Since the images had to scale also, the performance was very spiky and low.

The solution was to go back to the good old ```<img/>``` tag.

This ended up in a huge performance gain. Switching to images increased the average frames per second from 51.33fps to 58.67fps while the minimum fps increased from 2.17fps to 25.39fps.


# How

The images are lazy loaded from a simple json document, while only two are rendered at the same time. While the first one animates, the other one lays below to allow a smooth fade to the next image. When the animation is done, the first is moved behind the second one and the src attribute will be replaced with the next image. When the second one is succesfully loaded, the animation begins again.

The animation effects and everything else is completely in your hand.

## Performance comparison

To give you an overview of the performance improvements this library can offer, here are some screenshots from the performance tests I did for a customer. The website has a full screen background image slideshow with transitions, scaling, opacity and some other moving elements.

I will publish the URI as soon as the website is online :)

This is the timeline for the old custom code in the project. The minimum fps is at 2.17fps and there are many visible spikes. You can also see the performance issues caused by loading all images at once and without preloading.
![Performance without jquery.slide-animator](/media/performance-custom-code.png?raw=true)

This is the timeline with jquery.slide-animator, but with div's instead of images. Its already way better, the minimum fps increased to 4.30, but there are still a lot of spikes.
![Performance with divs](/media/performance-div.png?raw=true)

This is the timeline with jquery.slide-animator and real images. With real images, the performance is great. The minimum fps rised to 25.39 and the last spikes are caused by network requests from other scripts.
![Performance with images](/media/performance-img.png?raw=true)

# Usage
## HTML

Any block element which can contain children is suitable.
```HTML
<div class="backgroundAnimationContainer"></div>
```

Load the library js & css files
```HTML
<script src="assets/vendor/jquery.slide-animator/jquery.slide-animator.js"></script>
```

## CSS
You may want to fill the parent/body and avoid content overflow. You also need to create a class to trigger the animation.
```CSS
.backgroundAnimationContainer {
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.backgroundAnimation {
  animation: imageAnimation 10s linear;
}
@keyframes imageAnimation {
  0% {
    transform: scale(1);
  } 
  85% {
    transform: scale(1.2);
  } 
  100% {
    opacity: 0;
    transform: scale(1.25);
  } 
}
```
## JSON Source
The JSON document is a simple list of slides. You can alter the root and child parameters.
```JSON
{
  "slides": [{
    "slide": {
      "src": "/assets/images/1.jpg",
      "caption": "very nice"
    }
  }, {
    "slide": {
      "src": "/assets/images/2.jpg",
      "caption": "awesome"
    }
  }]
}
```
## JS
```JavaScript
(function ($) {
  $('.col').cssImageAnimator({
    src: 'images.json',
    animationClass: 'backgroundAnimation',
    urlParam: 'src'
  });
}(jQuery));
```

Look at the performance tests in the "test" directory for a working example.

# API

## cssImageAnimator(options:Array)

Default options below:

```JavaScript
$('.any-block-element').cssImageAnimator({
  src: '//example.com/ajax/slides.json', // Required
  animationClass: '', // Required
  urlParam: 'image.src', // Required
  template: '<figure>{{img}}<figcaption>{{caption}}</figcaption></figure>',
  cssClass: 'jquery-slide-animator',
  animatingClass: 'animating',
  root: 'slides',
  child: 'slide',
  preLoadImages: 5,
  loop: true,
  shuffle: false,
  autostart: true,
  fitToContainer: true,
  backgroundImage: false,
  animateBackslide: false
 });
```

### options.src
**required**
Uri to the json file containing the images

### options.animationClass
**required**
Class which will be applied to the first slide to trigger the animation

### options.urlParam
**required**
Path to the attribute containing the image source

### options.template
Mustache-like template for the slide generation. All placeholders matching the key of attributes on the first level of the child element will be replaced.

### options.cssClass
Class applied to the wrapper element to indicate this plugin is loaded.

### options.animatingClass
Class applied to the wrapper element to indicate this plugin is animating. 

### options.root
Key of the root element of the JSON document.

### options.child
Key of the child element of the JSON document.

### options.preLoadImages
Number of the images to preload.

### options.loop
Set to false to prevent looping of the animation.

### options.shuffle
Shuffle the slides before starting the animation.

### options.autostart
Set to false to disable autostart.

### options.fitToContainer
Set to false to disable automatic resize of the images to fill the parent container. Mimics style="background-size: cover;"

### options.backgroundImage
Set to true to create div elements with background images instead of image elements. Basically implemented for performance tests.

### options.animateBackslide
Set to true if you also want to animate the backslide.

## Events

### options.onAnimationStart
Callback for the start of the animation
```JavaScript
$('.any-block-element').cssImageAnimator({
  onAnimationStart: function (currentSlide, $frontSlide, $backSlide) {
  }
});
```

### options.onAnimationEnd
Callback for the end of the animation
```JavaScript
$('.any-block-element').cssImageAnimator({
  onAnimationEnd: function (currentSlide, $frontSlide, $backSlide) {
  }
});
```
