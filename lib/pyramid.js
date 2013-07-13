/*
 * pyramid.js
 * Nate Beatty | June 2013
 *
 * The Javascript to build a pyramid.
 */

// Function to get the Max value in Array
Array.max = function(array) {
	return Math.max.apply(Math, array);
};

"use strict";
var P = {
	pyramid: { // Keep track of some stats about the pyramid
		numberOfBars: 21,
		maxval: 0,
		maxpx: 175,
		leftVals: [],
		rightVals: [],
		valsWereChanged: function(maleValues, femaleValues) {}
	},
	logging: false,

	/***********************
	 **  Utility Methods  **
	 ***********************/

	pixelsToPop: function(px) {
		return Math.round((px / P.pyramid.maxpx) * P.pyramid.maxval);
	},

	popToPixels: function(pop) {
		var px = Math.round((pop / P.pyramid.maxval) * P.pyramid.maxpx);
		return px;
	},

	/***********************
	 **  Pyramid Methods  **
	 ***********************/

	/* 
	 * Initializes the pyramid by appending the appropriate
	 * html to the inside of the div of class 'pyramid'. Also gets the
	 * pyramid ready to be redrawn proportionally to some max value.
	 *
	 * @param eventListener (function) The function that will be called when
	 * the user has stopped dragging a bar. The function is called with two
	 * parameters which correspond to the current left and right values
	 * respectively. They are both arrays of 21 integer values.
	 *
	 * @param maxval (int) Specifies the maximum value that can be
	 * displayed in the pyramid. This should be the value that
	 * a bar stretching all of the way across its allotted width would
	 * represent. The value of this parameter is used to calculate bar widths
	 * each time the pyramid is redrawn.
	 */
	initPyramid: function(eventListener, maxval, options) {
		if (typeof eventListener != 'undefined') {
			P.pyramid.valsWereChanged = eventListener;
		}
		if (typeof maxval != 'undefined') {
			P.pyramid.maxval = Number(maxval);
		}
		if (options) {
			if (options.logging) {
				P.logging = true;
			}
		}

		if (P.logging) {
			console.log('Building a new pyramid.');
		}

		$('.pyramid div').html(''); // start fresh - clear any html in the pyramid

		// Build the left bars
		var lbars = [];
		for (var i = 0; i < P.pyramid.numberOfBars; i++) {
			var barID = 'lbar' + i;
			lbars[i] = '<div class="P-bar"><div class="P-lbar" id="' + barID + '"></div></div>';
		};
		var lbarDivs = lbars.join('');

		// Build the right bars
		var rbars = [];
		for (var i = 0; i < P.pyramid.numberOfBars; i++) {
			var barID = 'rbar' + i;
			rbars[i] = '<div class="P-bar"><div class="P-rbar" id="' + barID + '"></div></div>';
		};
		var rbarDivs = rbars.join('');

		$('.pyramid').append('<div id="P-container"></div>');
		$('#P-container').append('<div id="lheader"></div>');
		$('#P-container').append('<div id="rheader"></div>');
		$('#P-container').append('<div id="lcontainer">' + lbarDivs + '</div>');
		$('#P-container').append('<div id="rcontainer">' + rbarDivs + '</div>');
		$('.P-lbar').resizable({
			handles: 'w',
			maxWidth: P.pyramid.maxpx,
			minWidth: 0.5
		});
		$('.P-rbar').resizable({
			handles: 'e',
			maxWidth: P.pyramid.maxpx,
			minWidth: 0.5
		});

		P.pyramid['maxpx'] = $('.P-bar').first().width();

		// Set listeners to respond to events within the pyramid
		$('.P-lbar,.P-rbar').resize(function() {
			P.barWasDragged($(this));
		});
		$('.P-lbar,.P-rbar').on('resizestop', function(event, ui) {
			P.barDidStopResizing($(this), event, ui);
		});

		// Set popups on hover for the bars using Tipsy
		$('.P-lbar').tipsy({
			title: 'P-val',
			fade: true,
			gravity: 'e'
		});
		$('.P-rbar').tipsy({
			title: 'P-val',
			fade: true,
			gravity: 'w'
		});
	},

	/* Resizes the initialized pyramid with values given in the parameters.
	 *
	 * @param leftVals (array of 21 int values) An array of values, one for
	 * each bar on the left side of the pyramid. These should be relative to
	 * maxvalue as set in the initialization function.
	 *
	 * @param rightVals (array of 21 int values) An array of values, one for
	 * each bar on the right side of the pyramid. These should be relative to
	 * maxvalue as set in the initialization function.
	 *
	 * @param maxval (int) Specifies the maximum value that can be
	 * displayed in the pyramid. This should be the value that
	 * a bar stretching all of the way across its allotted width would
	 * represent. The value of this parameter is used to calculate bar widths
	 * each time the pyramid is redrawn.
	 */
	drawPyramid: function(leftVals, rightVals, maxval) {
		if (typeof leftVals != 'undefined' && typeof rightVals != 'undefined') {
			P.pyramid.leftVals = leftVals.slice(0);
			P.pyramid.rightVals = rightVals.slice(0);
		}
		if (typeof maxval != 'undefined') {
			P.pyramid.maxval = Number(maxval);
		}
		var maxArrVal = Array.max(P.pyramid.leftVals.concat(P.pyramid.rightVals));
		if (maxArrVal > P.pyramid.maxval) {
			if (P.logging) { console.log('An array value is larger than the plot range allows.\nExpanding the max plot range to ' + maxArrVal) }
			P.pyramid.maxval = Number(maxArrVal);
		}

		if (P.pyramid.leftVals.length != P.pyramid.numberOfBars || P.pyramid.rightVals.length != P.pyramid.numberOfBars) {
			console.log('In pyramid.js: drawPyramid() parameter values must be arrays of length ' + P.pyramid.numberOfBars + '.');
			return;
		}

		$('.P-lbar').each(function(index) {
			var newBarWidth = P.popToPixels(P.pyramid.leftVals[index]);
			$(this).attr('P-val', P.pyramid.leftVals[index]);
			if (newBarWidth > P.pyramid.maxpx) {
				console.log('Left bar ' + index + ' value overflow.');
			}
			$(this).width(newBarWidth);
			var leftoffset = P.pyramid.maxpx - newBarWidth;
			$(this).css('left', leftoffset); // To right align the left bars
		});
		$('.P-rbar').each(function(index) {
			var newBarWidth = P.popToPixels(P.pyramid.rightVals[index]);
			$(this).attr('p-val', P.pyramid.rightVals[index]);
			if (newBarWidth > P.pyramid.maxpx) {
				console.log('Right bar ' + index + ' value overflow.');
			}
			$(this).width(newBarWidth);
		});
	},

	/***********************
	 **  Event Listeners  **
	 ***********************/

	barWasDragged: function(e) {
		var elementID = e.attr('id');
		var isLeftBar = (elementID[0] == 'l') ? true : false;
		var barIndex = parseInt(elementID.substring(4, elementID.length));

		// For testing
		var side = (isLeftBar) ? 'left' : 'right';
		// console.log('Width of ' + side + ' bar ' + barIndex + ' changed to: ' + e.width() + ' px = ' + P.pixelsToPop(e.width()) + ' people.');
	},

	barDidStopResizing: function(e, event, ui) {
		var elementID = e.attr('id');
		var barIndex = parseInt(elementID.substring(4, elementID.length));

		var valsToChange = (elementID[0] == 'l') ? P.pyramid.leftVals : P.pyramid.rightVals;
		if (ui.size.width < 1) {
			valsToChange[barIndex] = 0;
		} else {
			valsToChange[barIndex] = P.pixelsToPop(ui.size.width);
		}

		var eventListener = P.pyramid.valsWereChanged;
		eventListener(P.pyramid.leftVals, P.pyramid.rightVals);
		P.drawPyramid(); // Redraw the pyramid to make sure everything lines up right
	},

	/************************
	 **  Property Getters  **
	 ************************/

	maleValues: function() {
		return [];
	},

	femaleValues: function() {
		return [];
	}
}