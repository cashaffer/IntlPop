function setCountry () {
  var myCountry = new Object;
  myCountry.name = "United States";
  myCountry.initPop = 300000000;
  myCountry.startYear = 2010;
  myCountry.growthRate = 1.1;
  myCountry.children = 2.3;
  myCountry.lifeExp = 75.5;
  myCountry.netMigration = 700000;
  myCountry.malePop = [1, 2, 4, 6, 10, 12, 12];
  myCountry.femalePop = [1, 2, 5, 5, 8, 11, 11];
  return myCountry;
}
