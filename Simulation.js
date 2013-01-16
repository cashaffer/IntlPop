"use strict";
$(document).ready(function () {
  var tell = function (msg) { $('p.output').text(msg); };

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
  var xPoints = [];
  var yPoints = [];
  var theChart;

  // Set up the interface

  // Pyramid Panel
  var rPyramid = new Raphael("pyramidPanel", 350, 300);

  // Population chart panel
  var rChart = new Raphael("popChartPanel", 500, 300);
  rChart.rect( 27, 218, 126, 60);
  rChart.rect(163, 218, 126, 60);
  rChart.rect(299, 218, 126, 60);

  // Simulation panel
  var rSim = new Raphael("simPanel", 255, 300);
  rSim.rect(5, 20, 245, 200);
  rSim.path("M20 50 L230 50");
  $('p.initPopField').text("Initial Population:");

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

  // Initialize the menu of countries
  function initCountryMenu() {
    var html = "";
    for (var i = 0; i < countryList.length; i++) {
      html += '<option value="' + i + '">' + countryList[i].name + '</option>';
    }
    $('#countrySelectMenu').html(html);
  }

  initCountryMenu();
  console.log("Country Menu value: " + $('#countrySelectMenu').val());

  console.log("This page's URL is: " + window.location.protocol + "//" +
              window.location.host + "/" + window.location.pathname);

  tell("Click on the 'Options' button to choose from among the available simulation features.");

  // Handler for clicking on country in country select menu
  function countryClick(el) {
    console.log("In countryClick, value: " + $('#countrySelectMenu').val() + ", element: " + el);
  }

  // Handler for launching the country select modal window
  function openSelectModal() {
    $('#countrySelectModal').modal({position: [5], minHeight: 275, minWidth: 1000});
  }

  // Handler for Fertility button
  function fertility() {
    tell("Clicked on Fertility button.");
  }

  // Handler for options button
  function selectCountry() {
    tell("Clicked on select button.");
    if ($('#countrySelectMenu').val() === null) {
      tell("Must first select a country!");
    } else {
      var dataURL = buildURL(countryList[$('#countrySelectMenu').val()].filename);
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
	xPoints.length = 0;
        yPoints.length = 0;
        xPoints[0] = currYear;
        yPoints[0] = currPop;
        theChart = rChart.linechart(70, 25, 370, 180, xPoints, yPoints, {axis: '0 0 1 1', symbol: 'circle'});
        $.modal.close();
      });
    }
  }

  // Handler for simForward button
  function simForward() {
    tell("Clicked on simForward button.");
    currPop = Math.round(currPop * country.growthRate);
    currYear = currYear + 1;
    $('p.currYearField').text('Year: ' + currYear);
    $('p.currPopField').text('Population: ' + currPop).commas();
    $('#simBackButton').removeAttr('disabled');
    xPoints[xPoints.length] = currYear;
    yPoints[yPoints.length] = currPop;
    console.log("xPoints: " + xPoints);
    theChart.remove();
    theChart = rChart.linechart(70, 25, 370, 180, xPoints, yPoints, {axis: '0 0 1 1', symbol: 'circle'});
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
  $('#optionsSelect').click(openSelectModal);
  $('#doSelect').click(selectCountry);
  $('#countrySelectMenu').click(countryClick);
});
