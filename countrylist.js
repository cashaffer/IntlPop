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