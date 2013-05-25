/* 
* Mappicker.js
* Written by Nate Beatty for the IntlPop! Project
* Based on a leaflet prototype by Bill Carstensen
* May 2013
*/

/* 
* Map Styles 
* Styles by Bill Carstensen
*/


var Continent_style = function(feature) {
	if (feature.properties.Name =="Africa") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FFFF33",
			fillOpacity: 1
		}
	}
	else if (feature.properties.Name == "Asia") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FFCC00",
			fillOpacity: 1
		}
	}
	else if (feature.properties.Name == "Europe") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FF9900",
			fillOpacity: 1
		}
	}
	else if (feature.properties.Name == "Latin Am. & Carib.") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#993300",
			fillOpacity: 1
		}
	}
	else if (feature.properties.Name == "Northern America") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#660000",
			fillOpacity: 1
		}
	}
	else {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FFFF99",
			fillOpacity: 1
		}
	}
}

var Regions_style = function(feature) {
	if (feature.properties.Name != "") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#00FF00",
			fillOpacity: 1
		}
	}
	else {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FFFFFF",
			fillOpacity: 1
		}
	}
}

var Countries_style = function(feature) {
	if (feature.properties.Name != "") {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FF0000",
			fillOpacity: 1
		}
	}
	else {
		return {
			color: "#000000",
			weight: 1,
			opacity: 1,
			fillColor: "#FFFFFF",
			fillOpacity: 1
		}
	}
}

/* 
* Layer loading and other behaviors
* 
*/

var layerSources = [{
	name: "Countries",
	geoJsonPath: "MappickerLayers/Countries.json",
	style: Countries_style
}, {
	name: "Regions",
	geoJsonPath: "MappickerLayers/Regions.json",
	style: Regions_style
}, {
	name: "Continents",
	geoJsonPath: "MappickerLayers/Continents.json",
	style: Continent_style
}];

// HTTP GET for GeoJSON files
var httpRequest = new XMLHttpRequest();

// other global variables
var map;
var mapLayers = {};
var currentLayer;


function init() {
	loadLayers();
	map = L.map('map', {
		center:[25.0, 0.0],
		zoom: 1.25,
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

function layerWasChanged(currentLayerName) {
	console.log('Visible layer changed to: ' + currentLayerName);
}

function loadLayers() {
	for (var i = 0; i < layerSources.length; i++) {
		var lyrName = layerSources[i].name;
		var lyrStyle = layerSources[i].style;
		httpRequest.open("GET", layerSources[i].geoJsonPath, false);
		httpRequest.send();
		var responseJson = JSON.parse(httpRequest.responseText);
		saveMapLayer(responseJson, lyrName, lyrStyle);
	};
	// httpRequest.open("GET", layerSources[1].geoJsonPath, false);
	// httpRequest.send();
	// var responseJson = JSON.parse(httpRequest.responseText);
	// saveMapLayer(responseJson, layerSources[1].name, layerSources[1].style);
}

function saveMapLayer(json, layerName, layerStyle) {
	console.log('Saving ' + layerName);
	mapLayers[layerName] = L.geoJson(json, {
		style: layerStyle,
		onEachFeature: onEachFeature
	});
	// regionLayer = L.geoJson(json, {
	// 	style: layerStyle,
	// 	onEachFeature: onEachFeature
	// });
}

function onEachFeature(feature, layer) {

	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: countryClicked
	});
}

// Should be called on mouseover
function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		fillOpacity: 0.7
	});

	currentHover(layer.feature.properties.Name, layer.feature.properties.CountryID);

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
}

// Should be called on mouseout
function resetHighlight(e) {
	currentLayer.resetStyle(e.target);
	currentHover();
}

// Called on click?
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function countryClicked(e) {
	selectCountry(e.target.feature.properties.CountryID);
}

function currentHover(name, id) {
	if(typeof(name)==='undefined') name = "";
	// Update the currently update hover
	$('p.hover').text("Current Hover: " + name);
}

// Country Selection
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
