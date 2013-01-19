"use strict";
$(document).ready(function () {
  var tell = function (msg) { $('p.output').text(msg); };

  // From JSAV utils
  function getQueryParameter(name) {
    var params = window.location.search,
      vars = {},
      i,
      pair;
    if (params) {
      params = params.slice(1).split('&'); // get rid of ?
      for (i=params.length; i--; ) {
        pair = params[i].split('='); // split to name and value
        vars[pair[0]] = decodeURIComponent(pair[1]); // decode URI
        if (name && pair[0] === name) {
          return pair[1]; // if name requested, return the matching value
        }
      }
    }
    if (name) { return; } // name was passed but param was not found, return undefined
    return vars;
  };


  $.fn.commas = function(){ 
    return this.each(function(){ 
      $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
		     })
  }

  var country; // This will hold the current country record

  // Current simulation state
  var currYear;
  var currPop;
  var currChildren;
  var currLifeExp;
  var currNetMig;
  var PopxPoints = [];
  var PopyPoints = [];
  var PyrValues = [];
  var rChart;
  var rPyramid;

  // Set up the interface

  // Pyramid Panel
  var rPyramidPanel = new Raphael("pyramidPanel", 350, 300);

  // Population chart panel
  var rChartPanel = new Raphael("popChartPanel", 500, 300);
  rChartPanel.rect( 27, 218, 126, 60);
  rChartPanel.rect(163, 218, 126, 60);
  rChartPanel.rect(299, 218, 126, 60);

  // Simulation panel
  var rSim = new Raphael("simPanel", 255, 300);
  rSim.rect(5, 20, 245, 200);
  rSim.path("M20 50 L230 50");
  $('p.initPopField').text("Initial Population:");

  tell("Click on the 'Options' button to choose from among the available simulation features.");

  var params = getQueryParameter();
  console.log(params.filename);
  // TODO: TEST HERE FOR PROPER FILE NAME PARAMETER
  if (params.filename === null) { tell("Ooops! No file name!"); }

   var dataURL = selectCountry(params.filename);

  // Handler for Fertility button
  function fertility() {
    tell("Clicked on Fertility button.");
  }

  // Based on the URL of the current page, build the URL for a data file
  function buildURL(filename) {
    var pathArray = window.location.pathname.split( '/' );
    var theURL = window.location.protocol + "//" + window.location.host;
    for ( var i = 0; i < pathArray.length - 1; i++ ) {
      theURL += pathArray[i];
      theURL += "/";
    }
    theURL += filename;
console.log("Data URL is: " + theURL);
    return theURL;
  }

  function selectCountry(filename) {
    var dataURL = buildURL(filename);
    console.log("dataURL: " + dataURL);
    $.getScript(dataURL, function () {
      country = setCountry(); // This loads the country
      console.log("Back now: " + country.name);
      $('p.countryField').text(country.name);
      currPop = country.initPop;
      currYear = country.startYear;
      currChildren = country.children;
      currLifeExp = country.lifeExp;
      currNetMig = country.netMigration;
      $('p.initPopField').text('Initial Population: ' + currPop).commas();
      $('p.currYearField').text('Year: ' + currYear);
      $('p.currPopField').text('Population: ' + currPop).commas();
      $('p.childrenField').text(currChildren.toFixed(1) + ' Children');
      $('p.lifeExpField').text(currLifeExp.toFixed(1) + ' Years');
      $('p.netMigField').text(currNetMig).commas();
      $('#simForwardButton').removeAttr('disabled');
      PopxPoints.length = 0;
      PopyPoints.length = 0;
      PopxPoints[0] = currYear;
      PopyPoints[0] = currPop;
      rChart = rChartPanel.linechart(70, 25, 370, 180, PopxPoints, PopyPoints, {axis: '0 0 1 1', symbol: 'circle'});
      // WARNING: To display raw values,
      //   convert Female[i] to -Female[i]
      //   convert Male[i] to Female[i] + Male[i]
      var i;
      var mvals = [];
      var fvals = [];
      for (i=0; i< country.malePop.length; i++) {
        mvals[i] = country.malePop[i] + country.femalePop[i];
        fvals[i] = -country.femalePop[i];
      }
      PyrValues[0] = fvals;
      PyrValues[1] = mvals;
      console.log("Pyramid: " + fvals + ", " + mvals + ", " + PyrValues);
      rPyramid = rPyramidPanel.hbarchart(175, 25, 150, 180, PyrValues, {stacked: true});
    });
  }

  // Handler for simForward button
  function simForward() {
    tell("Clicked on simForward button.");
    currPop = Math.round(currPop * country.growthRate);
    currYear = currYear + 1;
    $('p.currYearField').text('Year: ' + currYear);
    $('p.currPopField').text('Population: ' + currPop).commas();
    $('#simBackButton').removeAttr('disabled');
    PopxPoints[PopxPoints.length] = currYear;
    PopyPoints[PopyPoints.length] = currPop;
    console.log("PopxPoints: " + PopxPoints);
    rChart.remove();
    rChart = rChartPanel.linechart(70, 25, 370, 180, PopxPoints, PopyPoints, {axis: '0 0 1 1', symbol: 'circle'});
  }

  // Handler for simForward button
  function simBack() {
    tell("Clicked on simBack button.");
    currPop = Math.round(currPop / country.growthRate);
    currYear = currYear - 1;
    $('p.currYearField').text('Year: ' + currYear);
    $('p.currPopField').text('Population: ' + currPop).commas();
    if (currYear === country.startYear) {
      console.log("Disable Back button");
      $('#simBackButton').attr('disabled', 'disabled');
    }
  }

  // Button callbacks
  $('#fertilityButton').click(fertility);
  $('#simForwardButton').click(simForward);
  $('#simBackButton').click(simBack);
});
