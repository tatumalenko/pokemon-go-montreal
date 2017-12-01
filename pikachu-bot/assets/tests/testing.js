


const text = "[Elm Park] Meganium (M) (IV: 75 - CP: 859) until 05:27:52AM at 121-137 Park Ave [nycpokemap.com/#40.63738049,-](https://nycpokemap.com/#40.63738049,-74.13202465) [maps.google.com/maps?q=40.6373](https://maps.google.com/maps?q=40.63738049,-74.13202465)";
let re = /.* at (.*) \[nycpokemap/;
let matchObj = re.exec(text);

if (matchObj) {
   console.log("matchObj  : " + matchObj);
   console.log("matchObj[1] : " + matchObj[1]);
} else {
   console.log("No match!!");
}