function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Canada";
  myCountry.initPop = 25000000;
  myCountry.startYear = 2010;
  myCountry.growthRate = 1.01;
  myCountry.children = 2.0;
  myCountry.lifeExp = 75.9;
  myCountry.netMigration = 10000;
  myCountry.malePop = [1, 1, 2, 3, 5, 6, 7];
  myCountry.femalePop = [1, 1, 2, 3, 4, 5, 7];
  return myCountry;
}
