"use strict";
/*global console setCountry */
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
      for (i = params.length; i--;) {
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
  }


  // Based on the URL of the current page, build the URL for a data file
  function buildURL(filename) {
    var pathArray = window.location.pathname.split('/');
    var theURL = window.location.protocol + "//" + window.location.host;
    for (var i = 0; i < pathArray.length - 1; i++) {
      theURL += pathArray[i];
      theURL += "/";
    }
    theURL += "JS_Files/" + filename;
    console.log("Data URL is: " + theURL);
    return theURL;
  }

  // Take string with a number in it and return that string
  // with commas in the number
  $.fn.commas = function () {
    return this.each(function () {
      $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    });
  };

  /* --------------- BUTTON AND FIELD HANDLERS--------------------- */

  // Handler for Fertility Rate button
  function fertility() {
    tell("Open the fertility rate popup");
    $('#fertilityTargetValue').val("200");
    $('#fertilityTargetYear').val("1975");
    $('#fertilityPopup').show();
  }

  // Handler for Fertility Rate close button
  function fertilityclose() {
    tell("Close the fertility rate popup");
    console.log("Target value is " + $('#fertilityTargetValue').val());
    console.log("Target year is " + $('#fertilityTargetYear').val());
    $('#fertilityPopup').hide();
  }

  // Handler for Life Expectancy button
  function lifeexp() {
    tell("Open the life expectancy popup");
    $('#lifeExpTargetValue').val("300");
    $('#lifeExpTargetYear').val("1990");
    $('#lifeExpPopup').show();
  }

  // Handler for Fertility Rate close button
  function lifeexpclose() {
    tell("Close the life expectancy popup");
    console.log("Target value is " + $('#lifeExpTargetValue').val());
    console.log("Target year is " + $('#lifeExpTargetYear').val());
    $('#lifeExpPopup').hide();
  }

  // Handler for Net Migration button
  function netmig() {
    tell("Open the net migration popup");
    $('#migTargetValue').val("100");
    $('#migTargetYear').val("1950");
    $('#migPopup').show();
  }

  // Handler for Net Migration close button
  function netmigclose() {
    tell("Close the migration popup");
    console.log("Target value is " + $('#migTargetValue').val());
    console.log("Target year is " + $('#migTargetYear').val());
    $('#migPopup').hide();
  }

  // Handler for simForward button
  function simForward() {
    tell("Clicked on simForward button.");
    // Copy record for next sim step
    var curr = simState.sim[simState.currSim];
    curr.currstep += 1;
    var posit = curr.currstep;
    console.log("Posit: " + posit);
    curr.cstep[posit] = jQuery.extend(true, {}, curr.cstep[posit-1]);
    console.log("simForward: " + curr.cstep[posit].year);
    console.log("simForward: " + curr.cstep[posit].pop);
    for (var i = 0; i < stepSize; i++) { // How many years to advance
      advanceSimState(curr.cstep[posit]);
    }
    console.log("advanced: " + curr.cstep[posit].year);
    console.log("advanced: " + curr.cstep[posit].pop);
    $('#simBackButton').removeAttr('disabled');
    displayState();
    if (posit === maxSteps) {
      $('#simForwardButton').attr('disabled', 'disabled');
    }
  }

  // Handler for simBack button
  function simBack() {
    tell("Clicked on simBack button.");
    // Remove the current simulation state record
    simState.sim[simState.currSim].currstep -= 1;
    $('#simForwardButton').removeAttr('disabled');
    displayState();
    if (simState.sim[simState.currSim].currstep === 0) {
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
    simState.currSim += 1;
    initSim(simState.sim[simState.currSim].cstep[0]);
    displayState();
  }


  /* ------------------ SIMULATION SUPPORT ------------------------ */

  // Initialize the simulation state variable, and initialize the display
  function initSimState() {
    simState.currSim = 0;
    simState.sim = [];
    simState.sim[0] = {};
    simState.sim[0].cstep = [];
    simState.sim[0].currstep = 0;
    simState.sim[1] = {};
    simState.sim[1].cstep = [];
    simState.sim[1].currstep = 0;
    simState.sim[2] = {};
    simState.sim[2].cstep = [];
    simState.sim[2].currstep = 0;
    for (var i = 0; i < maxSteps; i++) {
      simState.sim[0].cstep[i] = {};
      simState.sim[1].cstep[i] = {};
      simState.sim[2].cstep[i] = {};
    }
    initSim(simState.sim[simState.currSim].cstep[0]);
    $('p.initPopField').text('Initial Population: ' + initPop()).commas();
    $('.anotherSim').removeAttr('disabled');
    displayState();
  }

  // Generate the initial population value by summing up the inputs
  function initPop() {
    var pop = 0;
    for (var i = 0; i < initCountry.malePop.length; i++) {
      if (i != 16) { // That column is for "80+"
	pop = pop + initCountry.malePop[i] + initCountry.femalePop[i];
      }
    }
    return pop*1000;
  }

  // Initialize the state for one of the three simulations
  function initSim(cStep) {
    var i, j, ipos;
    var currBRate;
    var leTemp, leDeaths;

    console.log("In initSim: " + simState.currSim);
    cStep.netMigration = initCountry.netMigration * 1000;
    cStep.pop = initPop();
    cStep.year = initCountry.startYear;

    // Calculate the yearly birth rates, and the TFR
    cStep.fertility = 0.0;
    cStep.birthrate = [];
    for (i = 0; i < 15; i++) { // The UN data show no births for ages 0-14
      cStep.birthrate[i] = 0;
    }
    for (i = 0; i < initCountry.births.length; i++) {
      cStep.fertility += (initCountry.births[i] / initCountry.femalePop[i + 3]);
      currBRate = (initCountry.births[i] / initCountry.femalePop[i + 3] * 0.2);
      for (j = 0; j < 5; j++) {
        cStep.birthrate[15 + i * 5 + j] = currBRate;
      }
    }

    // Calculate the yearly death rates (male and female)
    cStep.maleMortality = [];
    cStep.femaleMortality = [];
    for (i = 1; i < initCountry.maleMortality.length; i++) {
      var currMMRate = 1.0 - (initCountry.maleMortality[i] / initCountry.malePop[i] * 0.2);
      var currFMRate = 1.0 - (initCountry.femaleMortality[i] / initCountry.femalePop[i] * 0.2);
      for (j = 0; j < 5; j++) {
        cStep.maleMortality[i * 5 + j] = currMMRate;
        cStep.femaleMortality[i * 5 + j] = currFMRate;
      }
    }
    // UN data only goes up to 95+, so the 100+ bin needs special handling
    cStep.maleMortality[100] = 1.0 - ((1.0 - currMMRate) * 2.0);
    cStep.femaleMortality[100] = 1.0 - ((1.0 - currFMRate) * 2.0);
    // We have the IMR, so set it explicitly
    cStep.maleMortality[0] = 1.0 - (initCountry.infantMortality/1000.0);
    cStep.femaleMortality[0] = 1.0 - (initCountry.infantMortality/1000.0);
    // We need to treat years 1-4 specially, since most of those die in year 0.
    var births = 0;
    for (i = 0; i < initCountry.births.length; i++) {
      births += initCountry.births[i];
    }
    var deaths = (initCountry.maleMortality[0] * 1000.0) - (births * initCountry.infantMortality/2.0);
    currMMRate = 1.0 - (deaths/4.0)/(initCountry.malePop[0] * 200.0);
    deaths = (initCountry.femaleMortality[0] * 1000.0) - (births * initCountry.infantMortality/2.0);
    currFMRate = 1.0 - (deaths/4.0)/(initCountry.femalePop[0] * 200.0);
    console.log("Deaths: " + deaths);
    for (i = 1; i <= 4; i++) {
      cStep.maleMortality[i] = currMMRate;
      cStep.femaleMortality[i] = currFMRate;
    }

    // Calculate the life expectancy
    cStep.lifeExp = 0.0;
    var alive = 1000000.0; // A population to age to calculate life expectancy
    //    alive = alive * cStep.maleMortality[0]; // infant deaths don't contribute
    for (i = 1; i <= 100; i++) {
      leTemp = alive * ((cStep.maleMortality[i] + cStep.femaleMortality[i])/2.0);
      leDeaths = alive - leTemp;
      alive = leTemp;
      cStep.lifeExp += (leDeaths / 1000000.0) * (i - 0.5);
    }
    for (i = 0; i < 20; i++) { // Calculate a few more years for people over 100
      leTemp = alive * ((cStep.maleMortality[100] + cStep.femaleMortality[100])/2.0);
      leDeaths = alive - leTemp;
      alive = leTemp;
      cStep.lifeExp += (leDeaths / 1000000.0) * (100.5 + i);
    }

    // Calculate the yearly populations (male and female)
    cStep.malePop = [];
    cStep.femalePop = [];
    for (i = 0; i < (initCountry.malePop.length - 1); i++) {
      ipos = i;
      if (i !== 16) { // Position 16 is a special "80+" value, skip it
	if (ipos > 16) { // Again, this is to handle the "80+" column
          ipos = ipos - 1;
	}
	for (j = 0; j < 5; j++) {
          cStep.malePop[ipos * 5 + j] = initCountry.malePop[i] * 200;
          cStep.femalePop[ipos * 5 + j] = initCountry.femalePop[i] * 200;
	}
      }
    }
    cStep.malePop[100] = initCountry.malePop[21] * 1000;
    cStep.femalePop[100] = initCountry.femalePop[21] * 1000;
    console.log("Initial Male population:");
    console.log(cStep.malePop);
    console.log("Initial Female population:");
    console.log(cStep.femalePop);
    $('p.childrenField').text(cStep.fertility.toFixed(1) + ' Children');
    $('p.lifeExpField').text(cStep.lifeExp.toFixed(1) + ' Years');
    $('p.netMigField').text(cStep.netMigration).commas();
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
    }).fail(function (j, settings, exc) {
      tell("Oops! This page was called with a bad country file name: " + filename, "red");
    });
  }

  // Display the current simulation state
  function displayState() {
    var i;
    var curr = simState.sim[0].currstep;
    console.log("curr: " + curr);
    console.log("cstep: " + simState.sim[0].cstep[curr].year);
    $('p.currYearField0').text('Year: ' + simState.sim[0].cstep[curr].year);
    $('p.currPopField0').text('Population: ' +
                              simState.sim[0].cstep[curr].pop).commas();
    if (simState.currSim !== 0) {
      curr = simState.sim[1].currstep;
      console.log("curr 1: " + curr);
      console.log("cstep: " + simState.sim[1].cstep[curr].year);
      $('p.currYearField1').text('Year: ' + simState.sim[1].cstep[curr].year);
      $('p.currPopField1').text('Population: ' +
                              simState.sim[1].cstep[curr].pop).commas();
    }
    if (simState.currSim === 2) {
      curr = simState.sim[2].currstep;
      console.log("curr 2: " + curr);
      console.log("cstep: " + simState.sim[1].cstep[curr].year);
      $('p.currYearField2').text('Year: ' + simState.sim[2].cstep[curr].year);
      $('p.currPopField2').text('Population: ' +
                              simState.sim[2].cstep[curr].pop).commas();
    }
    console.log("Display: " + simState.currSim);

    // These next values are used to set the bounds of the chart
    xArray[0] = [initCountry.startYear + stepSize * maxSteps];
    yArray[0] = [0];

    var xdum = [];
    var ydum = [];
    for (i = 0; i <= simState.currSim; i++) {
      xdum[i] = []; ydum[i] = [];
      for (var j = 0; j <= simState.sim[i].currstep; j++) {
        xdum[i][j] = simState.sim[i].cstep[j].year;
        ydum[i][j] = simState.sim[i].cstep[j].pop;
      }
      xArray[i + 1] = xdum[i];
      yArray[i + 1] = ydum[i];
    }
    console.log("Chart values: |" + xArray + "|, |" + yArray + "|");
    if (rChart !== undefined) { rChart.remove(); }
    rChart = rChartPanel.linechart(70, 10, 370, 170, xArray, yArray,
           {axis: '0 0 1 1', axisxstep: maxSteps,
            symbol: ['', 'circle', 'circle', 'circle'],
            colors: ['transparent', '#995555', '#559955', '#555599']});

    // WARNING: To display raw values,
    //   convert Female[i] to -Female[i]
    //   convert Male[i] to Female[i] + Male[i]
    var mtemp;
    var ftemp;
    curr = simState.sim[simState.currSim].currstep;
    var cSim = simState.sim[simState.currSim].cstep[curr];
    var mvals = [];
    mvals.length = initCountry.malePop.length - 1;
    var fvals = [];
    for (i = 0; i < mvals.length - 1; i++) {
      mtemp = 0;
      ftemp = 0;
      for (j = 0; j < 5; j++) {
        mtemp += cSim.malePop[i * 5 + j];
        ftemp += cSim.femalePop[i * 5 + j];
      }
      mvals[mvals.length - (i + 1)] = mtemp + ftemp;
      fvals[mvals.length - (i + 1)] = -ftemp;
    }
    mvals[0] = cSim.malePop[100] + cSim.femalePop[100];
    fvals[0] = -cSim.femalePop[100];
    PyrValues[0] = fvals;
    PyrValues[1] = mvals;
    console.log("Pyramid: " + fvals + ", " + mvals + ", " + PyrValues);
    if (rPyramid !== undefined) { rPyramid.remove(); }
    rPyramid = rPyramidPanel.hbarchart(175, 25, 150, 250, PyrValues, {stacked: true}).hover(fin,fout);
    //    rPyramid.label(true, true);  // Puts up values to the right of bars
  }

  // Advance the current simulation state by one year
  function advanceSimState(currSim) {
    var i;
    currSim.year += 1;
    var temp = 0;
    for (i = 0; i <= 100; i++) {
      temp += currSim.malePop[i] + currSim.femalePop[i];
    }
    console.log("Year start pop: " + temp);
    var deaths = 0;
    for (i = 0; i <= 99; i++) {
      deaths += currSim.malePop[i] * currSim.maleMortality[i+1];
      deaths += currSim.femalePop[i] * currSim.femaleMortality[i+1];
    }
    deaths += currSim.malePop[100] * currSim.maleMortality[100];
    deaths += currSim.femalePop[100] * currSim.femaleMortality[100];
    console.log("Deaths should be: " + (temp - Math.round(deaths)));
    currSim.malePop[100] = Math.round(currSim.malePop[100] * currSim.maleMortality[100]
                             + currSim.malePop[99] * currSim.maleMortality[99]);
    currSim.femalePop[100] = Math.round(currSim.femalePop[100] * currSim.femaleMortality[100]
                               + currSim.femalePop[99] * currSim.femaleMortality[99]);
    for (i = 99; i > 0; i--) {
      currSim.malePop[i] = Math.round(currSim.malePop[i-1] * currSim.maleMortality[i]);
      currSim.femalePop[i] = Math.round(currSim.femalePop[i-1] * currSim.femaleMortality[i]);
    }
    var totalbirths = 0;
    for (i = 15; i < 50; i++) {
      totalbirths += currSim.femalePop[i] * currSim.birthrate[i];
    }
    console.log("Total births: " + Math.round(totalbirths));
    totalbirths = totalbirths * currSim.maleMortality[0]; // IMR
    var malefract = 0.5;
    var femalefract = 0.5;
    currSim.malePop[0] = Math.round(totalbirths * malefract);
    currSim.femalePop[0] = Math.round(totalbirths * femalefract);

    // Add (or subtract) for migration
    for (i = 0; i <= 16; i++) {
      for (var j = 0; j <= 4; j++) {
	currSim.malePop[5 * i + j] += Math.round(migMale[i] * currSim.netMigration/5000.0);
	currSim.femalePop[5 * i + j] += Math.round(migFemale[i] * currSim.netMigration/5000.0);
      }    
    }
    // Now, sum it all up and report it
    currSim.pop = 0;
    for (i = 0; i <= 100; i++) {
      currSim.pop += currSim.malePop[i];
      currSim.pop += currSim.femalePop[i];
    }
    console.log("Year end pop: " + currSim.pop);
    console.log("Net change was: " + (currSim.pop - temp));
  }

  /* ------------------ START HERE ---------------------------- */

  // Generic message for  output window when there is nothing special to do
  var generalMsg = "You can click on the 'Options' button to choose from among the available simulation features, click on the 'Sim' button to advance the simulation, or click on one of the other buttons to set simulation parameters.";

  var initCountry;   // Initial country data from data file
  var maxSteps = 8;  // Total number of simulation steps supported
  var stepSize = 10; // Number of years between each registered step in chart
  var simState = {}; // Current simulation state object, it holds everything
  var rChart;        // graphael line chart object
  var rPyramid;      // graphael population pyramid object
  var xArray = [];
  var yArray = [];
  var PyrValues = [];
  // These next two arrays contain the distribution for migrants by sex
  // and cohort. Each entry is for a 5-year cohort, starting with 0-4 and ending with 80+.
  // The numbers indicate migrants of that catagory out of
  // a total of 1000 migrants.  The total of all 34 numbers should be 1000.
  // Values are derived by averaging Figures 7 and 8 (p. 4-5) of 
  // http://pewhispanic.org/files/reports/107.pdf

  var migMale =   [ 6, 11, 14, 28, 48, 72, 70, 66, 60, 46, 36, 27, 17, 13,  9,  6,  6];
  var migFemale = [ 5, 13, 16, 23, 35, 48, 54, 55, 49, 39, 33, 27, 20, 15, 13, 10, 13];

  // Set up the interface

  // Pyramid Panel
  var rPyramidPanel = new Raphael("pyramidPanel", 350, 300),
fin = function () {
  this.flag = rPyramidPanel.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
},
fout = function () {
  this.flag.animate({opacity: 0}, 300, function () {this.remove();});
};

  // Population chart panel
  var rChartPanel = new Raphael("popChartPanel", 450, 270);
  rChartPanel.rect(27, 203, 126, 60);
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
  $('#fertilityPopupclose').click(fertilityclose);
  $('#lifeExpButton').click(lifeexp);
  $('#lifeExpPopupclose').click(lifeexpclose);
  $('#netMigButton').click(netmig);
  $('#migPopupclose').click(netmigclose);
  $('#simForwardButton').click(simForward);
  $('#simBackButton').click(simBack);
  $('.reset').click(reset);
  $('.anotherSim').click(anotherSim);
});
