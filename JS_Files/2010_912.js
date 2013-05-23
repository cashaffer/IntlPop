function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Northern Africa";
  myCountry.code = 912;
  myCountry.startYear = 2010;
  myCountry.malePop = [12018,11187,10577,10532,10441,9580,7933,6647,5845,5117,4430,3502,2637,1768,1342,862,571,420,126,23,2,0];
  myCountry.femalePop = [11489,10705,10148,10168,10213,9564,8040,6777,5920,5192,4436,3527,2801,1998,1620,1061,809,575,187,41,5,0];
  myCountry.births = [1784,6318,7403,5392,2704,806,173];
  myCountry.femaleMortality = [560,47,39,42,53,55,56,60,69,83,102,124,155,209,280,334,303,171,61,13];
  myCountry.maleMortality = [674,56,50,66,84,79,72,74,86,114,155,196,226,266,322,335,264,136,42,7];
  myCountry.infantMortality = 37;
  myCountry.netMigration = -1020;
  return myCountry;
}
