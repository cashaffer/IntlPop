"use strict";
(function ($) {
  var tell = function (msg) { $('p.output').text(msg); };
  var inputFileLines; /* This will hold the country data */

  // Set up the interface
  var rSim = new Raphael("simPanel", 255, 300);
  rSim.rect(5, 20, 245, 200);
  rSim.path("M20 50 L230 50");
  var initPopField = rSim.text(125, 35, "Initial Population:");
  var currYearField = rSim.text(125, 65, "");
  var currPopField = rSim.text(125, 80, "");
  var currYear = 2010;
  var currPop = 0;

  tell("Click on the 'Options' button to choose from among the available simulation features.");

  // Handler for Fertility button
  function fertility() {
    tell("Clicked on Fertility button.");
  }


  // Handler for options button
  function options() {
    tell("Clicked on simOptions button.");
    if (readFile("http://algoviz.org/IntlPop/US.txt") === true) {
console.log("Back now: " + inputFileLines[0]);
      initPopField.attr('text', 'Initial Population: ' + inputFileLines[1]);
      currYearField.attr('text', 'Year: ' + inputFileLines[2]);
      currPopField.attr('text', 'Population: ' + inputFileLines[1]);
    }
  }

  // Handler for simForward button
  function simForward() {
    tell("Clicked on simForward button.");
    currPop = currPop * inputFileLines[3];
    currYear = currYear + 1;
    currYearField.attr('text', 'Year: ' + currYear);
    currPopField.attr('text', 'Population: ' + currPop);
  }

  // Stub function for reading data files
  function readFile(theURL) {
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", theURL, false);
    txtFile.onreadystatechange = function () {
console.log("Inside");
      if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
console.log("Ready to parse");
        if (txtFile.status === 200) {  // Makes sure it's found the file.
console.log("Found file");
          inputFileLines = txtFile.responseText.split("\n"); // Will separate each line into an array
console.log("Read it in.");
console.log(inputFileLines[0]);
        }
        else {
console.log("Failed to read");
          alert("Unable to find file " + theURL);
          return false;
        }
      }
      else {
console.log("Document not ready");
        alert("Document not ready");
        return false;
      }
    };
    return txtFile.send(null);
  }


  // Button callbacks
  $('#fertilityButton').click(fertility);
  $('#simForwardButton').click(simForward);
  $('#simOptionsButton').click(options);
}(jQuery));
