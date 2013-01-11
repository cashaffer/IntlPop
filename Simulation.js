"use strict";
(function ($) {
  var tell = function (msg) { $('p.output').text(msg); };

  // Set up the interface
  var rSim = new Raphael("simPanel", 255, 300);
  rSim.rect(5, 20, 245, 200);
  $('p.initPop').text("Initial Population:");

  tell("Click on the 'Options' button to choose from among the available simulation features.");

  // Handler for Fertility button
  function fertility() {
    tell("Clicked on Fertility button.");
  }

  // Handler for Fertility button
  function simForward() {
    tell("Clicked on simForward button.");
    $('p.initPop').text("New Population: 0");
  }

  // Button callbacks
  $('#fertilityButton').click(fertility);
  $('#simForwardButton').click(simForward);
}(jQuery));
