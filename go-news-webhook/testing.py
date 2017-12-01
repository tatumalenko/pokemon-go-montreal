
import re

text = "[Elm Park] Meganium (M) (IV: 75 - CP: 859) until 05:27:52AM at 121-137 Park Ave [nycpokemap.com/#40.63738049,-](https://nycpokemap.com/#40.63738049,-74.13202465) [maps.google.com/maps?q=40.6373](https://maps.google.com/maps?q=40.63738049,-74.13202465)"

matchObj = re.match( r'.* at (.*) \[nycpokemap', text)

if matchObj:
   print "matchObj.group()  : ", matchObj.group()
   print "matchObj.group(1) : ", matchObj.group(1)
else:
   print "No match!!"