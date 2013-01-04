"use strict";
/*global alert*/
(function ($) {
  var simWindowFeatures = "height=400,width=600";

  // Process about button: Pop up an alert
  function about() {
    alert("IntlPop Version 3.0\nWritten by Cliff Shaffer, 2013\nFor more information, see http://geosim.cs.vt.edu/IntlPop\nSource and development history available at\nhttps://github.com/cashaffer/IntlPop\nThis is Version " + version());
  }

  // Process help button: Give a full help page for this activity
  function help() {
    var myRef = window.open("IntlPopHelp.html", 'helpwindow');
  }

  // Process new button: Create a new instance of a simulation
  function newsim() {
    var myRef = window.open("Simulation.html", '', simWindowFeatures);
    if (myRef === null) {
      console.log("Unable to open simulation window");
    }
  }

  // Action callbacks for form entities
  $('#about').click(about);
  $('#help').click(help);
  $('#new').click(newsim);
}(jQuery));
