function setCountry () {
  var myCountry = new Object;
  myCountry.name = "Southern Asia";
  myCountry.code = 5501;
  myCountry.startYear = 2010;
  myCountry.malePop = [93899,90802,90401,88823,84440,76805,67583,58090,51587,44461,37670,30609,21153,15693,11240,6944,5389,3530,1395,384,71,10];
  myCountry.femalePop = [87397,84214,83707,82194,78922,72219,63807,54847,48812,42315,35939,29709,21597,16628,12386,7797,6066,4000,1572,415,70,8];
  myCountry.births = [31230,74905,50790,23917,9613,2835,650];
  myCountry.femaleMortality = [7427,588,469,629,754,736,712,708,773,923,1190,1551,1902,2359,2728,2625,2052,1222,484,128];
  myCountry.maleMortality = [7386,552,489,633,857,989,1077,1196,1343,1594,1998,2344,2624,2982,3125,2797,2035,1143,441,120];
  myCountry.infantMortality = 56;
  myCountry.netMigration = -8808;
  return myCountry;
}