function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Austria";
  myCountry.code = 40;
  myCountry.startYear = 2010;
  myCountry.malePop = [198,211,225,258,266,281,267,298,353,356,301,244,224,211,162,113,127,78,38,8,2,0];
  myCountry.femalePop = [188,200,213,246,257,275,264,298,348,349,302,254,240,237,196,155,276,137,101,28,9,1];
  myCountry.births = [16,70,122,108,53,11,0];
  myCountry.femaleMortality = [1,0,0,0,0,0,0,1,2,2,3,4,6,9,14,24,42,44,29,15];
  myCountry.maleMortality = [1,0,0,1,1,1,1,2,3,5,7,9,13,18,22,28,31,22,11,4];
  myCountry.infantMortality = 4;
  myCountry.netMigration = 160;
  return myCountry;
}
