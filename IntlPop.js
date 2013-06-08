"use strict";
/*global alert*/
(function ($) {
  var tell = function (msg) { $('p.output').text(msg); };
  var simWindowFeatures = "height=378,width=1060";

  // Initialize the menu of countries
  function initCountryMenu() {
    var html = "";
    for (var i = 0; i < countryList.length; i++) {
      html += '<option value="' + i + '">' + countryList[i].name + '</option>';
    }
    $('#countrySelectMenu').html(html);
  }

  // Process about button: Pop up an alert
  function about() {
    alert("IntlPop Version 3.0\nSimulation by Cliff Shaffer, data conversion and map interface by Nate Beatty, map data preparation by Bill Carstensen, 2013\nFor more information, see http://geosim.cs.vt.edu/IntlPop\nSource and development history available at\nhttps://github.com/cashaffer/IntlPop\nThis is Version " + version());
  }

  // Process new button: Create a new instance of a simulation
  function newsim() {
    tell("Clicked on select button.");
    if ($('#countrySelectMenu').val() === null) {
      tell("Must first select a country!");
    } else {
      var filename = countryList[$('#countrySelectMenu').val()].filename;
      console.log("Country selected is: " + filename);
      var myRef = window.open("Simulation.html?filename=" + filename, '', simWindowFeatures);
      if (myRef === null) {
        console.log("Unable to open simulation window");
      }
    }
  }

  // Process help button: Give a full help page for this activity
  function help() {
    var myRef = window.open("IntlPopHelp.html", 'helpwindow');
  }

  // Handler for clicking on country in country select menu
  function countryClick(el) {
    console.log("In countryClick, value: " + $('#countrySelectMenu').val() +
                ", name: " + countryList[$('#countrySelectMenu').val()].name);
    $('p.currentSelection').text("Current Selection: " + countryList[$('#countrySelectMenu').val()].name);
  }

  console.log("This page's URL is: " + window.location.protocol + "//" +
              window.location.host + "/" + window.location.pathname);

  initCountryMenu();
  console.log("Country Menu value: " + $('#countrySelectMenu').val());

  // var rSelectPanel = new Raphael("countrySelectPanel", 710, 600);
  // rSelectPanel.rect(5, 68, 700, 350); // Why is this here?? - TNB

  tell("Click on a country, then click 'Select It' to open a simulation window.");
  // Action callbacks for form entities
  $('#aboutButton').click(about);
  $('#helpButton').click(help);
  $('#doSelect').click(newsim);
  $('#countrySelectMenu').click(countryClick);
}(jQuery));
