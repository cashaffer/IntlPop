"use strict";
/*global console setCountry */
$(document).ready(function() {

  /* -------------------- UTILITY FUNCTIONS ----------------------- */
  var tell = function(msg, color) {
    $('p.output').text(msg).css("color", color);
  }

  // From JSAV utils: Get parameters from the URL

  function getQueryParameter(name) {
    var params = window.location.search,
      vars = {},
      i,
      pair;
    if (params) {
      params = params.slice(1).split('&'); // get rid of ?
      for (i = params.length; i--;) {
        pair = params[i].split('='); // split to name and value
        vars[pair[0]] = decodeURIComponent(pair[1]); // decode URI
        if (name && pair[0] === name) {
          return pair[1]; // if name requested, return the matching value
        }
      }
    }
    if (name) // name was passed but param was not found, return undefined
    {
      return;
    }
    return vars;
  }

  // Based on the URL of the current page, build the URL for a data file
  function urlForDataFile(filename) {
    var pathArray = window.location.pathname.split('/');
    var theURL = window.location.protocol + "//" + window.location.host;
    for (var i = 0; i < pathArray.length - 1; i++) {
      theURL += pathArray[i];
      theURL += "/";
    }
    theURL += "CountryData/" + filename;
    console.log("Data URL is: " + theURL);
    return theURL;
  }

  // Formats a string with a large number
  // adds commas in the appropriate places
  // Returns a string
  $.fn.formatNumberCommas = function() {
    return this.each(function() {
      $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    });
  };



  var pyramidValsWereChanged = function(mVals, fVals) {
    console.log(mVals);
    console.log(fVals);
  }

  // Init Pyramid Panel
  // Generates random populations between 0 and 2000000
  var randomList = function() { // For Testing
    var list = [];
    for (var i = 1; i <= 20; i++) {
      list.push(Math.floor(Math.random() * 1900000) + 1);
    }
    return list;
  }
  P.initPyramid(2000000);
  P.drawPyramid(randomList(), randomList(), pyramidValsWereChanged);
  
});