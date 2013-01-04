"use strict";
/*global alert*/
(function ($) {

  // Process about button: Pop up an alert
  function about() {
    alert("IntlPop Version 3.0\nWritten by Cliff Shaffer, 2013\nFor more information, see http://geosim.cs.vt.edu/IntlPop\nSource and development history available at\nhttps://github.com/cashaffer/IntlPop\nThis is Version " + version());
  }

  // Process help button: Give a full help page for this activity
  function help() {
    var myRef = window.open("IntlPopHelp.html", 'helpwindow');
  }

  // Action callbacks for form entities
  $('#about').click(about);
  $('#help').click(help);
}(jQuery));
