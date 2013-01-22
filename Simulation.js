"use strict";
$(document).ready(function () {

  /* -------------------- UTILITY FUNCTIONS ----------------------- */

  var tell = function (msg, color) {
    $('p.output').text(msg).css("color", color);
  };

  // From JSAV utils: Get parameters from the URL
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
    if (name) // name was passed but param was not found, return undefined
      { return; }
    return vars;
  };


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

  // Take string with a number in it and return that string
  // with commas in the number
  $.fn.commas = function(){ 
    return this.each(function(){ 
      $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
		     })
  }

  /* --------------- BUTTON AND FIELD HANDLERS--------------------- */

  // Handler for Fertility button
  function fertility() {
    tell("Clicked on Fertility button.", "red");
  }

  // Handler for simForward button
  function simForward() {
    tell("Clicked on simForward button.");
    // Copy record for next sim step
    var curr = simState.sim[simState.currSim];
    var posit = curr.year.length;
    console.log("Posit: " + posit);
    curr.year[posit] = curr.year[posit-1];
    curr.pop[posit] = curr.pop[posit-1];
    console.log("simForward: " + simState.sim[simState.currSim].year[posit]);   
    console.log("simForward: " + simState.sim[simState.currSim].pop[posit]);   
    for (var i = 0; i < 5; i++) { // We display every 5 years
      advanceSimState();
    }
    console.log("advanced: " + simState.sim[simState.currSim].year[posit]);   
    console.log("advanced: " + simState.sim[simState.currSim].pop[posit]);   
    $('#simBackButton').removeAttr('disabled');
    displayState();
    if (posit == MaxSteps) {
      $('#simForwardButton').attr('disabled', 'disabled');
    }
  }

  // Handler for simBack button
  function simBack() {
    tell("Clicked on simBack button.");
    // Remove the current simulation state record
    var curr = simState.sim[simState.currSim];
    curr.year.length = curr.year.length - 1;
    curr.pop.length = curr.pop.length - 1;
    $('#simForwardButton').removeAttr('disabled');
    displayState();
    if (curr.year.length === 1) {
      console.log("Disable Back button");
      $('#simBackButton').attr('disabled', 'disabled');
    }
  }

  // Handler for Reset option
  function reset() {
    console.log("Clicked reset");
    $('p.currYearField1').text('');
    $('p.currPopField1').text('');
    $('p.currYearField2').text('');
    $('p.currPopField2').text('');
    initSimState();
    for (var i = 1; i <= 4; i++) {
      xArray[i] = [];
      yArray[i] = [];
    }
    displayState();
  }

  // Handler for Another Simulation option
  function anotherSim() {
    console.log("Clicked anotherSim");
    if (simState.currSim === 2) { 
      tell("Can only have three simulations at once. Reset if you want a new simulation.");
      return;
    }
    initSim(++simState.currSim);
    displayState();
  }


  /* ------------------ SIMULATION SUPPORT ------------------------ */

  // Initialize the simulation state variable, and initialize the display
  function initSimState() {
    simState.currSim = 0;
    simState.sim = [];
    simState.sim[0] = {};
    simState.sim[1] = {};
    simState.sim[2] = {};
    simState.fertility = initCountry.fertility;
    simState.growthRate = initCountry.growthRate;
    simState.lifeExp = initCountry.lifeExp;
    simState.netMigration = initCountry.netMigration;
    initSim(0);
    $('p.initPopField').text('Initial Population: ' + initCountry.initPop).commas();
    $('p.childrenField').text(simState.fertility.toFixed(1) + ' Children');
    $('p.lifeExpField').text(simState.lifeExp.toFixed(1) + ' Years');
    $('p.netMigField').text(simState.netMigration).commas();
    $('.anotherSim').removeAttr('disabled');
    displayState();
  }

  // Initialize the state for one of the three simulations
  function initSim(simNum) {
    console.log("In initSim: " + simNum);
    simState.sim[simNum].pop = [];      // One for each simulation point
    simState.sim[simNum].year = [];
    simState.sim[simNum].pop[0] = initCountry.initPop;
    simState.sim[simNum].year = []; // One for each simulation point
    simState.sim[simNum].year[0] = initCountry.startYear;
    $('#simForwardButton').removeAttr('disabled');
    $('#simBackButton').attr('disabled', 'disabled');
  }

  // Trigger reading the country file and check for errors
  function initCountryObject(filename) {
    var dataURL = buildURL(filename);
    console.log("dataURL: " + dataURL);
    $.getScript(dataURL, function () { // getScript fetches the file
      initCountry = setCountry(); // setCountry is in the data file
      $('p.countryField').text(initCountry.name);
      initSimState();
    }).fail(function(j, settings, exc) {
      tell("Oops! This page was called with a bad country file name: " + filename, "red");
    });
  }

  // Display the current simulation state
  function displayState() {
    var i;
    $('p.currYearField0').text('Year: ' + simState.sim[0].year.slice(-1)[0]);
    $('p.currPopField0').text('Population: ' + simState.sim[0].pop.slice(-1)[0]).commas();
    if (simState.currSim !== 0) {
      $('p.currYearField1').text('Year: ' + simState.sim[1].year.slice(-1)[0]);
      $('p.currPopField1').text('Population: ' + simState.sim[1].pop.slice(-1)[0]).commas();
    }
    if (simState.currSim === 2) {
      $('p.currYearField2').text('Year: ' + simState.sim[2].year.slice(-1)[0]);
      $('p.currPopField2').text('Population: ' + simState.sim[2].pop.slice(-1)[0]).commas();
    }
    console.log("Display: " + simState.currSim);
    xArray[0] = dummyYear;
    yArray[0] = dummyPop;
    for (i=0; i<= simState.currSim; i++) {
      xArray[i+1] = simState.sim[i].year;
      yArray[i+1] = simState.sim[i].pop;
    }
    console.log("Chart values: |" + xArray + "|, |" + yArray + "|");
    if (rChart !== undefined) { rChart.remove(); }
    rChart = rChartPanel.linechart(70, 10, 370, 170, xArray, yArray,
	   {axis: '0 0 1 1', axisxstep: 8,
            symbol: ['', 'circle', 'circle', 'circle'],
            colors: ['transparent', '#995555', '#559955', '#555599']});
      // WARNING: To display raw values,
      //   convert Female[i] to -Female[i]
      //   convert Male[i] to Female[i] + Male[i]
      var i;
      var mvals = [];
      var fvals = [];
      for (i=0; i< initCountry.malePop.length; i++) {
        mvals[i] = initCountry.malePop[i] + initCountry.femalePop[i];
        fvals[i] = -initCountry.femalePop[i];
      }
      PyrValues[0] = fvals;
      PyrValues[1] = mvals;
      console.log("Pyramid: " + fvals + ", " + mvals + ", " + PyrValues);
      rPyramid = rPyramidPanel.hbarchart(175, 25, 150, 180, PyrValues, {stacked: true});
  }

  // Advance the current simulation state by one year
  function advanceSimState() {
    var currSim = simState.sim[simState.currSim];
    var posit = currSim.year.length - 1;
    console.log("advance growthRate: " + simState.growthRate);
    currSim.year[posit]++;
    if (simState.currSim === 0) {
      currSim.pop[posit] = Math.round(currSim.pop[posit] * simState.growthRate);
    } else if (simState.currSim === 1) {
      currSim.pop[posit] = Math.round(currSim.pop[posit] * simState.growthRate/2.0);
    } else if (simState.currsim === 2) {
      currSim.pop[posit] = Math.round(currSim.pop[posit]);
    }
  }


  /* ------------------ START HERE ---------------------------- */

  // Generic message for  output window when there is nothing special to do
  var generalMsg = "You can click on the 'Options' button to choose from among the available simulation features, click on the 'Sim' button to advance the simulation, or click on one of the other buttons to set simulation parameters.";

  var initCountry;   // Initial country values from data file
  var MaxSteps = 8;  // Total number of simulation steps supported (2010-2050)
  var simState = {}; // Current simulation state object, it holds everything
  var rChart;        // graphael line chart object
  var rPyramid;      // graphael population pyramid object
  var xArray = [];
  var yArray = [];
  var PyrValues = [];

  // Dummy data series used to fix x axis on rChart
  var dummyYear = [2050];
  var dummyPop = [0];

  // Set up the interface

  // Pyramid Panel
  var rPyramidPanel = new Raphael("pyramidPanel", 350, 300);

  // Population chart panel
  var rChartPanel = new Raphael("popChartPanel", 450, 270);
  rChartPanel.rect( 27, 203, 126, 60);
  rChartPanel.rect(163, 203, 126, 60);
  rChartPanel.rect(299, 203, 126, 60);

  // Simulation panel
  var rSim = new Raphael("simPanel", 255, 300);
  rSim.rect(5, 20, 245, 200);
  rSim.path("M20 50 L230 50");
  $('p.initPopField').text("Initial Population:");

  tell(generalMsg);

  var filename = getQueryParameter("filename");
  if ((filename === undefined) || (filename === "undefined"))
    { tell("Ooops! This page was opened with no file name given! Pehaps you tried to open it directly, instead of through IntlPop.html", "red"); }
  else if (filename === "")
    { tell("Ooops! Empty file name!", "red"); }
  else {
    var dataURL = initCountryObject(filename);
  }

  /* ------------------ Button Callbacks ------------------------- */
  $('#fertilityButton').click(fertility);
  $('#simForwardButton').click(simForward);
  $('#simBackButton').click(simBack);
  $('.reset').click(reset);
  $('.anotherSim').click(anotherSim);
});
