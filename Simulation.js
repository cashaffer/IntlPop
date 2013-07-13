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
      vars = {}, i, pair;
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
    if (name) { // name was passed but param was not found, return undefined
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

  // Format a string that represents a large number by
  // adding commas in the appropriate places
  // Returns a string
  $.fn.formatNumberCommas = function() {
    return this.each(function() {
      $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    });
  };

  /* --------------- BUTTON AND FIELD HANDLERS --------------------- */

  function fertilityButtonClick() {
    var curr = simState.sim[simState.currSim];
    tell("Opened the fertility rate popup");
    $('#fertilityTargetValue').val(curr.cstep[curr.currstep].targetFertilityValue);
    $('#fertilityTargetYear').val(curr.cstep[curr.currstep].targetFertilityYear);
    $('#fertilityPopup').show();
  }

  function fertilityCloseButtonClick() {
    var curr = simState.sim[simState.currSim];
    var currstep = curr.cstep[curr.currstep];
    tell("Closed the fertility rate popup");
    currstep.targetFertilityValue = $('#fertilityTargetValue').val();
    currstep.targetFertilityYear = $('#fertilityTargetYear').val();
    console.log("Target value is " + $('#fertilityTargetValue').val());
    console.log("Target year is " + $('#fertilityTargetYear').val());
    if (currstep.targetFertilityYear == currstep.year) {
      console.log("Set the display field for fertility");
      $('p#fertilityField').text(currstep.targetFertilityValue).formatNumberCommas();
    }
    // TODO: Validate the values set in the fields here
    // TODO: If they are bad, then reset them to current values (?)
    $('#fertilityPopup').hide();
  }

  function lifeExpButtonClick() {
    var curr = simState.sim[simState.currSim];
    tell("Opened the life expectancy popup");
    $('#lifeExpTargetValue').val(curr.cstep[curr.currstep].targetLifeExpValue);
    $('#lifeExpTargetYear').val(curr.cstep[curr.currstep].targetLifeExpYear);
    $('#lifeExpPopup').show();
  }

  function lifeExpCloseButtonClick() {
    var curr = simState.sim[simState.currSim];
    var currstep = curr.cstep[curr.currstep];
    tell("Closed the life expectancy popup");
    currstep.targetLifeExpValue = $('#lifeExpTargetValue').val();
    currstep.targetLifeExpYear = $('#lifeExpTargetYear').val();
    console.log("Target value is " + $('#lifeExpTargetValue').val());
    console.log("Target year is " + $('#lifeExpTargetYear').val());
    if (currstep.targetLifeExpYear == currstep.year) {
      console.log("Set the display field for lifeExp");
      $('p#lifeExpField').text(currstep.targetLifeExpValue).formatNumberCommas();
    }
    // TODO: Validate the values set in the fields here
    // TODO: If they are bad, then reset them to current values (?)
    $('#lifeExpPopup').hide();
  }

  function netMigButtonClick() {
    var curr = simState.sim[simState.currSim];
    tell("Opened the net migration popup");
    $('#netMigTargetValue').val(curr.cstep[curr.currstep].targetMigValue);
    $('#netMigTargetYear').val(curr.cstep[curr.currstep].targetMigYear);
    $('#netMigPopup').show();
  }

  function netMigCloseButtonClick() {
    var curr = simState.sim[simState.currSim];
    var currstep = curr.cstep[curr.currstep];
    tell("Closed the migration popup");
    currstep.targetMigValue = $('#netMigTargetValue').val();
    currstep.targetMigYear = $('#netMigTargetYear').val();
    console.log("Closed the migration popup. Target year: " +
      currstep.targetMigYear + ", target value: " + currstep.targetMigValue);
    if (currstep.targetMigYear == currstep.year) {
      console.log("Set the display field for migration");
      $('p#netMigField').text(currstep.targetMigValue).formatNumberCommas();
    }
    // TODO: Validate the values set in the fields here
    // TODO: If they are bad, then reset them to current values (?)
    $('#netMigPopup').hide();
  }

  function simForwardButtonClick() {
    tell("Clicked on simForward button.");
    // Copy record for next sim step
    var curr = simState.sim[simState.currSim];
    curr.currstep += 1;
    var posit = curr.currstep;
    console.log("Posit: " + posit);
    curr.cstep[posit] = jQuery.extend(true, {}, curr.cstep[posit - 1]);
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

  function simBackButtonClick() {
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

  function newSimButtonClick() {
    console.log("Clicked anotherSim");
    if (simState.currSim === 2) {
      tell("Can only have three simulations at once. Reset if you want a new simulation.");
      return;
    }
    simState.currSim += 1;
    initSim(simState.sim[simState.currSim].cstep[0]);
    displayState();
  }


  function resetButtonClick() {
    console.log("Clicked reset");
    $('p.currYearField.field1').text('');
    $('p.currPopField.field1').text('');
    $('p.currYearField.field2').text('');
    $('p.currPopField.field2').text('');
    initSimState();
    for (var i = 1; i <= 4; i++) {
      xArray[i] = [];
      yArray[i] = [];
    }
    displayState();
  }

  /* ------------------ Button Callbacks ------------------------- */
  
  $('#fertilityButton').click(fertilityButtonClick);
  $('#fertilityCloseButton').click(fertilityCloseButtonClick);
  $('#lifeExpButton').click(lifeExpButtonClick);
  $('#lifeExpCloseButton').click(lifeExpCloseButtonClick);
  $('#netMigButton').click(netMigButtonClick);
  $('#netMigCloseButton').click(netMigCloseButtonClick);
  $('#simForwardButton').click(simForwardButtonClick);
  $('#simBackButton').click(simBackButtonClick);
  $('#newSimButton').click(newSimButtonClick);
  $('#resetButton').click(resetButtonClick);

  /* ------------------ SIMULATION SUPPORT ------------------------ */

  // Initialize the simulation state variable, and initialize the display
  function initSimState() {
    simState.currSim = 0;
    simState.sim = [{ cstep: [], currstep: 0 },
                    { cstep: [], currstep: 0 },
                    { cstep: [], currstep: 0 } ];
    for (var i = 0; i < maxSteps; i++) {
      simState.sim[0].cstep[i] = {};
      simState.sim[1].cstep[i] = {};
      simState.sim[2].cstep[i] = {};
    }
    initSim(simState.sim[simState.currSim].cstep[0]); // Initialize the first simulation
    $('p#initialPopField').text('Initial Population: ' + initialPop()).formatNumberCommas();
    $('.anotherSim').removeAttr('disabled');
    displayState();
  }

  // Generate the initial population value by summing
  // the input values of each age bucket
  function initialPop() {
    var pop = 0;
    for (var i = 0; i < initCountry.malePop.length; i++) {
      if (i != 16) {
        pop = pop + initCountry.malePop[i] + initCountry.femalePop[i];
      }
    }
    return pop * 1000;
  }

  /*
  * Initialize the state for one of the three simulations
  *
  * @param cStep (object) stands for "Current Step." Contains all of
  * the data about the current simulation state.
  */
  function initSim(cStep) {
    var i, j, ipos;
    var currBRate;
    var leTemp, leDeaths;
    var currMMRate = 1.0;
    var currFMRate = 1.0;

    console.log("In initSim: " + simState.currSim);
    cStep.netMigration = initCountry.netMigration * 1000;
    cStep.pop = initialPop();
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
      if (initCountry.malePop[i] !== 0) {
        currMMRate = 1.0 - (initCountry.maleMortality[i] / initCountry.malePop[i] * 0.2);
      } // Otherwise, leave it at the last calcuated value (default 1.0)
      if (initCountry.femalePop[i] !== 0) {
        currFMRate = 1.0 - (initCountry.femaleMortality[i] / initCountry.femalePop[i] * 0.2);
      } // Otherwise, leave it at the last calcuated value (default 1.0)
      for (j = 0; j < 5; j++) {
        cStep.maleMortality[i * 5 + j] = currMMRate;
        cStep.femaleMortality[i * 5 + j] = currFMRate;
      }
    }
    // UN data only goes up to 95+, so the 100+ bin needs special handling
    cStep.maleMortality[100] = 1.0 - ((1.0 - currMMRate) * 2.0);
    cStep.femaleMortality[100] = 1.0 - ((1.0 - currFMRate) * 2.0);
    // We have the IMR, so set it explicitly
    cStep.maleMortality[0] = 1.0 - (initCountry.infantMortality / 1000.0);
    cStep.femaleMortality[0] = 1.0 - (initCountry.infantMortality / 1000.0);
    // We need to treat years 1-4 specially, since most of those die in year 0.
    var births = 0;
    for (i = 0; i < initCountry.births.length; i++) {
      births += initCountry.births[i];
    }
    var deaths = (initCountry.maleMortality[0] * 1000.0) -
      (births * initCountry.infantMortality / 2.0);
    currMMRate = 1.0 - (deaths / 4.0) / (initCountry.malePop[0] * 200.0);
    deaths = (initCountry.femaleMortality[0] * 1000.0) -
      (births * initCountry.infantMortality / 2.0);
    currFMRate = 1.0 - (deaths / 4.0) / (initCountry.femalePop[0] * 200.0);
    console.log("Deaths: " + deaths);
    for (i = 1; i <= 4; i++) {
      cStep.maleMortality[i] = currMMRate;
      cStep.femaleMortality[i] = currFMRate;
    }

    // Calculate the life expectancy
    cStep.lifeExp = 0.0;
    var alive = 1000000.0; // A population to age to calculate life expectancy
    // Note that infant mortality deaths do not reduce the population,
    // because I assume that they were already factored into the births count.
    for (i = 1; i <= 100; i++) {
      leTemp = alive * ((cStep.maleMortality[i] + cStep.femaleMortality[i]) / 2.0);
      leDeaths = alive - leTemp;
      alive = leTemp;
      cStep.lifeExp += (leDeaths / 1000000.0) * (i - 0.5);
    }
    for (i = 0; i < 20; i++) { // Calculate a few more years for people over 100
      leTemp = alive * ((cStep.maleMortality[100] + cStep.femaleMortality[100]) / 2.0);
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
        if (ipos > 16) {
          // Again, this is to handle the "80+" column
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

    // Initialize target values for scenarios
    cStep.targetMigValue = cStep.netMigration;
    cStep.targetMigYear = cStep.year;
    cStep.targetFertilityValue = cStep.fertility;
    cStep.targetFertilityYear = cStep.year;
    cStep.targetLifeExpValue = cStep.lifeExp;
    cStep.targetLifeExpYear = cStep.year;

    $('p#fertilityField').text(cStep.fertility.toFixed(1) + ' Children');
    $('p#lifeExpField').text(cStep.lifeExp.toFixed(1) + ' Years');
    $('p#netMigField').text(cStep.netMigration).formatNumberCommas();
    $('#simForwardButton').removeAttr('disabled');
    $('#simBackButton').attr('disabled', 'disabled');
  }

  // Load the country file object
  function initCountryObject(filename) {
    var dataURL = urlForDataFile(filename);
    console.log("dataURL: " + dataURL);
    $.ajax({
      url: dataURL,
      async: false,
      dataType: 'json'
    }).done(function(response) {
      initCountry = response;
      $('#countryField').text(initCountry.name);
      initSimState();
    }).fail(function() {
      tell("Oops! This page was called with a bad country file name: " + filename, "red");
    });
  }


  // Display the current simulation state
  function displayState() {
    var i;
    var curr = simState.sim[0].currstep;
    console.log("curr: " + curr);
    console.log("cstep: " + simState.sim[0].cstep[curr].year);
    $('p.currYearField.field0').text('Year: ' + simState.sim[0].cstep[curr].year);
    $('p.currPopField.field0').text('Population: ' +
      simState.sim[0].cstep[curr].pop).formatNumberCommas();
    if (simState.currSim !== 0) {
      curr = simState.sim[1].currstep;
      console.log("curr 1: " + curr);
      console.log("cstep: " + simState.sim[1].cstep[curr].year);
      $('p.currYearField.field1').text('Year: ' + simState.sim[1].cstep[curr].year);
      $('p.currPopField.field1').text('Population: ' +
        simState.sim[1].cstep[curr].pop).formatNumberCommas();
    }
    if (simState.currSim === 2) {
      curr = simState.sim[2].currstep;
      console.log("curr 2: " + curr);
      console.log("cstep: " + simState.sim[1].cstep[curr].year);
      $('p.currYearField.field2').text('Year: ' + simState.sim[2].cstep[curr].year);
      $('p.currPopField.field2').text('Population: ' +
        simState.sim[2].cstep[curr].pop).formatNumberCommas();
    }
    console.log("Display: " + simState.currSim);

    // These next values are used to set the bounds of the chart
    xArray[0] = [initCountry.startYear + stepSize * maxSteps];
    yArray[0] = [0];

    var xdum = [];
    var ydum = [];
    for (i = 0; i <= simState.currSim; i++) {
      xdum[i] = [];
      ydum[i] = [];
      for (var j = 0; j <= simState.sim[i].currstep; j++) {
        xdum[i][j] = simState.sim[i].cstep[j].year;
        ydum[i][j] = simState.sim[i].cstep[j].pop;
      }
      xArray[i + 1] = xdum[i];
      yArray[i + 1] = ydum[i];
    }
    console.log("Chart values: |" + xArray + "|, |" + yArray + "|");
    if (rChart !== undefined) {
      rChart.remove();
    }
    rChart = rChartPanel.linechart(70, 10, 370, 170, xArray, yArray, {
      axis: '0 0 1 1',
      axisxstep: maxSteps,
      symbol: ['', 'circle', 'circle', 'circle'],
      colors: ['transparent', '#995555', '#559955', '#555599']
    });

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
      mvals[mvals.length - (i + 1)] = mtemp;
      fvals[mvals.length - (i + 1)] = ftemp;
    }
    mvals[0] = cSim.malePop[100];
    fvals[0] = cSim.femalePop[100];
    PyrValues[0] = fvals;
    PyrValues[1] = mvals;

    var maxCohort = Math.max.apply(null, PyrValues[0].concat(PyrValues[1]));
    console.log('Max: ' + maxCohort);
    console.log("Pyramid: " + PyrValues[0] + ", " + PyrValues[1] + ", " + PyrValues);
//    P.initPyramid(maxCohort * 1.25);
    P.drawPyramid(PyrValues[0], PyrValues[1], maxCohort * 1.25);

    $('p#childrenField').text(cSim.fertility.toFixed(1) + ' Children');
    $('p#lifeExpField').text(cSim.lifeExp.toFixed(1) + ' Years');
    console.log("Now net migration is: " + cSim.netMigration);
    $('p#netMigField').text(cSim.netMigration).formatNumberCommas();
  }

  function sumPop(currSim) {
    // Sum and return the simulation population
    var temp = 0;
    for (var i = 0; i <= 100; i++) {
      temp += currSim.malePop[i];
      temp += currSim.femalePop[i];
    }
    return temp;
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
    console.log("Target Migration Value: " + currSim.targetMigValue);
    console.log("Target Migration Year: " + currSim.targetMigYear);

    // Make any changes required by "scenarios"
    if (currSim.targetMigValue !== currSim.netMigration) {
      console.log("Updating Migration Scenario");
      if (currSim.targetMigYear < currSim.year) {
        console.log("Immediate migration change");
        currSim.netMigration = currSim.targetMigValue;
      } else {
	var migDiff = currSim.targetMigValue - currSim.netMigration;
        migDiff = Math.round(migDiff/(currSim.targetMigYear - currSim.year + 1));
        console.log("Gradual migration change based on scenario: " + migDiff);
        currSim.netMigration += migDiff;
      }
    }
    if (currSim.targetMigYear < currSim.year) {
      currSim.targetMigYear = currSim.year;
    }
    if (currSim.targetFertilityValue !== currSim.fertility) {
      console.log("Updating Fertility Scenario");
    }
    if (currSim.targetFertilityYear < currSim.year) {
      currSim.targetFertilityYear = currSim.year;
    }
    if (currSim.targetLifeExpValue !== currSim.lifeExp) {
      console.log("Updating Life Expectancy Scenario");
    }
    if (currSim.targetLifeExpYear < currSim.year) {
      currSim.targetLifeExpYear = currSim.year;
    }

    var deaths = 0;
    for (i = 0; i <= 99; i++) {
      deaths += currSim.malePop[i] * currSim.maleMortality[i + 1];
      deaths += currSim.femalePop[i] * currSim.femaleMortality[i + 1];
    }
    deaths += currSim.malePop[100] * currSim.maleMortality[100];
    deaths += currSim.femalePop[100] * currSim.femaleMortality[100];
    console.log("Deaths should be: " + (temp - Math.round(deaths)));
    currSim.malePop[100] = Math.round(currSim.malePop[100] * currSim.maleMortality[100] + currSim.malePop[99] * currSim.maleMortality[99]);
    currSim.femalePop[100] = Math.round(currSim.femalePop[100] * currSim.femaleMortality[100] + currSim.femalePop[99] * currSim.femaleMortality[99]);
    for (i = 99; i > 0; i--) {
      currSim.malePop[i] = Math.round(currSim.malePop[i - 1] * currSim.maleMortality[i]);
      currSim.femalePop[i] = Math.round(currSim.femalePop[i - 1] * currSim.femaleMortality[i]);
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
        currSim.malePop[5 * i + j] += Math.round(migMale[i] * currSim.netMigration / 5000.0);
        currSim.femalePop[5 * i + j] += Math.round(migFemale[i] * currSim.netMigration / 5000.0);
      }
    }
    currSim.pop = sumPop(currSim);
    console.log("Year end pop: " + currSim.pop);
    console.log("Net change was: " + (currSim.pop - temp));
  }


  // Change this function to update any necessary values
  // when the pyramid bars are resized by the user.
  var pyramidValsWereChanged = function(fVals, mVals) {
    var i, j;
    console.log("IN PYRAMIDVALUESWERECHANGED");
    console.log(PyrValues[0]);
    console.log(PyrValues[1]);
    var curr = simState.sim[simState.currSim];
    var currSim = curr.cstep[curr.currstep];
    console.log("Start population is " + currSim.pop);
    for (i=0; i< mVals.length; i++) {
      if (mVals[i] !== PyrValues[1][i]) {
	console.log("HERE WE GO: Changed male pyramid bar " + i);
        if (i === 0) {
	  currSim.malePop[100] = mVals[i];
	}
        else {
	  for (j=0; j<5; j++) {
            currSim.malePop[((20-i)*5)+j] = Math.round(mVals[i]/5.0);
	  }
	}
        PyrValues[1][i] = mVals[i];
      }
      if (fVals[i] !== PyrValues[0][i]) {
	console.log("HERE WE GO: Changed female pyramid bar " + i);
        if (i === 0) {
	  currSim.femalePop[100] = fVals[i];
	}
        else {
	  for (j=0; j<5; j++) {
            currSim.femalePop[((20-i)*5)+j] = Math.round(fVals[i]/5.0);
	  }
	}
        PyrValues[0][i] = fVals[i];
      }
    }
    currSim.pop = sumPop(currSim);
    console.log(mVals);
    console.log(fVals);
    console.log("New population is " + currSim.pop);
    displayState();
  }


  /* ------------------ START HERE ---------------------------- */

  // Generic message for output window when there is nothing special to do.
  var generalMsg = "You can click on the 'Options' button to choose from among the available simulation features, click on the 'Sim' button to advance the simulation, or click on one of the other buttons to set simulation parameters.";

  var initCountry; // Initial country data from data file
  var maxSteps = 8; // Total number of simulation steps supported
  var stepSize = 10; // Number of years between each registered step in chart
  var simState = {}; // Current simulation state object, it holds everything
  var rChart; // graphael line chart object
  var xArray = [];
  var yArray = [];
  var PyrValues = [];
  // These next two arrays contain the distribution for migrants by sex
  // and cohort. Each entry is for a 5-year cohort, starting with 0-4 and ending with 80+.
  // The numbers indicate migrants of that catagory out of
  // a total of 1000 migrants.  The total of all 34 numbers should be 1000.
  // Values are derived by averaging Figures 7 and 8 (p. 4-5) of 
  // http://pewhispanic.org/files/reports/107.pdf

  var migMale = [6, 11, 14, 28, 48, 72, 70, 66, 60, 46, 36, 27, 17, 13, 9, 6, 6];
  var migFemale = [5, 13, 16, 23, 35, 48, 54, 55, 49, 39, 33, 27, 20, 15, 13, 10, 13];

  // Set up the interface

  // Init Pyramid Panel
  // Generates random populations between 0 and 2000000
  var randomList = function() { // For Testing
    var list = [];
    for (var i = 1; i <= 20; i++) {
      list.push(Math.floor(Math.random() * 19000000) + 1);
    }
    return list;
  }
  P.initPyramid(pyramidValsWereChanged, 25000000);
//  P.drawPyramid(randomList(), randomList(), pyramidValsWereChanged);

  // Population chart panel
  var rChartPanel = new Raphael("plotArea", 450, 230);

  // Simulation panel
  $('p#initialPopField').text("Initial Population:");

  tell(generalMsg);

  var filename = getQueryParameter("filename");
  if ((filename === undefined) || (filename === "undefined")) {
    tell("Ooops! This page was opened with no file name given! Pehaps you tried to open it directly, instead of through IntlPop.html", "red");
  } else if (filename === "") {
    tell("Ooops! Empty file name!", "red");
  } else {
    var dataURL = initCountryObject(filename);
  }

});
