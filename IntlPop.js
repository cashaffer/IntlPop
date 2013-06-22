"use strict";

$(document).ready(function() {
  var tell = function (msg) { $('p.output').text(msg); };
  var simWindowFeatures = "height=378,width=1060";

  // Initialize the menu of countries
  function initCountryMenu() {
    var html = "";
    for (var i = 0; i < countryList.length; i++) {
      html += '<option value="' + i + '">' + countryList[i].alias + '</option>';
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
      ", name: " + countryList[$('#countrySelectMenu').val()].alias);
    $('p.currentSelection').text("Current Selection: " + countryList[$('#countrySelectMenu').val()].alias);
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

  /*********************
  **  Search Support  **
  **********************/

  $('#countrySearchBox').keyup(function(e) {
    var query = $('#countrySearchBox').val();
    console.log('Query change detected: ' + query);
    reloadCountryMenu();
    $('option').filter(function(index){
      query = query.toLowerCase();
      var option = $(this).text().toLowerCase();
      return (option.indexOf(query) === -1);
    }).remove();
  });

  function clearSearch() {
    $('#countrySearchBox').val('');
    reloadCountryMenu();
  }

  function reloadCountryMenu() {
    console.log('Reloading country menu');
    var html = "";
    for (var i = 0; i < countryList.length; i++) {
      html += '<option value="' + i + '">' + countryList[i].alias + '</option>';
    }
    $('#countrySelectMenu').html(html);
  }

  /******************
  **  Map Support  **
  *******************/

  var map_style = function(feature) {
    return {
      color: "#000000",
      weight: 1,
      opacity: 1,
      fillColor: "#BBB",
      fillOpacity: 1
    }
  }

  var layerSources = [{
    name: "Countries",
    geoJsonPath: "MappickerLayers/Countries.json",
  }, {
    name: "Regions",
    geoJsonPath: "MappickerLayers/Regions.json",
  }, {
    name: "Continents",
    geoJsonPath: "MappickerLayers/Continents.json",
  }];

  // HTTP GET for GeoJSON files
  var httpRequest = new XMLHttpRequest();

  // other global variables
  var map;
  var mapLayers = {};
  var currentLayer;
  var countrylist;

  function initMap() {

    loadLayers();
    loadCountryList();
    map = L.map('map', {
      crs: crs,
      center:[25.0, 0.0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      layers: [mapLayers.Countries]
    });

    var layers = {
      "Countries" : mapLayers.Countries,
      "Regions" : mapLayers.Regions,
      "Continents" : mapLayers.Continents
    };

    L.control.layers(layers, null, {
      position: 'bottomleft',
      collapsed: false
    }).addTo(map);

    currentLayer = mapLayers.Countries;

    // Bind a listener to determine layer changes
    map.on('baselayerchange', function(e) {
      currentLayer = e.layer;
    });
  }

  /*******************************
  **  Initialization Functions  **
  ********************************/

  function loadCountryList() {
    $.ajax({
      url: 'countrylist.json',
      async: false,
      dataType: 'json'
    }).done( function (response) {
      countrylist = response;
    }).fail( function () {
      console.log('Countrylist failed to load.');
    });
  }

  function loadLayers() {
    for (var i = 0; i < layerSources.length; i++) {
      var lyrName = layerSources[i].name;
      httpRequest.open("GET", layerSources[i].geoJsonPath, false);
      httpRequest.send();
      var responseJson = JSON.parse(httpRequest.responseText);
      saveMapLayer(responseJson, lyrName);
    };
  }

  function saveMapLayer(json, layerName) {
    console.log('Saving ' + layerName);
    mapLayers[layerName] = L.geoJson(json, {
      style: map_style, // All map styles are the same
      onEachFeature: onEachFeature
    });
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: countryClicked
    });
  }

  /*********************
  **  Event Handlers  **
  **********************/

  // Called when the user selects a new map layer to display
  function layerWasChanged(currentLayerName) {
    console.log('Visible layer changed to: ' + currentLayerName);
  }

  // Should be called on mouseover
  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      fillOpacity: 0.7
    });
    updateCurrentHover(layer.feature.properties.Name, layer.feature.properties.CountryID);
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }

  // Should be called on mouseout
  function resetHighlight(e) {
    currentLayer.resetStyle(e.target);
    updateCurrentHover();
  }

  // Should be called on click
  function countryClicked(e) {
    selectCountryInList(e.target.feature.properties.CountryID);
  }

  /*********************
  **  Helper Methods  **
  **********************/

  // Called on click?
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function updateCurrentHover(name, id) { // Updates the current hover text
    if (typeof(name)==='undefined' || typeof(id)==='undefined') {
      name = "";
    } else {
      name = countryNameForIndex(id);
    }
    // Update the currently update hover
    $('p.hover').text("Current Hover: " + name);
  }

  function countryNameForIndex(id) {
    var countryName = $.grep(countryList, function(e){ return e.countrycode == id})[0].alias;
    return countryName;
  }

  // Called upon country selection:
  // Spawns a new simulation window
  function selectCountryInList(countryId) {
    // countryId = typeof countryId !== 'undefined' ? countryId : 900; // Uncomment to make non-id'd polygons default to world selection
    var countryObject = $.grep(countryList, function(e){ return e.countrycode == countryId})[0];
    var countryIndex = $.inArray(countryObject, countryList);
    if (countryIndex == -1) {
      console.log('Country with id %i not found in the country list', countryId);
      return;
    }
    clearSearch();
    console.log('Selecting country with index: %i', countryId);
    $('#countrySelectMenu').val(countryIndex);
    $('p.currentSelection').text("Current Selection: " + countryList[$('#countrySelectMenu').val()].alias);
  }

  initMap();

});
