/* 
* Mappicker.js
* Written by Nate Beatty for the IntlPop! Project
* June 2013
*
* Loads the country list from the JSON file, `countrylist.json`.
*/

"use strict";
var countryList = [];

$.ajax({
  url: 'countrylist.json',
  async: false,
  dataType: 'json',
  success: function (response) {
    countryList = response;
  }
});