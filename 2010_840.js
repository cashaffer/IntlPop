function setCountry () {
  var myCountry = new Object;
  myCountry.name = 'United States of America';
  myCountry.startYear = 2010;
  myCountry.femalePop = [10583,10206,9661,10545,10517,10744,9761,10122,10273,11582,11323,10003,8652,6515,4989,4153,7615,3727,2445,1097,297,48];
  myCountry.malePop = [11067,10673,10126,11116,11152,11325,10117,10304,10320,11353,10922,9422,7979,5735,4160,3161,4207,2330,1329,454,85,9];
  myCountry.births = [2142,5327,5922,4844,2421,524,37];
  myCountry.maleMortality = [96,7,14,46,78,76,76,98,155,245,335,414,481,532,624,777,885,771,418,140];
  myCountry.femaleMortality = [76,5,8,18,25,28,36,55,94,150,202,261,329,394,505,726,1005,1114,841,468];
  myCountry.netMigration = 4955;
  return myCountry;
}
