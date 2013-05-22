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

// load map layers
var lyrSourceCollection = [];
lyrSourceCollection.push(["Countries", "MappickerLayers/Countries.json", Countries_style, "Name"]);
lyrSourceCollection.push(["Regions", "MappickerLayers/Regions.json", Regions_style, "Name"]);
lyrSourceCollection.push(["Continents", "MappickerLayers/Continents.json", Continent_style, "Name"]);

var lyrCollectionObject = {};

// other global variables
var map;
var currentlyAddingLyrName;
var currentlyAddingLyrSrc;
var currentlyAddingLyrStyle;
var currentlyAddingLyrPopUp;
var lst = -1;

// new http request to get layers
var myxmlhttp = new XMLHttpRequest();

function init() {
	map = L.map('map', {
		center:[25.0, 0.0],
		zoom: 1.25
	});
	loadLayers_oneatatime();
}

function loadLayers_oneatatime() {
	if (lyrSourceCollection.length > 0) {
		console.log("adding a new layer");
		var listitem = lyrSourceCollection.pop();
		currentlyAddingLyrName = listitem[0];
		currentlyAddingLyrSrc = listitem[1];
		currentlyAddingLyrStyle = listitem[2];
		if (listitem[3]) {
			currentlyAddingLyrPopUp = listitem[3];
		}
		else {
			currentlyAddingLyrPopUp = null;
		}
		myxmlhttp.open("GET", currentlyAddingLyrSrc, false);
		myxmlhttp.send();
		loadLayer_completion_oneatatime();
	}
	else {
		console.log("Layer source collection exhausted. Adding loaded layers to the map.");
		currentlyAddingLyrName = null;
		currentlyAddingLyrSrc = null;
		currentlyAddingLyrStyle = null;
		currentlyAddingLyrPopUp = null;
	}
}

function loadLayer_completion_oneatatime() {
	console.log("http request for " + currentlyAddingLyrName + " complete");
	var responseJson = JSON.parse(myxmlhttp.responseText);
	if (responseJson) {
		lyrCollectionObject[currentlyAddingLyrName] = L.geoJson(responseJson, { 
			onEachFeature: onEachFeature, style: currentlyAddingLyrStyle });
	}
	loadLayers_oneatatime();
	universalLayerChange()
}

function onEachFeature(feature, layer) {
	var popupContent = "";
	if (feature.properties["Name"]) {
		popupContent += feature.properties["Name"];
	}
	if (feature.properties["CountryID"]) {
		var countryID = feature.properties["CountryID"];

		/* The JS that will be called when 'select' is clicked */
		var jsString = 'console.log(' + countryID + ')'; // Edit this line.

		popupContent += '<br><a class="" href="#" onclick="' + jsString + '">Select</a>'; // Call onclick here with a country id
	}
	layer.bindPopup(popupContent);
	layer.on('click', function() {
		console.log('Feature clicked: ');
	});
}

function universalLayerChange() {
	var radioOptions = document.getElementsByName("LayerChooser");

	/* remove the layer that is currently present */
	if (lst != -1) {
		map.removeLayer(lyrCollectionObject[radioOptions[lst].value]);
	}

	/* iterate over the radio options and add the selected layer */
	for (var i = 0; i < radioOptions.length;  i++) {
		if (radioOptions[i].checked == true) {
			map.addLayer(lyrCollectionObject[radioOptions[i].value]);
			lst = i;
		}
	}			
};