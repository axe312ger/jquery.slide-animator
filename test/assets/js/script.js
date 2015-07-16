'use strict';

(function ($) {
  function moar() {
    var r, c, $row;
    var count = $('main').children().length;
    count++;

    $('main').empty();
    for (r = 0; r < count; r++) {
      $row = $('<div class="row"/>');
      for (c = 0; c < count; c++) {
        $row.append($('<div class="col"/>'));
      }

      $row.appendTo('main');
    }

    $('.col').slideAnimator({
      src: '/assets/json/images.json',
      animationClass: 'background-animation',
      urlParam: 'src',
      shuffle: true
    });
  }

  $(function () {
    moar();
    $('#moar').on('click', moar);
  });
}(jQuery));
