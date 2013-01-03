"use strict";
/*global alert*/
(function ($) {

  function About() {
    console.log("Hello");
    alert("IntlPop Version 3.0\nWritten by Cliff Shaffer, 2013\nFor more information, see http://geosim.cs.vt.edu/IntlPop\nSource and development history available at\nhttps://github.com/cashaffer/IntlPop\nThis is Version " + version());
  }

  // Action callbacks for form entities
  $('#about').click(About);
}(jQuery));
