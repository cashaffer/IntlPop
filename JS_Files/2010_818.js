function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Egypt";
  myCountry.code = 818;
  myCountry.startYear = 2010;
  myCountry.malePop = [4611,4346,4124,3997,4138,3690,2942,2396,2241,2050,1779,1423,1174,732,535,330,225,164,51,9,1,0];
  myCountry.femalePop = [4397,4152,3951,3854,4019,3657,2959,2386,2196,2018,1818,1467,1254,843,651,436,329,232,79,16,2,0];
  myCountry.births = [921,3076,2922,1540,637,167,18];
  myCountry.femaleMortality = [130,5,5,8,11,11,12,14,19,27,35,46,59,79,112,135,122,70,23,4];
  myCountry.maleMortality = [143,6,8,15,21,19,16,18,25,40,60,84,98,109,128,131,102,51,15,2];
  myCountry.infantMortality = 26;
  myCountry.netMigration = -347;
  return myCountry;
}
