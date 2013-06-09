/* 
* Mappicker.js
* Written by Nate Beatty for the IntlPop! Project
* May 2013
*/

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

function init() {
	loadLayers();
	loadCountryList();
	map = L.map('map', {
		center:[25.0, 0.0],
		zoom: 1.25,
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
	selectCountry(e.target.feature.properties.CountryID);
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
function selectCountry(id) {
	var simWindowFeatures = "height=378,width=1060";
	var filename = "";
	
	filename = $.grep(countryList, function(e){ return e.countrycode == id; })[0].filename;
	console.log("File selected is: " + filename);
	var myRef = window.open("Simulation.html?filename=" + filename, '', simWindowFeatures);
	if (myRef === null) {
		console.log("Unable to open simulation window");
	}
}
