function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Central Asia";
  myCountry.code = 5500;
  myCountry.startYear = 2010;
  myCountry.malePop = [3244,2821,2913,3325,3292,2652,2166,1946,1703,1697,1387,960,585,350,419,203,172,128,34,7,2,0];
  myCountry.femalePop = [3107,2714,2806,3227,3234,2652,2213,2027,1822,1856,1547,1141,726,451,628,337,405,262,105,28,9,2];
  myCountry.births = [351,2519,2087,1148,453,101,10];
  myCountry.femaleMortality = [158,9,8,10,15,16,18,22,29,39,46,50,50,77,106,120,122,75,40,19];
  myCountry.maleMortality = [198,13,12,18,30,38,43,50,64,84,95,91,81,108,124,109,77,30,12,5];
  myCountry.infantMortality = 43;
  myCountry.netMigration = -994;
  return myCountry;
}
