(function(){
"use strict";
// Layout statistics from 30 fan-transcribed 1983 Paydirt team charts (counts per roll, not any one team's chart).
// AGG[play][roll] = [teams, INC, QT, PEN, INT, F, B, TD, out-of-bounds, median yards]
const AGG={"LP":{"10":[28,0,0,13,0,0,1,0,1,4.5],"11":[28,0,0,6,0,0,1,0,2,5],"12":[28,0,0,8,0,0,2,0,1,4.0],"13":[28,0,0,6,0,2,1,0,0,3],"14":[28,0,0,8,0,2,2,0,1,3.5],"15":[28,0,0,4,0,0,1,0,0,4],"16":[28,0,0,3,0,2,0,0,0,5],"17":[28,0,0,2,0,0,1,0,3,5],"18":[28,0,0,7,0,0,3,0,0,5.0],"19":[28,0,0,24,0,1,1,0,1,-1.5],"20":[28,0,0,5,0,4,1,0,0,4.0],"21":[28,0,0,2,0,1,1,0,0,4.0],"22":[28,0,0,4,0,1,3,0,1,4.0],"23":[28,0,0,1,0,2,1,0,0,4.0],"24":[28,0,0,0,0,0,1,0,0,4],"25":[28,0,0,0,0,0,1,0,0,5],"26":[28,0,0,3,0,3,2,0,1,2.5],"27":[28,0,0,2,0,2,2,0,0,4.0],"28":[28,0,0,3,0,5,1,0,1,5],"29":[28,0,0,10,0,1,1,0,0,5.0],"30":[28,0,0,2,0,0,1,0,0,4],"31":[28,0,0,3,0,2,2,0,0,3],"32":[28,0,0,1,0,0,0,0,0,4],"33":[28,0,0,0,0,0,3,0,0,4],"34":[28,0,0,0,0,0,1,0,0,4],"35":[28,0,0,0,0,0,0,0,0,4.0],"36":[28,0,0,2,0,0,0,0,0,4.0],"37":[28,0,0,1,0,1,3,0,1,5],"38":[28,0,0,5,0,1,2,0,0,3.5],"39":[28,0,0,5,0,1,2,0,0,6.0]},"OT":{"10":[28,0,0,9,0,1,2,0,0,5.5],"11":[28,0,0,7,0,0,0,0,1,5],"12":[28,0,0,6,0,4,1,0,1,5],"13":[28,0,0,6,0,5,0,0,1,5],"14":[28,0,0,3,0,2,0,0,0,3],"15":[28,0,0,4,0,3,0,0,2,4],"16":[28,0,0,6,0,2,0,0,1,4.5],"17":[28,0,0,2,0,0,0,0,3,5.0],"18":[28,0,0,12,0,0,0,0,0,5.5],"19":[28,0,0,20,0,1,0,0,0,2],"20":[28,0,0,4,0,0,1,0,3,4],"21":[28,0,0,4,0,1,0,0,0,5],"22":[28,0,0,3,0,1,0,0,0,4.0],"23":[28,0,0,3,0,1,2,0,0,4.0],"24":[28,0,0,0,0,0,5,0,1,3],"25":[28,0,0,1,0,0,2,0,1,4],"26":[28,0,0,1,0,1,2,0,1,4.5],"27":[28,0,0,3,0,1,0,0,0,5.0],"28":[28,0,0,3,0,2,1,0,1,3.0],"29":[28,0,0,13,0,2,1,0,1,4.5],"30":[28,0,0,1,0,1,3,0,1,4],"31":[28,0,0,2,0,1,1,0,0,5.0],"32":[28,0,0,1,0,0,3,0,1,4.5],"33":[28,0,0,0,0,0,2,0,1,3.0],"34":[28,0,0,0,0,0,3,0,1,4],"35":[28,0,0,0,0,0,3,0,1,4],"36":[28,0,0,0,0,0,1,0,0,5],"37":[28,0,0,2,0,0,3,0,1,4],"38":[28,0,0,5,0,1,1,0,0,5],"39":[28,0,0,9,0,2,2,0,2,3]},"ER":{"10":[28,0,0,11,0,3,1,0,4,2],"11":[28,0,0,6,0,0,0,0,3,4.5],"12":[28,0,0,6,0,3,1,0,5,5],"13":[28,0,0,6,0,4,3,0,4,3.5],"14":[28,0,0,5,0,1,0,0,6,2.5],"15":[28,0,0,1,0,4,0,0,6,1.5],"16":[28,0,0,4,0,2,0,0,8,5.0],"17":[28,0,0,6,0,2,1,0,4,4],"18":[28,0,0,17,0,1,1,0,3,1],"19":[28,0,0,13,0,3,1,0,2,-5],"20":[28,0,0,8,0,0,1,0,6,3],"21":[28,0,0,4,0,3,1,0,2,3.0],"22":[28,0,0,7,0,2,2,0,6,5],"23":[28,0,0,1,0,1,4,0,9,3.0],"24":[28,0,0,1,0,0,6,0,8,2],"25":[28,0,0,0,0,0,2,0,11,4],"26":[28,0,0,3,0,0,0,0,6,0],"27":[28,0,0,3,0,1,0,0,5,5.0],"28":[28,0,0,5,0,2,1,0,6,5],"29":[28,0,0,11,0,0,1,0,2,5.0],"30":[28,0,0,3,0,1,1,0,5,4],"31":[28,0,0,0,0,3,0,0,4,3.5],"32":[28,0,0,0,0,0,2,0,4,3.0],"33":[28,0,0,0,0,0,7,0,9,2],"34":[28,0,0,0,0,0,7,0,7,3.5],"35":[28,0,0,0,0,0,4,0,6,1.5],"36":[28,0,0,0,0,0,4,0,7,4.0],"37":[28,0,0,1,0,0,3,0,7,5],"38":[28,0,0,8,0,2,1,0,2,3],"39":[28,0,0,10,0,2,1,0,4,2]},"DR":{"10":[28,0,0,13,0,0,1,0,0,5.0],"11":[28,0,0,4,0,1,2,0,0,5],"12":[28,0,0,7,0,0,2,0,0,5],"13":[28,0,0,3,0,3,1,0,0,4],"14":[28,0,0,4,0,0,0,0,0,2.5],"15":[28,0,0,1,0,1,2,0,2,3.5],"16":[28,0,0,5,0,4,0,0,1,4],"17":[28,0,0,5,0,2,0,0,1,5],"18":[28,0,0,13,0,0,1,0,2,6.0],"19":[28,0,0,20,0,2,1,0,1,2],"20":[28,0,0,2,0,4,0,0,0,5.0],"21":[28,0,0,2,0,1,1,0,0,5.0],"22":[28,0,0,3,0,1,3,0,1,4],"23":[28,0,0,2,0,2,0,0,1,2.5],"24":[28,0,0,1,0,0,5,0,0,3.0],"25":[28,0,0,2,0,0,0,0,0,2.0],"26":[28,0,0,2,0,0,2,0,2,4.0],"27":[28,0,0,1,0,3,1,0,1,3],"28":[28,0,0,8,0,1,0,0,1,5],"29":[28,0,0,11,0,1,0,0,1,3.5],"30":[28,0,0,3,0,3,0,0,0,5.0],"31":[28,0,0,2,0,1,4,0,0,3],"32":[28,0,0,0,0,0,0,0,1,4.0],"33":[28,0,0,0,0,0,5,0,0,5],"34":[28,0,0,0,0,0,4,0,0,0.5],"35":[28,0,0,0,0,0,7,0,0,3],"36":[28,0,0,0,0,0,2,0,0,3.5],"37":[28,0,0,1,0,0,4,0,1,4],"38":[28,0,0,8,0,2,1,0,0,3],"39":[28,0,0,6,0,2,1,0,0,4]},"SC":{"10":[28,0,1,13,0,0,0,0,3,16],"11":[28,1,1,7,0,1,0,0,0,16.0],"12":[28,0,1,11,0,0,0,0,3,10],"13":[28,1,0,3,2,3,0,0,5,9],"14":[28,0,0,10,0,1,0,0,0,10],"15":[28,0,0,2,1,4,0,0,6,8.5],"16":[28,0,1,4,0,1,0,0,2,10.5],"17":[28,0,0,6,0,0,0,0,1,12.5],"18":[28,0,1,15,1,0,0,1,1,16.5],"19":[28,0,1,17,1,0,0,0,0,35],"20":[28,0,0,2,0,0,0,0,3,8],"21":[28,1,1,1,1,2,0,0,1,6.0],"22":[28,3,1,4,0,2,0,0,3,7.5],"23":[28,5,0,2,0,1,0,0,3,7.5],"24":[28,7,2,2,0,1,0,0,5,4.0],"25":[28,6,0,1,0,0,0,0,8,6],"26":[28,3,1,1,0,1,0,0,4,6],"27":[28,1,0,2,0,0,0,0,0,8],"28":[28,1,1,3,3,3,0,0,3,11],"29":[28,2,0,10,1,1,0,1,2,22],"30":[28,3,0,2,0,1,0,0,3,8.5],"31":[28,5,2,1,0,1,0,0,3,5],"32":[28,9,0,2,0,0,0,0,2,6],"33":[28,12,0,0,0,0,0,0,6,6],"34":[28,17,0,0,0,0,0,0,4,4],"35":[28,15,1,0,0,0,0,0,1,2.5],"36":[28,6,1,2,0,0,0,0,4,5],"37":[28,2,1,1,0,1,0,0,3,8],"38":[28,0,0,5,1,2,0,0,1,10.5],"39":[28,0,4,6,1,0,0,0,0,18]},"SP":{"10":[28,0,0,19,0,0,0,0,0,9],"11":[28,0,1,11,1,0,0,0,1,8],"12":[28,1,2,10,2,0,0,0,1,8],"13":[28,1,1,10,2,2,0,0,0,8.5],"14":[28,0,0,9,0,0,0,0,3,6],"15":[28,0,0,9,2,1,0,0,1,8.5],"16":[28,0,0,6,1,2,0,0,1,8],"17":[28,0,0,10,0,0,0,0,0,7.0],"18":[28,1,0,17,0,0,0,0,2,7.5],"19":[28,0,1,18,5,0,0,1,0,4],"20":[28,0,0,10,0,2,0,0,0,6.5],"21":[28,1,2,6,2,2,0,0,1,8],"22":[28,4,1,2,1,3,0,0,1,8],"23":[28,7,1,2,0,0,0,0,0,9.0],"24":[28,12,2,1,0,0,0,0,0,6],"25":[28,9,2,2,0,0,0,0,0,6],"26":[28,4,0,2,0,2,0,0,0,7.0],"27":[28,3,0,1,0,0,0,0,1,7.5],"28":[28,1,1,4,2,2,0,0,0,10.5],"29":[28,0,1,8,0,0,0,0,1,10],"30":[28,2,0,1,0,1,0,0,0,6.0],"31":[28,4,1,2,0,0,0,0,0,7],"32":[28,8,0,0,0,0,0,0,0,9.0],"33":[28,13,0,0,0,0,0,0,0,5],"34":[28,16,0,0,0,0,0,0,0,6.5],"35":[28,10,3,0,0,0,0,0,0,7],"36":[28,8,1,0,0,0,0,0,0,7],"37":[28,5,4,1,1,0,0,0,0,8],"38":[28,0,2,5,0,0,0,0,2,7],"39":[28,0,1,10,3,2,0,0,1,7.5]},"MP":{"10":[28,0,0,17,1,0,0,0,1,15.0],"11":[28,0,3,8,5,0,0,0,4,13.5],"12":[28,0,3,8,0,0,0,0,1,16],"13":[28,0,1,14,1,2,0,0,2,13.5],"14":[28,0,1,11,2,0,0,0,2,15.0],"15":[28,0,3,9,1,0,0,1,2,15.5],"16":[28,1,2,5,1,0,0,0,4,13],"17":[28,2,1,8,3,0,0,0,2,13.5],"18":[28,1,2,15,2,0,0,0,1,17.5],"19":[28,0,2,22,0,1,0,0,0,17],"20":[28,1,0,6,2,2,0,0,1,15],"21":[28,3,0,4,2,1,0,0,4,13.0],"22":[28,5,3,8,1,1,0,0,1,15.5],"23":[28,6,2,1,2,2,0,0,1,11],"24":[28,14,2,0,0,0,0,0,0,14.0],"25":[28,10,2,1,1,0,0,0,2,12.5],"26":[28,5,2,5,0,0,0,0,1,12.5],"27":[28,2,1,3,0,0,0,0,2,14.5],"28":[28,4,1,2,2,1,0,0,2,14.0],"29":[28,2,0,10,0,0,0,0,3,15.5],"30":[28,1,1,3,3,0,0,0,1,14.0],"31":[28,5,1,3,1,0,0,0,1,15.0],"32":[28,10,0,0,1,0,0,0,3,13],"33":[28,20,0,0,0,0,0,0,1,13.5],"34":[28,22,2,0,0,0,0,0,0,13.5],"35":[28,18,2,0,0,0,0,0,1,16.0],"36":[28,15,3,0,0,0,0,0,1,13.0],"37":[28,6,4,3,1,0,0,0,1,14.0],"38":[28,2,1,7,2,3,0,0,1,16],"39":[28,0,3,5,2,0,0,0,5,15.0]},"LG":{"10":[28,0,1,15,3,0,0,0,2,47],"11":[28,1,1,6,2,0,0,1,4,35],"12":[28,1,2,7,1,1,0,1,1,41],"13":[28,0,4,11,1,0,0,1,4,29],"14":[28,3,7,6,1,0,0,0,1,26],"15":[28,2,5,7,2,1,0,1,2,24.5],"16":[28,3,3,7,2,0,0,0,1,35],"17":[28,2,0,6,2,0,0,1,3,36],"18":[28,1,0,15,2,1,0,3,1,42.5],"19":[28,0,0,22,0,0,0,2,0,52.5],"20":[28,1,1,8,2,0,0,1,4,32],"21":[28,2,5,8,4,0,0,1,3,28.5],"22":[28,3,6,6,1,1,0,1,4,25.0],"23":[28,8,2,7,4,0,0,0,3,24],"24":[28,13,5,3,2,0,0,0,2,26],"25":[28,12,4,2,0,0,0,2,4,28.0],"26":[28,7,5,2,3,0,0,0,3,27],"27":[28,7,4,1,1,0,0,0,3,31],"28":[28,3,1,2,2,1,0,2,3,33],"29":[28,3,1,6,2,0,0,1,2,44],"30":[28,15,2,2,2,1,0,1,1,25],"31":[28,20,3,2,0,0,0,0,1,26],"32":[28,23,0,0,3,0,0,0,1,62.5],"33":[28,23,2,0,0,0,0,0,2,29],"34":[28,19,3,0,0,0,0,0,2,45.0],"35":[28,18,7,1,0,0,0,0,0,34.0],"36":[28,16,6,0,1,0,0,0,4,25],"37":[28,11,5,3,0,0,0,0,3,26],"38":[28,9,1,9,1,0,0,2,0,34.5],"39":[28,3,4,9,0,0,0,1,2,40]},"SL":{"10":[28,1,1,16,0,0,0,1,4,23],"11":[28,1,1,10,1,0,0,0,7,12],"12":[28,1,2,9,1,4,0,0,5,16],"13":[28,2,3,2,0,2,0,0,9,13],"14":[28,3,0,3,1,0,0,0,13,12.0],"15":[28,4,0,5,1,0,0,0,9,13.5],"16":[28,3,0,7,0,1,0,0,7,15],"17":[28,0,3,8,2,1,0,0,4,9.5],"18":[28,0,0,17,1,0,0,0,4,32.0],"19":[28,0,1,21,0,0,0,0,4,23.5],"20":[28,2,1,7,2,0,0,0,7,16.0],"21":[28,3,0,6,2,0,0,0,6,12],"22":[28,5,2,5,2,0,0,0,6,14.5],"23":[28,5,4,2,0,1,0,0,8,8.0],"24":[28,7,3,2,0,0,0,0,9,13.0],"25":[28,7,2,2,0,0,0,0,8,7],"26":[28,5,1,4,0,1,0,0,7,13],"27":[28,4,1,5,1,1,0,0,4,13.5],"28":[28,1,0,8,1,1,0,0,7,17],"29":[28,2,1,8,1,0,0,0,8,13.0],"30":[28,11,2,2,0,0,0,0,4,9],"31":[28,12,1,2,0,0,0,0,5,11],"32":[28,14,3,2,1,1,0,0,0,9],"33":[28,18,0,1,0,0,0,0,4,10],"34":[28,20,0,0,0,0,0,0,4,8.0],"35":[28,21,1,0,0,0,0,0,5,11.5],"36":[28,17,1,0,0,0,0,0,6,7.0],"37":[28,10,2,4,1,0,0,0,10,8],"38":[28,6,1,4,3,3,0,0,5,15],"39":[28,2,2,12,3,0,0,0,5,5]}};
// Typical defense box per formation+dice+play (entries most 1983 charts share; blank cells left out).
const DEFT={"A1DR":["p",1],"A1MP":["n",-4],"A1LG":["INC",null],"A2DR":["p",1],"A2SC":["p",0],"A2MP":["n",-2],"A2LG":["n",-10],"A3LP":["n",1],"A3OT":["n",4],"A3ER":["n",1],"A3DR":["p",1],"A3SC":["p",1],"A3SP":["n",-1],"A3MP":["p",8],"A3LG":["n",-14],"A4SC":["n",-4],"A4MP":["n",-10],"A4LG":["n",-16],"A4SL":["n",-10],"A5SC":["INC",null],"A5MP":["p",29],"A5LG":["INT",28],"A5SL":["INC",null],"B1LP":["p",1],"B1OT":["p",1],"B1DR":["p",0],"B1MP":["p",16],"B2LP":["p",1],"B2OT":["p",1],"B2DR":["p",0],"B3LP":["p",1],"B3OT":["p",1],"B3ER":["n",-1],"B3DR":["n",-2],"B3SP":["n",1],"B3LG":["n",-2],"B4LP":["p",1],"B4OT":["p",1],"B4SC":["n",-5],"B4MP":["p",22],"B4LG":["p",28],"B5ER":["p",1],"B5SC":["n",2],"B5MP":["p",28],"B5LG":["pTD",null],"B5SL":["p",21],"C1ER":["p",1],"C1SC":["n",-6],"C1SL":["INC",null],"C2ER":["p",1],"C2SC":["n",-2],"C2SP":["n",-4],"C2LG":["n",-9],"C2SL":["n",-6],"C3LP":["n",3],"C3ER":["p",1],"C3SP":["n",-3],"C3MP":["p",7],"C3LG":["INC",null],"C3SL":["n",-6],"C4SP":["n",-5],"C4LG":["n",-16],"C4SL":["n",-8],"C5SC":["p",-3],"C5SP":["n",-5],"C5MP":["p",18],"C5LG":["p",43],"C5SL":["INT",12],"D1LP":["n",3],"D1OT":["n",2],"D1SP":["p",3],"D1MP":["n",-6],"D1LG":["INC",null],"D1SL":["p",10],"D2LP":["n",1],"D2OT":["n",1],"D2SP":["p",2],"D2MP":["n",-8],"D3LP":["n",1],"D3OT":["n",2],"D3ER":["n",2],"D3DR":["n",2],"D3SP":["p",0],"D3MP":["INC",null],"D3LG":["n",-12],"D3SL":["p",6],"D4DR":["p",8],"D4SC":["n",-3],"D4SP":["n",-4],"D4MP":["n",-10],"D4LG":["n",-20],"D4SL":["n",-9],"D5SP":["INC",null],"D5MP":["INT",14],"D5LG":["p",28],"D5SL":["n",-7],"E1LP":["n",4],"E1DR":["n",5],"E1LG":["INC",null],"E1SL":["p",9],"E2LP":["n",1],"E2OT":["n",2],"E2DR":["n",2],"E2LG":["INC",null],"E3LP":["n",1],"E3OT":["n",1],"E3DR":["n",2],"E3MP":["n",-2],"E3LG":["INT",32],"E4DR":["n",3],"E4MP":["n",-10],"E4LG":["INT",30],"E4SL":["p",14],"E5DR":["n",2],"E5SP":["p",16],"E5MP":["p",20],"E5LG":["INT",33],"E5SL":["n",-3],"F1LP":["n",-2],"F1ER":["n",0],"F1DR":["n",-2],"F1SC":["n",5],"F1SP":["n",2],"F1MP":["QT",null],"F1LG":["QT",null],"F1SL":["QT",null],"F2OT":["n",-3],"F2ER":["n",-2],"F2DR":["n",0],"F2SC":["n",11],"F2MP":["QT",null],"F2LG":["QT",null],"F3LP":["p",0],"F3ER":["n",-2],"F3DR":["n",6],"F3SC":["n",4],"F3SP":["n",-2],"F3MP":["QT",null],"F3LG":["QT",null],"F3SL":["QT",null],"F4ER":["n",2],"F4DR":["n",3],"F4SC":["n",8],"F4SP":["p",16],"F4MP":["INT",14],"F4LG":["QT",null],"F4SL":["n",-10],"F5LP":["n",-2],"F5ER":["n",-10],"F5DR":["n",3],"F5SC":["pTD",null],"F5SP":["pTD",null],"F5MP":["INT",14],"F5LG":["pTD",null],"F5SL":["pTD",null]};
// ---------- Teams (Super Bowl LVII, Feb 12 2023: KC 38, PHI 35) ----------
const TEAMS = {
  KC:{key:"KC",name:"Chiefs",city:"Kansas City",short:"KC",color:"var(--kc)",cls:"kc",
      blurb:"Mahomes on a bad ankle, Kelce underneath, a 65-yard Toney punt return, and the late Butker field goal."},
  PHI:{key:"PHI",name:"Eagles",city:"Philadelphia",short:"PHI",color:"var(--phi)",cls:"phi",
      blurb:"Jalen Hurts ran for 70 yards and 3 TDs and threw for 304. Outgained KC 417 to 340 and owned the clock."}
};

// ---------- Paydirt dice ----------
// Offense: BLACK die (tens) + two WHITE dice (ones). Defense: RED + GREEN.
// Faces below are what each die's 1-6 face reads as, so normal dice give the exact Paydirt odds.
const BLACK=[1,2,2,3,3,3], WHITE=[0,1,2,3,4,5], BLUE=[0,0,1,2,3,4], RED=[1,1,1,2,2,3], GREEN=[0,0,0,0,1,2];
const d6=()=>1+Math.floor(Math.random()*6);
const tensOf=f=>BLACK[f-1];
const offValue=(t,a,b)=>BLACK[t-1]*10+WHITE[a-1]+BLUE[b-1];   // 10..39
const defValue=(r,g)=>RED[r-1]+GREEN[g-1];                       // 1..5
const OFFP={}; for(let t=1;t<=6;t++)for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){const R=offValue(t,a,b);OFFP[R]=(OFFP[R]||0)+1;}
const DEFP={}; for(let r=1;r<=6;r++)for(let g=1;g<=6;g++){const D=defValue(r,g);DEFP[D]=(DEFP[D]||0)+1;}
const ROLLS=[]; for(let R=10;R<=39;R++) ROLLS.push(R);

// ---------- Plays (Paydirt's nine) and defenses (A-F) ----------
const PLAYS = {
  LP:{n:1,name:"Line Plunge",cat:"run",desc:"Straight ahead, short yardage"},
  OT:{n:2,name:"Off Tackle",cat:"run",desc:"Power run off the tackle"},
  ER:{n:3,name:"End Run",cat:"run",desc:"Sweep to the edge"},
  DR:{n:4,name:"Draw",cat:"run",desc:"Fake pass, hand off late"},
  SC:{n:5,name:"Screen",cat:"pass",desc:"Dump-off behind the rush"},
  SP:{n:6,name:"Short Pass",cat:"pass",desc:"Quick slant / out"},
  MP:{n:7,name:"Medium Pass",cat:"pass",desc:"Dig / seam, 10–20 yards"},
  LG:{n:8,name:"Long Pass",cat:"pass",desc:"Go route, high risk"},
  SL:{n:9,name:"Sideline Pass",cat:"pass",desc:"Catch and step out"}
};
const OFF_ORDER=["LP","OT","ER","DR","SC","SP","MP","LG","SL"];
const DEFS = {
  A:{name:"A · Standard",short:"A",desc:"Balanced 4-3. No big holes, no wall"},
  B:{name:"B · Short Yardage",short:"B",desc:"Stack the box. Stops plunges and off tackle; weak deep"},
  C:{name:"C · Spread",short:"C",desc:"Spread out. Stops end runs and screens; soft inside"},
  D:{name:"D · Short Pass",short:"D",desc:"Underneath zones. Stops short and sideline passes"},
  E:{name:"E · Long Pass",short:"E",desc:"Prevent. Stops the long pass; gives up draws and runs"},
  F:{name:"F · Blitz",short:"F",desc:"Send the house. Sacks deep drops, stuffs inside runs; screens and draws beat it, and it can get burned deep"}
};
const DEF_ORDER=["A","B","C","D","E","F"];
// Matchup from the offense's view: + = defense guessed wrong, - = defense guessed right.
const GRID = {
  LP:{A:0,B:-2,C:1,D:1,E:2,F:-1},
  OT:{A:0,B:-2,C:1,D:1,E:2,F:-1},
  ER:{A:0,B:-1,C:-2,D:1,E:1,F:1},
  DR:{A:0,B:-1,C:1,D:1,E:2,F:2},
  SC:{A:0,B:1,C:-1,D:-1,E:1,F:2},
  SP:{A:0,B:1,C:0,D:-2,E:0,F:-1},
  MP:{A:0,B:1,C:0,D:-1,E:-1,F:0},
  LG:{A:0,B:2,C:0,D:1,E:-2,F:1},
  SL:{A:0,B:1,C:-1,D:-2,E:-1,F:-1}
};
// Team strengths (★): better odds on these plays.
const RATE = {
  KC:{LP:0,OT:0,ER:0,DR:1,SC:1,SP:1,MP:1,LG:0,SL:1},
  PHI:{LP:1,OT:0,ER:0,DR:0,SC:0,SP:1,MP:1,LG:1,SL:0}
};
const DEFRATE = {KC:{A:0,B:0,C:0,D:1,E:0,F:0}, PHI:{A:0,B:0,C:0,D:0,E:0,F:1}};

// ---------- Chart building ----------
// Turn bands [{p,k,lo,hi}] (worst to best) into one result per roll.
// Layout rule (keeps each band's real probability exactly):
//   30s (half of all rolls) hold the everyday middle results, rising from 30 to 39.
//   20s split: 20-24 sit just below the middle, 25-29 just above it.
//   10s (rarest) hold the extremes: 10-14 the worst results, 15-19 the best.
function bandsToRows(rolls,bands){
  const tot=rolls.reduce((a,R)=>a+OFFP[R],0); const sumP=bands.reduce((a,b)=>a+b.p,0);
  const grp=R=>{ const t=Math.floor(R/10), lo=(R%10)<5; return t===1?(lo?0:4):t===2?(lo?1:3):2; };
  const order=rolls.slice().sort((x,y)=>grp(x)-grp(y)||x-y);
  let acc=0; const mid={}; order.forEach(R=>{ mid[R]=(acc+OFFP[R]/2)/tot; acc+=OFFP[R]; });
  const out={};
  rolls.forEach(R=>{ const m=Math.max(0,Math.min(.9999,mid[R]));
    let c=0, bi=0; for(;bi<bands.length;bi++){ const w=bands[bi].p/sumP; if(m<c+w||bi===bands.length-1) break; c+=w; }
    const b=bands[bi]; const w=b.p/sumP; const pos=Math.max(0,Math.min(1,(m-c)/w));
    out[R]={k:b.k, y:b.lo!=null?Math.round(b.lo+(b.hi-b.lo)*pos):undefined};
  });
  return out;
}
// ---------- Where each kind of box goes (from real Paydirt charts) ----------
// AGG (pdata.js) counts, for every play and roll, how many of the 30 1983 team charts put an
// incomplete, QT, penalty, interception, fumble, breakaway or TD on that roll. We place each
// kind of box on the rolls where the real charts most often had it, so the black (incomplete)
// boxes come in the same long stretches, and penalties land on 19, 29 and 39 like the originals.
// How often each kind of box comes up (share of all 216 rolls), before team strength.
const TARGET={
  LP:{F:2.5,B:1.5,PEN:6}, OT:{F:2.5,B:1.5,PEN:6}, ER:{F:2.5,B:2.5,PEN:6}, DR:{F:2.5,B:1.5,PEN:6},
  SC:{INT:.9,F:1,QT:2.5,B:2,PEN:6,INC:23}, SP:{INT:1,QT:3.5,B:1.5,PEN:6,INC:27},
  MP:{INT:1.5,QT:4.5,B:1.5,PEN:6,INC:35}, LG:{TD:1.5,INT:2,QT:7,PEN:6,INC:45}, SL:{INT:1,QT:4,B:1,PEN:6,INC:33}
};
const AGGI={INC:1,QT:2,PEN:3,INT:4,F:5,B:6,TD:7};
const PLACE_ORDER=["TD","INT","F","QT","B","PEN","INC"];   // rarest first
// Yard results once the special boxes are placed, worst to best (share of the remaining rolls).
const BANDS = {
  LP:[{p:10,lo:-1,hi:0},{p:30,lo:1,hi:2},{p:35,lo:3,hi:4},{p:18,lo:5,hi:7},{p:7,lo:8,hi:12}],
  OT:[{p:14,lo:-3,hi:-1},{p:24,lo:0,hi:2},{p:36,lo:3,hi:5},{p:18,lo:6,hi:9},{p:8,lo:10,hi:18}],
  ER:[{p:20,lo:-4,hi:-1},{p:18,lo:0,hi:2},{p:30,lo:3,hi:6},{p:22,lo:7,hi:11},{p:10,lo:13,hi:20}],
  DR:[{p:16,lo:-2,hi:0},{p:26,lo:1,hi:3},{p:34,lo:4,hi:6},{p:17,lo:7,hi:11},{p:7,lo:12,hi:20}],
  SC:[{p:18,lo:-3,hi:0},{p:31,lo:1,hi:4},{p:38,lo:5,hi:9},{p:13,lo:10,hi:20}],
  SP:[{p:37,lo:2,hi:5},{p:36,lo:6,hi:8},{p:27,lo:9,hi:14}],
  MP:[{p:35,lo:8,hi:12},{p:40,lo:13,hi:17},{p:25,lo:18,hi:26}],
  LG:[{p:36,lo:20,hi:28},{p:38,lo:29,hi:40},{p:26,lo:41,hi:60}],
  SL:[{p:35,lo:3,hi:6},{p:42,lo:7,hi:10},{p:23,lo:11,hi:17}]
};
function aggOf(pk,R){ return (typeof AGG!=="undefined"&&AGG[pk]&&AGG[pk][R])||[1,0,0,0,0,0,0,0,0,0]; }
function placeBoxes(pk,team){
  const r=RATE[team][pk]||0; const t={...TARGET[pk]};
  if(t.INC) t.INC=Math.max(5,t.INC-4*r);
  if(t.QT) t.QT*=team==="KC"?.7:1.2;
  const kind={}; let free=ROLLS.slice();
  for(const k of PLACE_ORDER){ if(!t[k]) continue;
    const want=t[k]/100*216;
    // rolls the real charts used most for this box; ties go to the roll with fewer ways to come up
    const cand=free.slice().sort((x,y)=>{ const ax=aggOf(pk,x), ay=aggOf(pk,y); return ay[AGGI[k]]/ay[0]-ax[AGGI[k]]/ax[0] || OFFP[x]-OFFP[y] || x-y; });
    let got=0;
    for(const R of cand){ if(got>=want*.9) break; if(aggOf(pk,R)[AGGI[k]]===0 && k!=="INC") continue;
      if(got+OFFP[R]>want*1.2) continue; kind[R]=k; got+=OFFP[R]; }
    if(!got){ const R=cand.filter(R=>OFFP[R]<=Math.max(1,want*1.5))[0]; if(R) kind[R]=k; }
    free=free.filter(R=>!kind[R]);
  }
  return {kind,free};
}
function penBox(pk,R){ const pass=PLAYS[pk].cat==="pass";
  if(R===19||R===29||R===39) return pass?{k:"pen",side:"PI",yds:pk==="LG"?30:15,fd:true}:{k:"pen",side:"DEF",yds:15,fd:true};
  if(R<20) return R%2?{k:"pen",side:"DEF",yds:5}:{k:"pen",side:"OFF",yds:pk==="LP"?5:10};
  return R%2?{k:"pen",side:"DEF",yds:5}:{k:"pen",side:"OFF",yds:5}; }
const INTY={SC:2,SP:7,MP:14,LG:30,SL:9};
// Yard boxes use the grouped layout: the 30s (half of all rolls) hold the everyday gains,
// 20-24 just below and 25-29 just above, the rare 10s the extremes.
function yardRows(pk,team,rolls){
  const r=RATE[team][pk]||0;
  return bandsToRows(rolls,BANDS[pk].map(b=>({p:b.p,k:"y",lo:b.lo+r,hi:b.hi+2*r})));
}
const CHART={};
function buildCharts(){
  for(const team of ["KC","PHI"]){
    CHART[team]={};
    for(const pk of OFF_ORDER){
      const {kind,free}=placeBoxes(pk,team); const yr=yardRows(pk,team,free); const col={}; const pass=PLAYS[pk].cat==="pass";
      ROLLS.forEach(R=>{ const k=kind[R]; let c;
        if(!k) c=yr[R];
        else if(k==="INC") c={k:"inc"};
        else if(k==="QT") c={k:"qt"};
        else if(k==="B") c={k:"b"};
        else if(k==="TD") c={k:"b"};
        else if(k==="INT") c={k:"int",y:INTY[pk]||7};
        else if(k==="F") c={k:"f",y:pass?2:(R%2?-1:1)};
        else c=penBox(pk,R);
        if(c.k==="y"){
          if(pk==="LP" && c.y>=1 && c.y<=3 && (team==="PHI"||R%2===1)) c.paren=true;   // power push the defense can't stop
          const a=aggOf(pk,R); if(c.y>0 && (pk==="SL" || a[8]/a[0]>=.15)) c.ob=true;
        }
        col[R]=c; });
      CHART[team][pk]=col;
    }
    // Quarterback trapped: offense rolls again on this column.
    const qtB = team==="KC"
      ? [{p:18,k:"y",lo:-10,hi:-5},{p:14,k:"y",lo:-4,hi:-1},{p:24,k:"inc"},{p:20,k:"y",lo:0,hi:6},{p:15,k:"y",lo:7,hi:14},{p:9,k:"y",lo:15,hi:28}]
      : [{p:34,k:"y",lo:-10,hi:-5},{p:24,k:"y",lo:-4,hi:-1},{p:10,k:"inc"},{p:14,k:"y",lo:0,hi:7},{p:12,k:"y",lo:8,hi:15},{p:6,k:"y",lo:16,hi:30}];
    const qr=bandsToRows(ROLLS.filter(R=>R!==10&&R!==20),qtB); qr[10]={k:"f",y:-8}; qr[20]={k:"f",y:-6};
    ROLLS.forEach(R=>{ if(qr[R].k==="y"&&qr[R].y>0) qr[R].scr=true; if(qr[R].k==="y"&&qr[R].y<0) qr[R].sack=true; });
    CHART[team].QT=qr;
    // Breakaway: offense rolls again on this column.
    const bk=bandsToRows(ROLLS,[{p:40,k:"y",lo:15,hi:30},{p:30,k:"y",lo:31,hi:50},{p:18,k:"y",lo:51,hi:75},{p:12,k:"td"}]);
    CHART[team].B=bk;
    // Interception return (the team that picked it off rolls).
    const ir=bandsToRows(ROLLS.filter(R=>R!==39),[{p:30,k:"y",lo:0,hi:0},{p:35,k:"y",lo:1,hi:10},{p:25,k:"y",lo:11,hi:25},{p:10,k:"y",lo:26,hi:45}]); ir[39]={k:"td"};
    CHART[team].IR=ir;
    // Kickoff return (receiving team's starting yard line). 39 = return TD.
    const kr=bandsToRows(ROLLS.filter(R=>R!==39),[{p:20,k:"y",lo:15,hi:24},{p:55,k:"tb",lo:25,hi:25},{p:18,k:"y",lo:26,hi:35},{p:7,k:"y",lo:36,hi:50}]); kr[39]={k:"td"};
    CHART[team].KR=kr;
    // Punt (net yards). 10 = blocked. 39 = long return (net 10).
    const pu=bandsToRows(ROLLS.filter(R=>R!==10&&R!==39),[{p:30,k:"y",lo:30,hi:36},{p:40,k:"y",lo:37,hi:42},{p:30,k:"y",lo:43,hi:52}]); pu[10]={k:"blk"}; pu[39]={k:"ret",y:10};
    CHART[team].PU=pu;
    // Field goal: longest kick that is good. 10 = blocked.
    const fg={}; let acc=0; const tot=216;
    ROLLS.forEach(R=>{ const q=(acc+OFFP[R]/2)/tot; acc+=OFFP[R];
      // success curve: 25 yds ~99%, 35 ~ 92%, 45 ~ 78%, 50 ~ 60%, 55 ~ 35%, 60 ~ 12%
      const pts=[[0,20],[.02,25],[.08,35],[.22,45],[.40,50],[.65,55],[.88,60],[1,64]];
      let d=20; for(let i=1;i<pts.length;i++){ if(q<=pts[i][0]){ const [q0,d0]=pts[i-1],[q1,d1]=pts[i]; d=Math.round(d0+(d1-d0)*(q-q0)/(q1-q0)); break; } }
      fg[R]=R===10?{k:"blk"}:{k:"y",y:d}; });
    CHART[team].FG=fg;
    // Extra point: red box = no good.
    const xp={}; ROLLS.forEach(R=>xp[R]=R<=11?{k:"ng"}:{k:"ok"}); CHART[team].XP=xp;
    ["KR","PU","FG","IR","B"].forEach(k=>ROLLS.forEach(R=>{ const c=CHART[team][k][R]; if(c&&c.k==="y") c.plain=true; }));
  }
}
buildCharts();
// Fumble recovery: the team that fumbled rolls. Keeps it on these rolls.
const FUMKEEP=R=>R<=28;
const FUMSCOOP=R=>R>=37;   // lost and returned; 39 = scoop and score

// Defense chart box: what defense roll D (1-5) does to play pk under formation dk.
// How hard each play swings with the defense (long passes swing most, the line plunge least).
const DSCALE={LP:.5,OT:.75,ER:1,DR:1,SC:1,SP:1,MP:1.5,LG:2.5,SL:1};
function defBox(pk,dk,D){
  const p=PLAYS[pk]; const M=GRID[pk][dk]; const pass=p.cat==="pass"; const k=DSCALE[pk];
  const Y=(v,paren)=>({k:"y",y:Math.round(v*k)||0,paren:!!paren});
  const TD={k:"y",y:99,paren:true,td:true};
  // Blitz: gets home on deep drops, but a rare 5 means it got burned for a touchdown (as on the 1983 charts).
  if(dk==="F" && D===5 && pk==="LG") return TD;
  if(dk==="F" && D===5 && pk==="SL") return {k:"y",y:15,paren:true};
  if(dk==="F" && D===5 && pk==="MP") return {k:"y",y:20,paren:true};
  if(dk==="F" && pass && pk!=="SC" && D>=4) return {k:"qt"};
  if(dk==="F" && pass && pk!=="SC" && D===3) return Y(-3);
  // Screen and draw are built to beat the blitz: the rush runs right past them.
  if(dk==="F" && (pk==="SC"||pk==="DR")) return [null,Y(2),Y(4),{k:"y",y:6,paren:true},{k:"y",y:12,paren:true},{k:"y",y:20,paren:true}][D];
  // Stacking the box for short yardage leaves nobody deep.
  // Coverage entries from the real defense charts: prevent and zones take the ball away.
  if(dk==="E" && pk==="LG"){ if(D===5) return {k:"int",y:30}; if(D===4) return {k:"inc"}; }
  if(dk==="E" && pk==="MP" && D===5) return {k:"inc"};
  if(dk==="D" && D===5 && pk==="SP") return {k:"int",y:8};
  if(dk==="C" && D===5 && pk==="SL") return {k:"int",y:12};
  if(dk==="A" && D===5 && pk==="LG") return {k:"int",y:28};
  if(dk==="B" && D===5 && pk==="LG") return TD;
  if(dk==="B" && D===5 && pk==="MP") return {k:"y",y:28,paren:true};
  if(M>=1) return Y([0,M*2,M,0,-2,-3][D]);
  if(M===0){ if(D===5) return pass?{k:"qt"}:Y(-2,true); return Y([0,1,0,-1,-3][D]); }
  const a=-M; // defense guessed right
  if(D===1) return Y(-1);
  if(D===2) return Y(-2*a);
  if(D===3) return {k:"y",y:Math.round((3-2*a)*Math.min(1,k)),paren:true};
  if(D===4) return pass?{k:"qt"}:{k:"y",y:-1-a,paren:true};
  return pass?{k:"qt"}:{k:"y",y:-3,paren:true};
}

// ---------- Resolving a play (the Paydirt priority rules) ----------
function boxTxt(c){ if(!c) return "";
  if(c.k==="y"){ if(c.td) return "(TD)"; const v=c.plain?String(c.y):(c.y>0?"+":"")+c.y; return c.paren?`(${v})`:v; }
  return ({inc:"INC",qt:"QT",b:"B",td:"TD",tb:"TB 25",blk:"BLK",ng:"NO",ok:"GOOD",ret:"RET"})[c.k]||(c.k==="int"?`INT ${c.y}`:c.k==="f"?`F ${c.y>0?"+":""}${c.y}`:c.k==="pen"?`${c.side} ${c.yds}${c.fd?"*":""}`:c.k);
}
function fmtGain(y){return y>0?`gain of ${y}`:y===0?"no gain":`loss of ${-y}`;}
// Combine an offense box and a defense box. Returns {kind, y, why, follow?}
// The real Paydirt priority chart: flags first, then fumbles, then anything special in the
// DEFENSE box ( (TD), (n), QT, black, INT ), then the offense box; two plain numbers add.
function combine(o,d,pk){
  const pass=PLAYS[pk].cat==="pass";
  if(o.k==="pen") return {kind:"pen",pen:o,why:o.side==="OFF"?`Penalty on the offense, ${o.yds} yards.`:o.side==="PI"?`Pass interference, ${o.yds} yards and a first down.`:`Penalty on the defense, ${o.yds} yards${o.fd?" and a first down":""}.`};
  if(o.k==="f") return {kind:"follow",follow:"FUM",y:o.y,why:"Fumble! The offense rolls to see who recovers."};
  if(d.k==="y"&&d.td) return {kind:"y",y:99,why:"Defense box (TD): the defense got burned. Touchdown!"};
  if(d.k==="y"&&d.paren){
    if(o.k==="y"&&o.paren) return {kind:"y",y:o.y+d.y,why:"Both boxes in ( ): add them."};
    return {kind:"y",y:d.y,why:"Defense box in ( ) overrules the offense box."};
  }
  if(d.k==="qt") return {kind:"follow",follow:"QT",why:"The rush gets home: quarterback trapped! Offense rolls on its QT column."};
  if(d.k==="inc") return pass?{kind:"inc",y:0,why:"Black defense box: covered, incomplete."}:{kind:"y",y:0,why:"Black defense box: stuffed, no gain."};
  if(d.k==="int") return {kind:"follow",follow:"INT",y:o.k==="int"?Math.min(o.y,d.y):d.y,why:"Defense box INT: picked off! Defense rolls for the return."};
  if(o.k==="b") return {kind:"follow",follow:"B",why:"Breakaway! Offense rolls on its Breakaway column."};
  if(o.k==="qt") return {kind:"follow",follow:"QT",why:"Quarterback trapped! Offense rolls on its QT column."};
  if(o.k==="int") return {kind:"follow",follow:"INT",y:o.y,why:"Intercepted! Defense rolls for the return."};
  if(o.k==="inc") return {kind:"inc",y:0,why:"Incomplete."};
  if(o.paren) return {kind:"y",y:o.y,why:"Offense box in ( ) overrules."};
  return {kind:"y",y:o.y+d.y,why:"Add the boxes."};
}
// When a flag comes up, the offense dice are rolled again for the play itself and the team that
// was fouled takes whichever is better for them (Paydirt's accept-or-decline rule).
function penaltyChoice(s,team,pk,res){
  const p=res.pen; let alt=null, R2=0;
  for(let i=0;i<20&&!alt;i++){ const dz={t:d6(),a:d6(),b:d6()}; R2=offValue(dz.t,dz.a,dz.b); const o2=CHART[team][pk][R2]; if(o2.k==="pen") continue; alt=combine(o2,res.d,pk); alt.R=R2; alt.o=o2; alt.dice=dz; }
  if(!alt) return {decline:false};
  const g=toGoal(s); let py=p.side==="OFF"?-p.yds:p.yds; if(py>0&&py>=g) py=Math.max(1,Math.floor(g/2));
  let decline=false;
  if(p.side==="OFF"){ // defense was fouled
    if(alt.kind==="follow") decline=alt.follow==="INT"||alt.follow==="FUM";
    else if(alt.kind==="inc") decline=s.down>=3;
    else decline=alt.y<=py || (s.down>=3 && alt.y<s.toGo);
  } else { // offense was fouled
    const penFirst=p.fd||py>=s.toGo;
    if(alt.kind==="follow") decline=alt.follow==="B";
    else if(alt.kind==="y") decline=alt.y>=Math.min(py,g) && (alt.y>=s.toGo || !penFirst);
  }
  return {decline,alt};
}
function resolveScrimmage(team,pk,dk,dice){
  const R=offValue(dice.t,dice.a,dice.b);
  let D=defValue(dice.d1,dice.d2)+(DEFRATE[other(team)][dk]||0); if(D>5)D=5;
  const o=CHART[team][pk][R]; const d=defBox(pk,dk,D);
  const out=combine(o,d,pk); out.R=R; out.D=D; out.o=o; out.d=d; out.ob=!!o.ob;
  return out;
}

// ---------- Game state ----------
const other=t=>t==="KC"?"PHI":"KC";
const dir=t=>t==="KC"?1:-1;
const toGoal=(s)=>s.poss==="KC"?100-s.ball:s.ball;
function spotName(abs){ if(abs===50)return "50"; return abs<50?`KC ${abs}`:`PHI ${100-abs}`; }
function ownToAbs(team,own){return team==="KC"?own:100-own;}

function newGame(qmin,nq){
  return {v:4,rev:1,phase:"lobby",poss:null,ball:25,down:1,toGo:10,q:1,qmin:qmin||8,nq:nq||4,clock:(qmin||8)*60,running:false,to:{KC:3,PHI:3},paused:false,score:{KC:0,PHI:0},
          recv1:null,last:null,log:[],winner:null,ot:false,started:Date.now()};
}
function addLog(s,team,txt){s.log.unshift({t:team,x:txt,q:s.q});if(s.log.length>14)s.log.length=14;}
function startPossession(s,team,own){s.poss=team;s.ball=ownToAbs(team,own);s.down=1;s.toGo=Math.min(10,toGoal(s));}
function tick(s){}

// ---------- Clock ----------
// Paydirt-style timing in 10-second boxes: the snap itself uses 1 box; a running clock also burns the huddle.
const TEMPO={normal:{name:"Normal huddle",secs:30},hurry:{name:"Hurry-up",secs:10},milk:{name:"Run the clock",secs:40}};
const PLAYSECS={LP:10,OT:10,ER:10,DR:10,SC:10,SP:10,MP:10,LG:10,SL:10,PUNT:10,FG:10,KO:10,SPIKE:0,KNEEL:10};
const fmtClock=c=>{c=Math.max(0,Math.round(c));return Math.floor(c/60)+":"+String(c%60).padStart(2,"0");};
const twoMinQ=s=>!s.ot&&(s.q===s.nq||(s.nq>=2&&s.q===s.nq/2));
function preSnap(s,tempo){ return s.running?(TEMPO[tempo]||TEMPO.normal).secs:0; }
function runClock(s,pk,tempo,stopAfter){
  const c0=s.clock; let c=c0; let warned=false;
  if(s.running){ const c1=c-preSnap(s,tempo); if(twoMinQ(s)&&!s.warned&&c>120&&c1<=120){ c=120; warned=true; } else c=c1; }
  const cBeforePlay=c; c-= (PLAYSECS[pk]!=null?PLAYSECS[pk]:10);
  if(twoMinQ(s)&&!s.warned&&!warned&&cBeforePlay>120&&c<=120){ warned=true; }
  s.clock=Math.max(0,c); s.running=!stopAfter;
  if(warned){ s.warned=true; s.running=false; addLog(s,null,"Two-minute warning. Clock stops."); }
  if(s.clock<=0) endQuarter(s);
}
function endQuarter(s){
  s.running=false; s.warned=false;
  if(s.ot){ addLog(s,null,"End of the overtime period. Still tied, another period."); s.clock=s.qmin*60; return; }
  if(s.nq>=2&&s.q===s.nq/2){ s.q++; s.clock=s.qmin*60; s.to={KC:3,PHI:3}; s.halfPending=true; addLog(s,null,"Halftime! Timeouts reset to 3."); return; }
  if(s.q>=s.nq){ s.endPending=true; addLog(s,null,"0:00. End of regulation."); return; }
  s.q++; s.clock=s.qmin*60; addLog(s,null,`End of quarter. Q${s.q} starts.`);
}
function endGame(s){ s.phase="over"; s.winner=s.score.KC>s.score.PHI?"KC":s.score.PHI>s.score.KC?"PHI":"TIE"; addLog(s,null,`Final: KC ${s.score.KC}, PHI ${s.score.PHI}`); }
function afterPlay(s){
  if(s.phase==="pat"||s.phase==="over") return;
  // Overtime (NFL playoff rules): each team gets one full possession, then sudden death.
  if(s.ot&&s.otDone){
    const ended = s.phase==="kickoff" ? s.kicker : (s.otPrev && s.poss && s.poss!==s.otPrev ? s.otPrev : null);
    if(ended) s.otDone[ended]=true;
    s.otPrev = s.phase==="kickoff" ? null : s.poss;
    if(s.otDone.KC && s.otDone.PHI && s.score.KC!==s.score.PHI){ endGame(s); return; }
  }
  if(s.endPending){ s.endPending=false;
    if(s.score.KC===s.score.PHI){ s.q=s.nq+1; s.ot=true; s.otDone={KC:false,PHI:false}; s.otPrev=null; s.clock=s.qmin*60; s.to={KC:3,PHI:3}; s.phase="kickoff"; s.kicker=Math.random()<.5?"KC":"PHI"; s.poss=null;
      addLog(s,null,`Tied! Overtime, playoff rules. ${TEAMS[other(s.kicker)].name} win the toss and receive. Both teams get the ball at least once; if it's still tied after that, next score wins.`); }
    else endGame(s);
    return; }
  if(s.halfPending){ s.halfPending=false; s.phase="kickoff"; s.kicker=s.recv1; s.poss=null; addLog(s,null,`Second half: ${TEAMS[s.recv1].name} kick off.`); }
}
function scored(s,team,pts,what){
  s.score[team]+=pts; addLog(s,team,`${TEAMS[team].name} ${what} (+${pts})`);
  return false;
}
function touchdown(s,team,txt){
  s.ball=team==="KC"?100:0; s.last.cls="td"; s.last.ev="td"; s.last.team=team; s.last.txt=txt+" TOUCHDOWN!"; addLog(s,team,s.last.txt);
  s.poss=team; scored(s,team,6,"touchdown"); s.phase="pat"; s.ball=ownToAbs(team,98);
}

// Step 1 of a scrimmage play. May leave s.follow set, which needs one more roll.
function applyScrimmage(s,pk,dk,dice){
  const team=s.poss; let res=resolveScrimmage(team,pk,dk,dice);
  s.last={team,pk,dk,dice,R:res.R,D:res.D,o:res.o,d:res.d,why:res.why,txt:"",cls:"",from:s.ball};
  const head=`${TEAMS[team].short} ${PLAYS[pk].name} vs ${DEFS[dk].short}:`;
  if(res.kind==="follow"){
    s.follow={kind:res.follow,team:res.follow==="INT"?other(team):team,pk,y:res.y,los:s.ball};
    s.last.txt=`${head} ${res.why}`; s.last.ev=res.follow==="QT"?"qt":res.follow==="B"?"brk":res.follow==="INT"?"int":"fum"; s.last.stop=true; s.last.wait=true;
    addLog(s,team,s.last.txt); return;
  }
  if(res.kind==="pen"){
    const ch=penaltyChoice(s,team,pk,res); const fouled=res.pen.side==="OFF"?other(team):team; const alt=ch.alt;
    const altTxt=alt?(alt.kind==="inc"?"incomplete":alt.kind==="y"?fmtGain(alt.y):alt.follow==="B"?"a breakaway":alt.follow==="QT"?"QB trapped":alt.follow==="INT"?"an interception":"a fumble"):"";
    if(!ch.decline){ applyPenalty(s,res.pen,head); if(alt){ s.last.txt+=` (The play itself, roll ${alt.R}, was ${altTxt}. ${TEAMS[fouled].name} take the flag.)`; s.log[s.log.length-1].txt=s.last.txt; } return; }
    const note=`Flag on the ${res.pen.side==="OFF"?"offense":"defense"} (${boxTxt(res.pen)}), but the play itself (roll ${alt.R}) was ${altTxt}, so the ${TEAMS[fouled].name} decline it.`;
    s.last.R=alt.R; s.last.o=alt.o; s.last.why=note; s.last.declined=true;
    res=alt; res.why=note;
    if(res.kind==="follow"){
      s.follow={kind:res.follow,team:res.follow==="INT"?other(team):team,pk,y:res.y,los:s.ball};
      s.last.txt=`${head} ${note}`; s.last.ev=res.follow==="QT"?"qt":res.follow==="B"?"brk":res.follow==="INT"?"int":"fum"; s.last.stop=true; s.last.wait=true;
      addLog(s,team,s.last.txt); return;
    }
    if(res.kind==="inc"){ s.last.txt=`${head} ${note} Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,team,s.last.txt); return; }
    gainYards(s,res.y,`${head} ${note} ${PLAYS[pk].cat==="pass"?"Complete, ":""}${fmtGain(res.y)}.`,alt.o&&alt.o.ob); return;
  }
  if(res.kind==="inc"){ s.last.txt=`${head} Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,team,s.last.txt); return; }
  gainYards(s,res.y,head+" "+(PLAYS[pk].cat==="pass"?"Complete, ":"")+fmtGain(res.y)+".",res.ob);
}
function turnoverOnDowns(s){
  if(s.down>4){ const def=other(s.poss); s.last.txt+=" Turnover on downs."; s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; s.last.ev=s.last.ev||"downs"; s.last.stop=true; }
}
// Move the ball y yards for the offense and handle TD / safety / downs.
function gainYards(s,y,txt,ob){
  const team=s.poss, def=other(team);
  s.ball+=dir(team)*y; s.last.y=y;
  const g=toGoal(s);
  if(g<=0){ touchdown(s,team,txt); return; }
  if(g>=100){ s.ball=ownToAbs(team,0); s.last.txt=txt+" SAFETY!"; s.last.cls="to"; s.last.ev="safety"; addLog(s,team,s.last.txt);
    if(scored(s,def,2,"safety"))return; s.phase="kickoff"; s.kicker=team; s.freeKick=true; return; }
  if(y>=s.toGo){ s.down=1; s.toGo=Math.min(10,g); txt+=" First down!"; s.last.ev=s.last.ev||"first"; }
  else { s.toGo-=y; s.down++; if(y<0&&s.last.qtSack) s.last.ev="sack"; }
  s.last.txt=txt; turnoverOnDowns(s);
  if(ob && y>0 && !s.last.cls){ s.last.txt+=" Out of bounds, clock stops."; s.last.stop=true; }
  if(s.last.cls) s.last.stop=true;
  addLog(s,team,s.last.txt);
}
function applyPenalty(s,p,head){
  const team=s.poss; const g=toGoal(s);
  let y=p.side==="OFF"?-p.yds:p.yds;
  if(y>0 && y>=g) y=Math.max(1,Math.floor(g/2));
  if(y<0 && -y>=(100-g)) y=-Math.floor((100-g)/2);
  s.ball+=dir(team)*y; s.last.ev="flag"; s.last.stop=true; s.last.y=y;
  let txt=`${head} FLAG! ${p.side==="OFF"?(p.yds===5?"False start":"Holding")+" on the offense":p.side==="PI"?"Pass interference on the defense":p.yds===5?"Offside on the defense":"Personal foul on the defense"}, ${Math.abs(y)} yards.`;
  if(p.fd||(y>0&&y>=s.toGo)){ s.down=1; s.toGo=Math.min(10,toGoal(s)); txt+=" Automatic first down."; }
  else { s.toGo-=y; txt+=" Replay the down."; }
  s.last.txt=txt; addLog(s,team,txt);
}
// Step 2: the follow-up roll (QT, breakaway, fumble recovery, interception return).
function applyFollow(s,dice){
  const f=s.follow; s.follow=null; const R=offValue(dice.t,dice.a,dice.b);
  const off=s.poss, def=other(off);
  s.last.fol={kind:f.kind,R,team:f.team,dice}; s.last.wait=false; s.last.from=f.los;
  const head=`${TEAMS[off].short} ${PLAYS[f.pk].name}:`;
  if(f.kind==="B"){ const c=CHART[off].B[R]; s.last.fol.box=c;
    if(c.k==="td"){ touchdown(s,off,`${head} Breakaway, nobody catches him!`); s.last.ev="td"; return; }
    s.last.ev="brk"; gainYards(s,c.y,`${head} Breakaway! Gain of ${c.y}.`); if(s.last.ev==="first") s.last.ev="brk"; return; }
  if(f.kind==="QT"){ const c=CHART[off].QT[R]; s.last.fol.box=c;
    if(c.k==="inc"){ s.last.txt=`${head} Quarterback trapped, throws it away. Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,off,s.last.txt); return; }
    if(c.k==="f"){ s.follow={kind:"FUM",team:off,pk:f.pk,y:c.y,los:f.los}; s.last.txt=`${head} Strip sack! Fumble at ${fmtGain(c.y).replace("gain of ","+").replace("loss of ","−")}. The offense rolls to see who recovers.`; s.last.ev="fum"; s.last.wait=true; addLog(s,off,s.last.txt); return; }
    s.last.qtSack=c.y<0; const t=c.y<0?`Quarterback trapped, SACKED for a loss of ${-c.y}.`:c.y===0?"Quarterback trapped, scrambles back to the line. No gain.":`Quarterback trapped, scrambles for ${c.y}!`;
    gainYards(s,c.y,`${head} ${t}`, c.y>0 && R%2===1); if(c.y<0&&!s.last.cls) s.last.ev="sack"; else if(c.y>=0&&s.last.ev!=="first"&&!s.last.cls) s.last.ev="scramble"; return; }
  if(f.kind==="FUM"){ const spot=f.los+dir(off)*f.y; s.last.fol.box={k:FUMKEEP(R)?"keep":"lost"};
    if(FUMKEEP(R)){ s.ball=f.los; gainYards(s,f.y,`${head} Fumble... recovered by the ${TEAMS[off].name}! ${fmtGain(f.y)[0].toUpperCase()+fmtGain(f.y).slice(1)}.`); if(!s.last.cls&&s.last.ev!=="first") s.last.ev="recover"; return; }
    s.last.cls="to"; s.last.ev="turnover"; s.last.stop=true;
    const sp=Math.max(1,Math.min(99,spot));
    if(R===39){ s.poss=def; touchdown(s,def,`${head} Fumble! Scooped up by the ${TEAMS[def].name} and returned all the way!`); return; }
    const ret=FUMSCOOP(R)?15:0; let nb=sp-dir(off)*ret; nb=Math.max(1,Math.min(99,nb));
    s.poss=def; s.ball=nb; s.down=1; s.toGo=Math.min(10,toGoal(s));
    s.last.txt=`${head} FUMBLE! ${TEAMS[def].name} recover${ret?" and return it 15":""}. ${TEAMS[def].name} ball at ${spotName(nb)}.`; addLog(s,off,s.last.txt); return; }
  if(f.kind==="INT"){ const c=CHART[def].IR[R]; s.last.fol.box=c; s.last.cls="to"; s.last.ev="int"; s.last.stop=true;
    let sp=f.los+dir(off)*f.y; if((off==="KC"&&sp>=100)||(off==="PHI"&&sp<=0)){ s.poss=def; s.ball=ownToAbs(def,20); s.down=1; s.toGo=10; s.last.txt=`${head} INTERCEPTED in the end zone. Touchback, ${TEAMS[def].name} ball at their 20.`; addLog(s,off,s.last.txt); return; }
    sp=Math.max(1,Math.min(99,sp));
    if(c.k==="td"){ s.poss=def; touchdown(s,def,`${head} INTERCEPTED and returned for a pick six!`); return; }
    let nb=sp-dir(off)*c.y;
    if((def==="KC"&&nb>=100)||(def==="PHI"&&nb<=0)){ s.poss=def; touchdown(s,def,`${head} INTERCEPTED and returned for a pick six!`); return; }
    nb=Math.max(1,Math.min(99,nb)); s.poss=def; s.ball=nb; s.down=1; s.toGo=Math.min(10,toGoal(s));
    s.last.txt=`${head} INTERCEPTED! Returned ${c.y} yards. ${TEAMS[def].name} ball at ${spotName(nb)}.`; addLog(s,off,s.last.txt); return; }
}

// ---------- Kicks ----------
function applyPunt(s,dice){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b); const c=CHART[team].PU[R];
  let txt; s.last={team,pk:"PUNT",dice,R,txt:"",cls:"",from:s.ball,o:c,ev:"punt"};
  if(c.k==="blk"){ s.ball-=dir(team)*5; s.ball=Math.max(1,Math.min(99,s.ball)); txt=`${TEAMS[team].short} punt BLOCKED! ${TEAMS[def].name} ball at ${spotName(s.ball)}.`; s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; s.last.ev="block"; }
  else{
    const net=c.k==="ret"?10:c.y;
    let land=s.ball+dir(team)*net; let tb=false;
    if((team==="KC"&&land>=100)||(team==="PHI"&&land<=0)){ tb=true; land=ownToAbs(def,20); }
    s.poss=def; s.ball=land; s.down=1; s.toGo=Math.min(10,toGoal(s));
    txt=`${TEAMS[team].short} punts${c.k==="ret"?", huge return!":""} ${tb?"Touchback.":`Net ${net}.`} ${TEAMS[def].name} ball at ${spotName(land)}.`;
  }
  s.last.txt=txt; addLog(s,team,txt);
}
// Share of offense boxes that stop the clock (incomplete, out of bounds, flag, turnover; about half of QTs).
function clockStopPct(team,pk){ let n=0; ROLLS.forEach(R=>{ const c=CHART[team][pk][R]; let s=0;
  if(c.k==="inc"||c.k==="pen"||c.k==="int"||c.k==="f") s=1; else if(c.k==="qt") s=.45; else if(c.k==="y"&&c.ob) s=1; n+=s*OFFP[R]; }); return Math.round(n/216*100); }
function fgNeed(dist,team){ let best=99; ROLLS.forEach(R=>{ const c=CHART[team||"KC"].FG[R]; if(c.k==="y"&&c.y>=dist&&R<best) best=R; }); return best; }
function fgChance(dist,team){ let n=0; ROLLS.forEach(R=>{ const c=CHART[team].FG[R]; if(c.k==="y"&&c.y>=dist) n+=OFFP[R]; }); return Math.round(n/216*100); }
function applyFG(s,dice){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b);
  const dist=toGoal(s)+17; const c=CHART[team].FG[R];
  s.last={team,pk:"FG",dice,R,txt:"",cls:"",o:c,from:s.ball};
  if(c.k==="y"&&c.y>=dist){
    const txt=`${TEAMS[team].short} ${dist}-yard field goal is GOOD! (box says good to ${c.y})`;
    s.last.txt=txt; s.last.cls="td"; s.last.ev="fg"; addLog(s,team,txt);
    if(scored(s,team,3,"field goal"))return;
    s.phase="kickoff"; s.kicker=team; return;
  }
  const nb=s.ball-dir(team)*7;
  const defOwnAtKick = def==="KC"?nb:100-nb; const ownSpot=Math.max(20,defOwnAtKick);
  s.poss=def; s.ball=ownToAbs(def,ownSpot); s.down=1; s.toGo=10;
  const txt=`${TEAMS[team].short} ${dist}-yard field goal is ${c.k==="blk"?"BLOCKED":"NO GOOD (box says "+c.y+")"}. ${TEAMS[def].name} ball at ${spotName(s.ball)}.`;
  s.last.txt=txt; s.last.cls="to"; s.last.ev="fgmiss"; addLog(s,team,txt);
}
const ONSIDE_OK=R=>R>=36;   // kicking team recovers on 36-39 (about 1 in 7)
function applyKickoff(s,dice,onside){
  const kick=s.kicker, recv=other(kick); const R=offValue(dice.t,dice.a,dice.b); const c=CHART[recv].KR[R];
  let own,txt; s.last={team:kick,pk:"KO",dice,R,txt:"",cls:"",o:c,ev:"kick",from:ownToAbs(kick,35)};
  if(onside){ s.freeKick=false; s.last.o={k:ONSIDE_OK(R)?"keep":"lost"};
    if(ONSIDE_OK(R)){ txt=`ONSIDE KICK RECOVERED by the ${TEAMS[kick].name}! (rolled ${R}; 36-39 recovers) Ball at their 45.`; startPossession(s,kick,45); s.last.ev="recover"; s.last.cls="td"; }
    else { txt=`Onside kick, ${TEAMS[recv].name} recover (rolled ${R}; needed 36-39). Ball at the ${TEAMS[kick].short} 45.`; startPossession(s,recv,55); s.last.ev="turnover"; }
    s.phase="play"; s.last.txt=txt; addLog(s,kick,txt); return; }
  if(s.freeKick){ own=Math.min(45,20+Math.max(0,R-10)); s.freeKick=false; txt=`Free kick after the safety. ${TEAMS[recv].name} start at their ${own}.`; }
  else if(c.k==="td"){ s.poss=recv; s.last.txt=""; touchdown(s,recv,`Kickoff RETURNED by the ${TEAMS[recv].name}!`); return; }
  else if(c.k==="tb"){ own=25; txt=`Touchback. ${TEAMS[recv].name} start at their 25.`; }
  else { own=c.y; txt=`${own>=36?"Big return! ":""}${TEAMS[recv].name} start at their ${own}.`; }
  startPossession(s,recv,own); s.phase="play"; s.last.txt=txt; addLog(s,recv,txt);
}
function applyPAT(s,kind,dice,pk,dk){
  const team=s.poss; const R=offValue(dice.t,dice.a,dice.b);
  s.last={team,pk:kind,dice,R,txt:"",cls:""};
  if(kind==="XP"){
    if(CHART[team].XP[R].k==="ng"){ s.last.txt=`${TEAMS[team].short} extra point is NO GOOD! (rolled ${R}, red box)`; s.last.cls="to"; s.last.ev="fgmiss"; }
    else { s.score[team]+=1; s.last.txt=`${TEAMS[team].short} extra point is good.`; s.last.ev="xp"; }
  } else {
    const res=resolveScrimmage(team,pk,dk,dice); s.last.o=res.o; s.last.d=res.d; s.last.D=res.D; s.last.pk=pk; s.last.dk=dk; s.last.why=res.why;
    const ok=(res.kind==="y"&&res.y>=2)||(res.kind==="pen"&&res.pen.side!=="OFF")||(res.kind==="follow"&&res.follow==="B");
    if(ok){ s.score[team]+=2; s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].short}): GOOD!`; s.last.cls="td"; s.last.ev="two"; }
    else { s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].short}): no good.`; s.last.cls="to"; s.last.ev="fgmiss"; }
  }
  addLog(s,team,s.last.txt);
  s.phase="kickoff"; s.kicker=team;
}
// ---------- Players, turns, actions (host is the single source of truth) ----------
function teamList(s,team){ return s.players.filter(p=>p.team===team); }
function pickRot(s,team,key){ const L=teamList(s,team); if(!L.length) return null; return L[((s[key][team]||0)%L.length+L.length)%L.length]; }
function callerOf(s,team){ return pickRot(s,team,"ci"); }
function rollerOf(s,team){ const L=teamList(s,team); if(!L.length) return null; return L[(((s.ci[team]||0)+(L.length>1?1:0)+(s.ro[team]||0))%L.length+L.length)%L.length]; }
const ST=k=>k==="PUNT"||k==="FG"||k==="SPIKE"||k==="KNEEL";
const NOROLL=k=>k==="SPIKE"||k==="KNEEL";
// What is the game waiting on? [{team, kind:'call'|'roll'|'pat'|'toss'|'start', side:'off'|'def'}]
function needs(s){
  const P=s.pend||{}; const out=[];
  if(s.phase==="lobby") return [{kind:"start"}];
  if(s.phase==="toss") return [{kind:"toss"}];
  if(s.phase==="over") return [];
  if(s.phase==="kickoff"){ if(!P.od) out.push({team:s.kicker,kind:"roll",side:"off"}); return out; }
  if(s.follow) return [{team:s.follow.team,kind:"roll",side:"fol",fol:s.follow.kind}];
  const off=s.poss, def=other(s.poss);
  if(s.phase==="pat"&&!P.pat) return [{team:off,kind:"pat",side:"off"}];
  if(s.phase==="pat"&&P.pat==="XP"){ if(!P.od) out.push({team:off,kind:"roll",side:"off"}); return out; }
  // play or 2pt
  const callsNeeded=[];
  if(!P.oc) callsNeeded.push({team:off,kind:"call",side:"off"});
  if(!(P.oc&&ST(P.oc)) && !P.dc) callsNeeded.push({team:def,kind:"call",side:"def"});
  if(callsNeeded.length) return callsNeeded;
  if(NOROLL(P.oc)) return out;
  if(!P.od) out.push({team:off,kind:"roll",side:"off"});
  if(!ST(P.oc) && !P.dd) out.push({team:def,kind:"roll",side:"def"});
  return out;
}
function whoFor(s,n){ return n.kind==="roll"?rollerOf(s,n.team):(n.kind==="call"||n.kind==="pat")?callerOf(s,n.team):null; }
function canAct(s,pid,n){
  if(pid===s.admin) return true;
  const w=whoFor(s,n); return !!(w&&w.id===pid);
}
function validDice(d,keys){ return d&&keys.every(k=>Number.isInteger(d[k])&&d[k]>=1&&d[k]<=6); }
function snapshotPrev(s){ const c=JSON.parse(JSON.stringify(s)); delete c.prev; s.prev=JSON.stringify(c); }

// Returns true if state changed
function handleAction(s,a,pid){
  if(!a||typeof a!=="object") return false;
  const isAdmin=pid===s.admin;
  const adminOnly=["admin","kick","move","up","settings","start","toss","newgame","undo","skip","pause"];
  if(s.paused && !(isAdmin&&adminOnly.includes(a.type)) && a.type!=="join" && a.type!=="leave") return false;
  switch(a.type){
    case "join":{
      const name=String(a.name||"").trim().slice(0,18)||"Player"; const team=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!team) return false;
      const ex=s.players.find(p=>p.id===pid);
      if(ex){ if(ex.team!==team){ s.players=s.players.filter(p=>p.id!==pid); s.players.push({id:pid,name,team}); } else ex.name=name; }
      else s.players.push({id:pid,name,team});
      if(s.autoAdmin && name.toLowerCase()===s.autoAdmin && s.admin===s.host) s.admin=pid;
      return true; }
    case "leave": s.players=s.players.filter(p=>p.id!==pid); return true;
    case "admin": if(!isAdmin) return false; { const p=s.players.find(x=>x.id===a.pid); if(!p) return false; s.admin=p.id; addLog(s,null,`${p.name} is now the admin.`); return true; }
    case "kick": if(!isAdmin) return false; s.players=s.players.filter(p=>p.id!==a.pid); return true;
    case "move": if(!isAdmin) return false; { const p=s.players.find(x=>x.id===a.pid); if(!p) return false; s.players=s.players.filter(x=>x.id!==a.pid); p.team=other(p.team); s.players.push(p); return true; }
    case "up": if(!isAdmin) return false; { const i=s.players.findIndex(x=>x.id===a.pid); if(i<0) return false; const t=s.players[i].team; let j=i-1; while(j>=0&&s.players[j].team!==t) j--; if(j<0) return false; const tmp=s.players[j]; s.players[j]=s.players[i]; s.players[i]=tmp; return true; }
    case "settings": if(!isAdmin) return false; { const m=+a.qmin, n=+a.nq; if(QMINS.includes(m)){ s.qmin=m; if(s.phase==="lobby"||s.phase==="toss") s.clock=m*60; } if(NQS.includes(n)&&(s.phase==="lobby"||s.phase==="toss"||n>=s.q)) s.nq=n; return true; }
    case "pause": if(!isAdmin) return false; s.paused=!!a.on; addLog(s,null,s.paused?"Game paused by the admin.":"Game resumed."); return true;
    case "timeout":{ const t=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!t) return false; const me=s.players.find(p=>p.id===pid); if(!(isAdmin||(me&&me.team===t))) return false;
      if(s.phase!=="play"||s.follow||s.pend.od||s.pend.dd||!(s.to[t]>0)) return false; s.to[t]--; s.running=false; addLog(s,t,`Timeout ${TEAMS[t].name} (${s.to[t]} left). Clock stopped at ${fmtClock(s.clock)}.`); s.last={txt:`Timeout, ${TEAMS[t].name}. Clock stopped at ${fmtClock(s.clock)}.`,cls:"",team:t}; return true; }
    case "start": if(!isAdmin||s.phase!=="lobby") return false; s.phase="toss"; s.clock=s.qmin*60; return true;
    case "toss": if(!isAdmin||s.phase!=="toss") return false; { snapshotPrev(s); const recv=Math.random()<.5?"KC":"PHI"; s.recv1=recv; s.kicker=other(recv); s.phase="kickoff"; s.pend={}; addLog(s,recv,`${TEAMS[recv].name} win the toss and receive.`); s.last={txt:`${TEAMS[recv].name} win the toss and will receive. ${TEAMS[s.kicker].name} kick off.`,cls:""}; return true; }
    case "newgame": if(!isAdmin) return false; { const keep=s.players, adm=s.admin, code=s.code; const n=newGame(s.qmin,s.nq); Object.assign(s,n,{players:keep,admin:adm,code,rev:s.rev,started:Date.now(),ci:{KC:0,PHI:0},ro:{KC:0,PHI:0},pend:{}}); delete s.prev; return true; }
    case "undo": if(!isAdmin||!s.prev) return false; { const p=JSON.parse(s.prev); const keep=s.players; const rev=s.rev; Object.keys(s).forEach(k=>delete s[k]); Object.assign(s,p,{players:keep,rev}); s.last={txt:"Admin undid the last play.",cls:""}; return true; }
    case "skip": if(!isAdmin) return false; { const t=a.team==="PHI"?"PHI":"KC"; if(a.which==="roll") s.ro[t]=(s.ro[t]||0)+1; else s.ci[t]=(s.ci[t]||0)+1; return true; }
    case "pat":{ const n=needs(s).find(x=>x.kind==="pat"); if(!n||!canAct(s,pid,n)) return false; if(a.k!=="XP"&&a.k!=="2PT") return false; s.pend.pat=a.k; s.pend.patBy=n.team; if(a.k==="2PT") s.ball=ownToAbs(s.poss,98); return true; }
    case "call":{
      const ns=needs(s); const n=ns.find(x=>x.kind==="call"&&x.side===a.side); if(!n||!canAct(s,pid,n)) return false;
      if(a.side==="off"){ if(!(PLAYS[a.play]||(s.phase==="play"&&ST(a.play)))) return false; if(a.play==="FG"&&toGoal(s)+17>60) return false;
        s.pend.oc=a.play; s.pend.tempo=TEMPO[a.tempo]?a.tempo:"normal";
        if(s.phase==="play" && s.running && s.clock-preSnap(s,s.pend.tempo)<=0){ // clock expires before the snap
          snapshotPrev(s); const team=s.poss; s.clock=0; s.pend={}; s.last={txt:`${TEAMS[team].name} let the clock run out. 0:00.`,cls:"",team}; addLog(s,team,s.last.txt); endQuarter(s); afterPlay(s); s.seq=(s.seq||0)+1; return true; }
        if(NOROLL(a.play)){ resolvePending(s); return true; }
      }
      else { if(!DEFS[a.play]) return false; s.pend.dc=a.play; }
      return true; }
    case "uncall":{ // change your mind before dice
      const P=s.pend; if(P.od||P.dd) return false;
      const team=a.side==="off"?s.poss:other(s.poss); const w=callerOf(s,team); if(!(isAdmin||(w&&w.id===pid))) return false;
      if(a.side==="off") delete P.oc; else delete P.dc; return true; }
    case "roll":{
      const ns=needs(s); const n=ns.find(x=>x.kind==="roll"&&x.side===a.side); if(!n||!canAct(s,pid,n)) return false;
      if(a.side==="fol"){ const d=a.dice&&validDice(a.dice,["t","a","b"])?{t:a.dice.t,a:a.dice.a,b:a.dice.b}:{t:d6(),a:d6(),b:d6()}; resolveFollow(s,d); return true; }
      if(a.side==="off"){ const d=a.dice&&validDice(a.dice,["t","a","b"])?{t:a.dice.t,a:a.dice.a,b:a.dice.b}:{t:d6(),a:d6(),b:d6()}; s.pend.od=d; if(s.phase==="kickoff") s.pend.onside=!!a.onside; }
      else { const d=a.dice&&validDice(a.dice,["d1","d2"])?{d1:a.dice.d1,d2:a.dice.d2}:{d1:d6(),d2:d6()}; s.pend.dd=d; }
      if(needs(s).length===0) resolvePending(s);
      return true; }
  }
  return false;
}
function applySpecial(s,k){
  const team=s.poss; s.last={team,pk:k,txt:"",cls:""};
  if(k==="SPIKE"){ s.down++; s.last.txt=`${TEAMS[team].short} spikes it. Clock stopped, down used.`; }
  else { s.ball-=dir(team)*1; s.toGo+=1; s.down++; s.last.txt=`${TEAMS[team].short} takes a knee. Clock keeps running.`; }
  if(s.down>4){ s.last.txt+=" Turnover on downs."; s.poss=other(team); s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.stop=true; }
  addLog(s,team,s.last.txt);
}
const QMINS=[5,8,10,12,15]; const NQS=[2,4];
function resolvePending(s){
  const P=s.pend; snapshotPrev(s);
  const dice=Object.assign({d1:1,d2:1},P.od||{},P.dd||{});
  const used={call:[],roll:[]};
  const tempo=P.tempo||"normal";
  if(s.phase==="kickoff"){ s.running=false; applyKickoff(s,dice,P.onside); const tb=/Touchback|TOUCHDOWN|nside/.test(s.last.txt); runClock(s,"KO",tempo,tb); }
  else if(s.phase==="pat"){
    const off=s.poss;
    if(P.pat==="XP"){ applyPAT(s,"XP",dice); used.call.push(off); used.roll.push(off); }
    else { applyPAT(s,"2PT",dice,P.oc,P.dc); used.call.push(off,other(off)); used.roll.push(off,other(off)); s.last.dice=dice; s.last.D=dice.d1+dice.d2; }
  } else {
    const off=s.poss, def=other(off);
    if(P.oc==="PUNT"){ applyPunt(s,dice); used.call.push(off); runClock(s,"PUNT",tempo,true); }
    else if(P.oc==="FG"){ applyFG(s,dice); used.call.push(off); runClock(s,"FG",tempo,true); }
    else if(P.oc==="SPIKE"||P.oc==="KNEEL"){ applySpecial(s,P.oc); used.call.push(off); runClock(s,P.oc,tempo,P.oc==="SPIKE"); }
    else { applyScrimmage(s,P.oc,P.dc,dice); used.call.push(off,def); if(s.last.pk&&PLAYS[s.last.pk]) s.last.tempo=tempo;
      if(s.follow){ s.follow.tempo=tempo; s.follow.used=used.call.slice(); s.pend={}; s.seq=(s.seq||0)+1; return; }
      runClock(s,P.oc,tempo,!!s.last.stop||s.phase!=="play"); }
  }
  // advance rotations: callers and rollers of the teams that acted
  const kickT = s.last && s.last.pk==="KO" ? s.last.team : null;
  if(kickT){ s.ro[kickT]=(s.ro[kickT]||0)+1; }
  new Set(used.call.filter(Boolean)).forEach(t=>s.ci[t]=(s.ci[t]||0)+1);

  s.pend={};
  afterPlay(s);
  s.seq=(s.seq||0)+1;
}

// The follow-up roll (QT, breakaway, fumble, interception return) finishes the play.
function resolveFollow(s,dice){
  snapshotPrev(s); const f=s.follow; const tempo=f.tempo||"normal"; const used=f.used||[]; const pk=f.pk;
  applyFollow(s,dice);
  if(s.follow){ s.follow.tempo=tempo; s.follow.used=used; s.seq=(s.seq||0)+1; return; }
  runClock(s,pk,tempo,!!s.last.stop||s.phase!=="play");
  new Set(used.filter(Boolean)).forEach(t=>s.ci[t]=(s.ci[t]||0)+1);
  s.pend={}; afterPlay(s); s.seq=(s.seq||0)+1;
}

// ---------- Transport ----------
// Modes: "peer" (GitHub Pages: admin phone hosts over PeerJS), "db" (claude.ai page: shared store), "local" (one device)
const LKEY="turkeybowl57.v2";
const IDKEY="turkeybowl57.pid";
let myId=null; try{ myId=localStorage.getItem(IDKEY); }catch(e){}
if(!myId){ myId="p"+Math.random().toString(36).slice(2,10); try{localStorage.setItem(IDKEY,myId);}catch(e){} }
let S=null;          // current state as this device knows it
let mode="none";     // none | host | client | local
let net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null};
let ui={view:null,sel:null,manual:false,md:{},confirm:null,tv:false,err:""};
const hasClaude=()=>!!(window.claude&&typeof window.claude.use==="function");
function saveHost(){ try{ localStorage.setItem(LKEY,JSON.stringify(S)); }catch(e){} }
function loadHost(){ try{ const j=localStorage.getItem(LKEY); return j?JSON.parse(j):null; }catch(e){ return null; } }
function freshState(code){ const s=newGame(15,4); s.code=code; s.admin=myId; s.players=[]; s.ci={KC:0,PHI:0}; s.ro={KC:0,PHI:0}; s.pend={}; s.seq=0; s.started=Date.now(); return s; }
function genCode(){ const A="BCDFGHJKLMNPQRSTVWXZ"; let c=""; for(let i=0;i<4;i++) c+=A[Math.floor(Math.random()*A.length)]; return c; }

// Public view of state sent to clients: hide the other side's call
function publicState(){ return S; }

function act(a){ // any device -> host
  ui.err="";
  if(mode==="host"||mode==="local"){ const before=S.seq; if(handleAction(S,a,myId)){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); } render(); return; }
  if(mode==="client"){
    if(net.via==="peer"&&net.hostConn&&net.hostConn.open){ net.hostConn.send({type:"act",a,pid:myId}); }
    else if(net.via==="db"&&net.db){ const ref=net.db.doc("actions/"+myId); net.actSeq=(net.actSeq||0)+1; ref.set({a:JSON.stringify(a),n:net.actSeq,t:Date.now()}).catch(()=>{ui.err="Couldn't send. Check your connection.";render();}); }
    else { ui.err="Not connected to the game yet."; render(); }
  }
}
let lastBroadcast=0;
function broadcast(){
  if(net.via==="peer"){ const msg={type:"state",s:S}; net.conns=net.conns.filter(c=>c.open||c._pending); net.conns.forEach(c=>{ try{ if(c.open) c.send(msg); }catch(e){} }); }
  if(net.via==="db"&&net.db){ const body={s:JSON.stringify(S)}; const doWrite=()=>{ net.writing=true; net.db.doc("game/state").set(body).catch(()=>{}).finally(()=>{ net.writing=false; if(net.queued){ const q=net.queued; net.queued=null; body.s=q; doWrite(); } }); }; if(net.writing){ net.queued=body.s; } else doWrite(); }
}
function maybeCelebrate(beforeSeq){ if(S&&S.seq!==beforeSeq&&S.last) celebrate(S.last); }

// --- PeerJS
const PFX="turkeybowl57-";
const peerOpts=()=>Object.assign({debug:0},window.TB_PEER||{});
const PeerCls=()=>window.TB_RELAY&&window.RelayPeer?window.RelayPeer:window.Peer;
function hostPeer(code,resume){
  if(!PeerCls()){ net.status="Live sync library didn't load. Playing on this device only."; mode="local"; render(); return; }
  net.via="peer"; mode="host"; net.code=code;
  if(!resume||!S||S.code!==code){ S=freshState(code); }
  S.host=myId; saveHost(); location.hash=code;
  net.status="Opening your game…"; render();
  const peer=new (PeerCls())(PFX+code,peerOpts()); net.peer=peer;
  peer.on("open",()=>{ net.status="Live. Share the link or code."; net.live=true; render(); });
  peer.on("connection",conn=>{
    conn._pending=true; net.conns.push(conn);
    conn.on("open",()=>{ conn._pending=false; conn.send({type:"state",s:S}); render(); });
    conn.on("data",m=>{ if(!m||m.type!=="act") return; const pid=String(m.pid||"").slice(0,20); const before=S.seq; if(handleAction(S,m.a,pid)){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); render(); } else { try{conn.send({type:"nope"});}catch(e){} } });
    conn.on("close",()=>{ net.conns=net.conns.filter(c=>c!==conn); render(); });
  });
  peer.on("disconnected",()=>{ net.status="Reconnecting to the sync server…"; render(); setTimeout(()=>{ try{peer.reconnect();}catch(e){} },1500); });
  peer.on("error",err=>{
    if(err&&err.type==="unavailable-id"){ net.status="That game code is still releasing. Retrying in 5 seconds…"; render(); try{peer.destroy();}catch(e){} setTimeout(()=>hostPeer(code,true),5000); return; }
    if(err&&(err.type==="network"||err.type==="server-error"||err.type==="socket-error")){ net.status="Can't reach the sync server. The game still works on this screen."; net.live=false; render(); return; }
  });
}
function joinPeer(code){
  if(!PeerCls()){ ui.err="Live sync library didn't load on this phone. Try reloading."; render(); return; }
  net.via="peer"; mode="client"; net.code=code; location.hash=code;
  net.status="Connecting to game "+code+"…"; render();
  const peer=net.peer||new (PeerCls())(undefined,peerOpts()); net.peer=peer;
  const go=()=>{
    const conn=peer.connect(PFX+code,{reliable:true}); net.hostConn=conn;
    const t=setTimeout(()=>{ if(!conn.open){ net.status="Still trying to reach the admin's phone. Make sure it has the game open."; render(); } },8000);
    conn.on("open",()=>{ clearTimeout(t); net.status="Connected"; net.live=true; render(); });
    conn.on("data",m=>{ if(m&&m.type==="state"){ const before=S&&S.seq; S=m.s; saveBackup(); net.lostAt=0; if(before!==undefined&&before!==S.seq&&S.last) celebrate(S.last); render(); } if(m&&m.type==="nope"){ ui.err="It's not your turn for that."; render(); } });
    conn.on("close",()=>{ net.live=false; net.lostAt=net.lostAt||Date.now(); net.status="Lost the admin's phone. Reconnecting…"; render(); setTimeout(go,2500); });
    conn.on("error",()=>{});
  };
  if(peer.open) go(); else peer.on("open",go);
  peer.on("error",err=>{ if(err&&err.type==="peer-unavailable"){ net.status=`No game ${code} is open right now. Check the code, or ask the admin to open the game.`; net.live=false; render(); setTimeout(go,4000); } else if(err&&(err.type==="network"||err.type==="server-error")){ net.status="Can't reach the sync server. Check your Wi-Fi."; render(); } });
}

// --- claude.ai db
async function initDb(){
  let db=null, user=null;
  try{ [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]); }catch(e){}
  if(!db){ net.dbMissing=true; render(); return; }
  net.db=db; net.via="db";
  let owner=false; try{ owner=user?!!(await user.isOwner()):false; }catch(e){}
  net.owner=owner;
  if(owner){
    mode="host"; S=loadHost()||freshState("HOME"); S.admin=myId;
    const snap0=await db.doc("game/state").get().catch(()=>null);
    if(snap0&&snap0.exists){ try{ const r=JSON.parse(snap0.data().s); if(r&&r.v===2&&(r.rev||0)>(S.rev||0)) { S=r; S.admin=myId; } }catch(e){} }
    saveHost(); broadcast(); net.live=true;
    const seen={};
    db.collection("actions").onSnapshot(q=>{ let changed=false; const before=S.seq;
      q.docs.forEach(d=>{ const b=d.data(); if(!b) return; const k=d.id; if(seen[k]===undefined){ seen[k]=b.n; if(Date.now()-(b.t||0)>15000) return; } else if(b.n<=seen[k]) return; seen[k]=b.n; try{ if(handleAction(S,JSON.parse(b.a),k)) changed=true; }catch(e){} });
      if(changed){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); render(); } },()=>{ net.status="Live sync stopped."; render(); });
  } else {
    mode="client"; net.status="Connecting…";
    const timer=setTimeout(()=>{ if(!S){ net.status="Waiting for the admin to open the game."; render(); } },10000);
    db.doc("game/state").onSnapshot(snap=>{ clearTimeout(timer); if(snap.exists){ try{ const before=S&&S.seq; S=JSON.parse(snap.data().s); net.live=true; net.status="Connected"; if(before!==undefined&&before!==S.seq&&S.last) celebrate(S.last);}catch(e){} } render(); },()=>{ net.status="Live sync stopped."; render(); });
  }
  render();
}
// ---------- Field animations + confetti ----------
const FXTXT={td:["TOUCHDOWN!","td"],fg:["IT'S GOOD!","td"],fgmiss:["NO GOOD","to"],xp:["EXTRA POINT GOOD","first"],two:["TWO-POINT GOOD!","td"],
  sack:["SACK!","to"],qt:["QB TRAPPED!","to"],brk:["BREAKAWAY!","td"],int:["INTERCEPTED!","to"],fum:["FUMBLE!","to"],turnover:["TURNOVER!","to"],
  recover:["RECOVERED!","first"],flag:["FLAG!","flag"],first:["FIRST DOWN","first"],inc:["INCOMPLETE","dim"],punt:["PUNT","dim"],kick:["KICKOFF","dim"],
  block:["BLOCKED!","to"],safety:["SAFETY!","to"],scramble:["SCRAMBLE!","first"],downs:["TURNOVER ON DOWNS","to"]};
const FX_X=a=>8.333+Math.max(-2,Math.min(102,a))*0.83333;
function celebrate(last){ if(!last) return; setTimeout(()=>{ try{ playAnim(last); }catch(e){} },40); if(last.cls==="td") confetti(last); }
function playAnim(l){
  const fieldEl=document.querySelector(".field"); if(!fieldEl||!S) return;
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const old=document.getElementById("fx"); if(old) old.remove();
  const ev=l.ev||(l.cls==="td"?"td":l.cls==="to"?"turnover":null);
  const fx=document.createElement("div"); fx.id="fx"; fx.className="fx"+(S.ui_tv?" tv":"");
  let from=l.from!=null?l.from:S.ball, to=S.ball;
  if(S.phase==="pat"&&(ev==="td")) to=l.team==="KC"?100:0;
  if(l.wait) to=from;
  const pk=l.pk; const air=(PLAYS[pk]&&PLAYS[pk].cat==="pass"&&ev!=="sack"&&ev!=="qt"&&ev!=="scramble")||pk==="PUNT"||pk==="KO"||pk==="FG";
  if(pk==="FG"){ to=l.team==="KC"?104:-4; }
  let h="";
  if(!reduce && from!=null && to!=null && (from!==to||pk==="FG")) h+=`<div class="fxball ${air?"arc":""}" style="--x0:${FX_X(from)}%;--x1:${FX_X(to)}%"></div>`;
  if(ev==="fg"||ev==="fgmiss"||pk==="FG"){ const g=l.team==="KC"?100:0; h+=`<div class="fxpost ${ev==="fg"?"good":"miss"}" style="left:${FX_X(g)}%"></div>`; }
  if(ev==="td"){ const side=(S.score&&l.team==="KC")?"r":"l"; h+=`<div class="fxez ${side}"></div>`; }
  if(ev==="flag") h+=`<div class="fxflag">🚩</div>`;
  if(ev==="first"&&S.poss&&S.phase==="play"){ const fd=S.ball+dir(S.poss)*Math.min(S.toGo,toGoal(S)); h+=`<div class="fxline" style="left:${FX_X(fd)}%"></div>`; }
  const t=ev&&FXTXT[ev]; if(t) h+=`<div class="fxtxt ${t[1]}">${t[0]}</div>`;
  if(!h) return;
  fx.innerHTML=h; document.body.appendChild(fx);
  if(!reduce&&(ev==="sack"||ev==="qt"||ev==="fum"||ev==="block")){ fx.classList.add("shake"); }
  const t0=performance.now();
  (function pos(){ const f=document.querySelector(".field"); if(!f||!fx.isConnected){ fx.remove(); return; }
    const r=f.getBoundingClientRect(); Object.assign(fx.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
    if(performance.now()-t0<3000) requestAnimationFrame(pos); else fx.remove(); })();
}
function confetti(last){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=document.getElementById("confetti"); if(!cv) return; cv.hidden=false; const ctx=cv.getContext("2d");
  cv.width=innerWidth; cv.height=innerHeight;
  const cols=last.team==="PHI"?["#00a3ad","#c4ced3","#004c54","#fff"]:["#e31837","#ffb81c","#fff"];
  const ps=Array.from({length:140},()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6.28,c:cols[Math.floor(Math.random()*cols.length)]}));
  let f=0; (function step(){ ctx.clearRect(0,0,cv.width,cv.height); ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-4,-2,8,4);ctx.restore();}); if(++f<130)requestAnimationFrame(step); else {ctx.clearRect(0,0,cv.width,cv.height); cv.hidden=true;} })();
}

// ---------- Rendering helpers ----------
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const app=document.getElementById("app");
const ord=n=>["","1st","2nd","3rd","4th"][n]||n+"th";
const qName=s=>s.ot?"OT":`Q${s.q}`;
const me=()=>S&&S.players.find(p=>p.id===myId);
const isAdmin=()=>S&&S.admin===myId;
const playName=k=>PLAYS[k]?PLAYS[k].name:DEFS[k]?DEFS[k].name:({PUNT:"Punt",FG:"Field Goal",SPIKE:"Spike",KNEEL:"Kneel",XP:"Extra point","2PT":"Two-point try"})[k]||k;

function scoreboard(big){
  const s=S; const p=s.poss;
  const ddTxt = s.phase==="play" ? `${ord(s.down)} & ${toGoal(s)<=s.toGo?"Goal":s.toGo}` : s.phase==="pat" ? "Try after TD" : s.phase==="kickoff" ? `Kickoff · ${TEAMS[s.kicker].short} kicks` : s.phase==="over" ? "Final" : s.phase==="toss"?"Coin toss":"Pregame";
  const tos=t=>`<span class="tos" aria-label="${s.to[t]} timeouts">${[0,1,2].map(i=>`<i class="${i<s.to[t]?"on":""}"></i>`).join("")}</span>`;
  return `<div class="board ${big?"big":""}">
    <div class="team kc"><div><div class="nm">${p==="KC"&&s.phase!=="over"?'<span class="ball" title="Has the ball"></span> ':""}CHIEFS</div>${tos("KC")}</div><div class="sc" style="margin-left:auto">${s.score.KC}</div></div>
    <div class="mid"><div class="clk ${s.running?"run":""}">${fmtClock(s.clock)}</div><div class="q">${s.phase==="over"?"FINAL":qName(s)}${s.paused?" · PAUSED":""}</div></div>
    <div class="team phi"><div class="sc" style="margin-right:auto">${s.score.PHI}</div><div><div class="nm">EAGLES${p==="PHI"&&s.phase!=="over"?' <span class="ball" title="Has the ball"></span>':""}</div>${tos("PHI")}</div></div>
  </div>
  <div class="dd"><span class="chip"><b>${ddTxt}</b></span>${s.poss&&(s.phase==="play"||s.phase==="pat")?`<span class="chip">Ball on <b>${spotName(s.ball)}</b></span>`:""}<span class="chip ${s.running?"live":""}">${s.running?"Clock running":"Clock stopped"}</span></div>`;
}
function field(big){
  const s=S; const X=a=>8.333+a*0.83333;
  let lines=""; for(let y=5;y<=95;y+=5){ const major=y%10===0; lines+=`<div class="yl ${major?"":"minor"}" style="left:${X(y)}%"></div>`; if(major){ const lab=y<=50?y:100-y; lines+=`<div class="yn top" style="left:${X(y)}%">${lab}</div><div class="yn" style="left:${X(y)}%">${lab}</div>`; } }
  lines+=`<div class="yl goal" style="left:${X(0)}%"></div><div class="yl goal" style="left:${X(100)}%"></div><div class="hash h1"></div><div class="hash h2"></div><div class="logo">LVII</div>`;
  let marks="";
  if(s.poss && (s.phase==="play"||s.phase==="pat")){
    const fd = s.ball + dir(s.poss)*Math.min(s.toGo,toGoal(s));
    marks+=`<div class="los" style="left:${X(s.ball)}%"></div>`;
    if(s.phase==="play") marks+=`<div class="fdl" style="left:${X(fd)}%"></div>`;
    marks+=`<div class="fb" style="left:${X(s.ball)}%"></div>`;
    marks+=`<div class="dirarrow" style="left:${X(s.ball)}%">${s.poss==="KC"?"KC ▶":"◀ PHI"}</div>`;
  }
  return `<div class="fieldbox"><div class="field ${big?"big":""}" role="img" aria-label="Football field. ${s.poss?TEAMS[s.poss].name+" ball on "+spotName(s.ball):""}">
    <div class="ez l"><span>CHIEFS</span></div><div class="ez r"><span>EAGLES</span></div>${lines}${marks}</div></div>`;
}
// Dice as the five colored Paydirt dice (value shown is what the die reads as).
function diceHTML(d,showDef){
  if(!d||!d.t) return "";
  const o=`<div class="die blk roll" title="Black die (tens)">${BLACK[d.t-1]*10}</div><div class="die wht roll" title="White die">${WHITE[d.a-1]}</div><div class="die blu roll" title="Blue die">${BLUE[d.b-1]}</div>`;
  const df=showDef&&d.d1?`<span class="tag" style="margin-left:4px">DEF</span><div class="die red roll" title="Red die">${RED[d.d1-1]}</div><div class="die grn roll" title="Green die">${GREEN[d.d2-1]}</div>`:"";
  return `<div class="dice">${o}${df}</div>`;
}
// Color of a chart box. Black = gain, red = bad for the offense, yellow = flag, gold = breakaway/TD, dashed = incomplete.
function boxCls(c){ if(!c) return "inc";
  if(c.k==="y") return c.td?"brk":c.y<0?"red":c.y===0?"wht":"blk";
  if(c.k==="inc") return "inc";
  if(c.k==="pen") return "yel";
  if(c.k==="b"||c.k==="td") return "brk";
  if(c.k==="tb"||c.k==="ok"||c.k==="keep"||c.k==="ret") return "blk";
  return "red"; }
function miniBox(c){ return `<span class="mini ${boxCls(c)}">${esc(c&&c.k==="keep"?"KEEP":c&&c.k==="lost"?"LOST":boxTxt(c))}</span>`; }
const FOLNAME={QT:"Quarterback trapped",B:"Breakaway",FUM:"Fumble recovery",INT:"Interception return"};
const FOLCOL={QT:"QT column",B:"Breakaway column",FUM:"Fumble line",INT:"Interception Return column"};
function lookupLine(l){
  if(!l||l.R==null) return "";
  let h="";
  if(l.pk&&PLAYS[l.pk]&&l.o){
    h+=`<span class="lk">${miniBox(l.o)}${TEAMS[l.team].short} chart · ${esc(PLAYS[l.pk].name)} · roll ${l.R}</span>`;
    if(l.d) h+=`<span class="lk">${miniBox(l.d)}Defense ${esc(DEFS[l.dk].short)} · roll ${l.D}</span>`;
    if(l.why) h+=`<span class="lk why">${esc(l.why)}</span>`;
  } else if(l.o){ h+=`<span class="lk">${miniBox(l.o)}${esc(playName(l.pk))} · roll ${l.R}</span>`; }
  if(l.fol) h+=`<span class="lk">${miniBox(l.fol.box)}${esc(FOLCOL[l.fol.kind])} · roll ${l.fol.R}</span>`;
  return h?`<div class="lookup">${h}${l.pk&&PLAYS[l.pk]?`<button class="btn ghost sm" data-act="lookup">Show on the charts</button>`:""}</div>`:"";
}
function resultBanner(){
  const l=S.last; if(!l) return `<div class="result"><div class="big">Super Bowl LVII, replayed with dice</div></div>`;
  const showDef = l.D!=null && l.dice && l.dice.d1;
  const fd = l.fol&&l.fol.dice?`<span class="tag">${esc(FOLNAME[l.fol.kind])}</span>${diceHTML(l.fol.dice,false)}`:"";
  return `<div class="result ${l.cls||""} ${l.wait?"waitroll":""}" aria-live="polite"><div class="dicewrap">${l.dice&&l.dice.t?diceHTML(l.dice,showDef):""}${fd}</div><div class="big">${esc(l.txt)}</div>${lookupLine(l)}</div>`;
}
function nm(p){ return p?esc(p.name):"the admin"; }
function waitingText(){
  const ns=needs(S); if(S.paused) return "Game paused by the admin.";
  if(!ns.length) return "";
  return ns.map(n=>{ if(n.kind==="start") return "Waiting for the admin to start the game."; if(n.kind==="toss") return "Waiting for the admin to flip the coin.";
    const w=whoFor(S,n); const T=TEAMS[n.team].name;
    if(n.side==="fol") return `${nm(w)} rolls the ${T} ${FOLNAME[n.fol].toLowerCase()} roll.`;
    return n.kind==="call"?`${nm(w)} is calling the ${T} ${n.side==="off"?"play":"defense"}.`:n.kind==="pat"?`${nm(w)} picks the ${T} try after the TD.`:`${nm(w)} rolls the ${T} ${n.side==="off"?"offense":"defense"} dice.`; }).join(" ");
}

// ---------- Your-turn panel ----------
function myTurns(){ return needs(S).filter(n=>n.team&&canAct(S,myId,n)&&(whoFor(S,n)&&whoFor(S,n).id===myId || isAdmin())); }
function turnPanel(){
  const s=S; const mine=me();
  if(s.phase==="lobby") return lobbyPanel();
  if(s.phase==="over"){ const w=s.winner; return `<div class="panel"><h2 style="font-size:32px;color:${w==="KC"?"var(--kcgold)":"var(--phi)"}">${w==="TIE"?"It's a tie!":TEAMS[w].city+" "+TEAMS[w].name+" win!"}</h2>${isAdmin()?`<button class="btn primary" data-act="confirm" data-what="newgame">Play again</button>`:`<div class="muted">Ask the admin to start a rematch.</div>`}</div>`; }
  if(s.phase==="toss") return `<div class="panel"><h2>Coin toss</h2>${isAdmin()?`<button class="btn primary big" data-act="send" data-a='{"type":"toss"}'>Flip the coin</button>`:`<div class="wait">Waiting for the admin to flip the coin.</div>`}</div>`;
  const ns=needs(s);
  const mineNs=ns.filter(n=>{ const w=whoFor(s,n); return w?w.id===myId:isAdmin(); });
  const adminCover = isAdmin()? ns.filter(n=>{const w=whoFor(s,n); return w&&w.id!==myId;}) : [];
  let out="";
  mineNs.forEach(n=>out+=actionCard(n,false));
  if(!mineNs.length) out+=`<div class="panel"><div class="wait">${esc(waitingText())||"…"}</div>${statusChips()}${timeoutRow()}</div>`;
  else out+=`<div class="panel slim">${statusChips()}${timeoutRow()}</div>`;
  if(adminCover.length) out+=`<details class="panel"><summary>Admin: act for someone who's away</summary>${adminCover.map(n=>actionCard(n,true)).join("")}</details>`;
  return out;
}
function statusChips(){
  const s=S; if(s.phase!=="play"&&!(s.phase==="pat"&&s.pend.pat==="2PT")) return "";
  const P=s.pend; const off=s.poss, def=other(off);
  const c=(ok,label)=>`<span class="chip ${ok?"ok":""}">${ok?"✓":"…"} ${label}</span>`;
  const st=P.oc&&ST(P.oc);
  return `<div class="row">${c(!!P.oc,TEAMS[off].short+" play")}${st?"":c(!!P.dc,TEAMS[def].short+" defense")}${P.oc&&!NOROLL(P.oc)?c(!!P.od,TEAMS[off].short+" dice"):""}${!st&&P.oc&&P.dc?c(!!P.dd,TEAMS[def].short+" dice"):""}</div>`;
}
function timeoutRow(){
  const s=S; const m=me(); if(s.phase!=="play"||!s.running||s.pend.od||s.pend.dd) return "";
  const t=m?m.team:(isAdmin()?null:null); const teams=t?[t]:isAdmin()?["KC","PHI"]:[];
  return teams.filter(x=>s.to[x]>0).map(x=>`<button class="btn small" data-act="confirm" data-what="timeout" data-team="${x}">Call ${TEAMS[x].short} timeout (${s.to[x]} left)</button>`).join(" ");
}
function actionCard(n,asAdmin){
  const s=S; const T=TEAMS[n.team]; const tag=asAdmin?`<div class="tag">Acting for ${nm(whoFor(s,n))}</div>`:"";
  if(n.kind==="pat") return `<div class="panel ${T.cls} turn">${tag}<h2>Your call: the try</h2><div class="row"><button class="btn primary" data-act="send" data-a='{"type":"pat","k":"XP"}'>Kick extra point (+1)</button><button class="btn" data-act="send" data-a='{"type":"pat","k":"2PT"}'>Go for two (+2)</button></div></div>`;
  if(n.kind==="call"){
    const key=n.team+n.side; const sel=ui.sel&&ui.sel.key===key?ui.sel.play:null;
    let sheet="";
    if(n.side==="off"){
      const dist=toGoal(s)+17; const tempo=ui.tempo||"normal";
      const hud=s.running?(TEMPO[tempo]||TEMPO.normal).secs:0, use=hud+10, left=s.clock-use;
      const warn=s.running&&s.clock-hud<=0?`<div class="clockwarn bad">⚠ The clock runs out before the snap. Call a timeout or pick Hurry-up.</div>`:left<=0?`<div class="clockwarn">⚠ Last play of the ${s.q>=s.nq?"game":"quarter"}: this snap uses the rest of the clock.</div>`:"";
      sheet=`<div class="clockbox"><div><b>${fmtClock(s.clock)}</b> left · clock ${s.running?"running":"stopped"}</div><div class="small">This snap uses <b>${use}s</b>${s.running?` (${hud}s huddle + 10s play)`:" (10s play)"}, leaving <b>${fmtClock(Math.max(0,left))}</b>. If the play ends in bounds, the clock keeps running and the next huddle costs more.</div>${warn}</div>
      <div class="tag">Tempo (how much clock runs before the snap)</div><div class="seg">${Object.keys(TEMPO).map(k=>`<button class="${tempo===k?"on":""}" data-act="tempo" data-k="${k}">${TEMPO[k].name}<small>${s.running?`−${TEMPO[k].secs}s`:"clock stopped"}</small></button>`).join("")}</div>
      <div class="plays">${OFF_ORDER.map(k=>{const r=RATE[n.team][k];return `<button class="play ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${PLAYS[k].n} · ${PLAYS[k].name}</b><span class="s">${PLAYS[k].desc}</span><span class="s clk">⏱ stops the clock ~${clockStopPct(n.team,k)}%</span>${r>0?'<span class="stars">★ team strength</span>':""}</button>`;}).join("")}
      ${s.phase==="play"?`<button class="play ${sel==="PUNT"?"sel":""}" data-act="pick" data-key="${key}" data-play="PUNT"><b>Punt</b><span class="s">${s.down===4?"Smart on 4th down":"Any down"}</span></button>
      <button class="play ${sel==="FG"?"sel":""}" data-act="pick" data-key="${key}" data-play="FG" ${dist<=64?"":"disabled"}><b>Field Goal</b><span class="s">${dist<=64?`${dist} yds · ${fgChance(dist,n.team)}% chance`:"Too far"}</span></button>
      <button class="play ${sel==="SPIKE"?"sel":""}" data-act="pick" data-key="${key}" data-play="SPIKE"><b>Spike</b><span class="s">Stop the clock, lose a down</span></button>
      <button class="play ${sel==="KNEEL"?"sel":""}" data-act="pick" data-key="${key}" data-play="KNEEL"><b>Kneel</b><span class="s">Lose 1, keep clock running</span></button>`:""}</div>`;
    } else {
      sheet=`<div class="plays">${DEF_ORDER.map(k=>{const r=DEFRATE[n.team][k];return `<button class="play def ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${DEFS[k].name}</b><span class="s">${DEFS[k].desc}</span>${r>0?'<span class="stars">★ team strength</span>':""}</button>`;}).join("")}</div>`;
    }
    const a=JSON.stringify({type:"call",side:n.side,play:sel,tempo:ui.tempo||"normal"});
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your call: ${T.name} ${n.side==="off"?"offense":"defense"}</h2><div class="small muted">${n.side==="off"?`${ord(s.down)} & ${toGoal(s)<=s.toGo?"Goal":s.toGo} at ${spotName(s.ball)}. Keep your phone hidden from the other team.`:`Guess what ${TEAMS[s.poss].name} will run.`}</div>${sheet}
      <button class="btn primary big" data-act="send" data-a='${esc(a)}' ${sel?"":"disabled"}>Lock in ${sel?esc(playName(sel)):"call"}</button></div>`;
  }
  if(n.kind==="roll"){
    const fol=n.side==="fol"; const off=n.side!=="def"; const isKO=s.phase==="kickoff"; const md=ui.md; const keys=off?["t","a","b"]:["d1","d2"];
    const ready=keys.every(k=>md[k]);
    const face=(k,label,cls,map,mul)=>`<label><span><span class="die ${cls} sm"></span> ${label}</span><span class="faces">${[1,2,3,4,5,6].map(v=>`<button data-act="face" data-k="${k}" data-v="${v}" class="${md[k]===v?"on":""}" aria-label="${label} face ${v}">${v}<small>=${map[v-1]*(mul||1)}</small></button>`).join("")}</span></label>`;
    const what=fol?FOLNAME[n.fol].toLowerCase()+" roll":s.phase==="kickoff"?"kickoff":S.pend.oc==="PUNT"?"punt":S.pend.oc==="FG"?"field goal":S.pend.pat==="XP"?"extra point":off?"offense":"defense";
    const folNote=fol?`<div class="small">${n.fol==="QT"?"The pass rush got there. Roll to see what the quarterback does (QT column).":n.fol==="B"?"He's loose! Roll to see how far he goes (Breakaway column).":n.fol==="FUM"?"Ball's on the ground! Roll the fumble line: 10–28 you keep it.":"Picked off! Roll your Interception Return column."}</div>`:"";
    const manual=ui.manual?`<div class="manual">${off?face("t","Black die","blk",BLACK,10)+face("a","White die","wht",WHITE)+face("b","Blue die","blu",BLUE):face("d1","Red die","red",RED)+face("d2","Green die","grn",GREEN)}</div>
      <button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side,onside:isKO&&!!ui.onside,dice:Object.fromEntries(keys.map(k=>[k,md[k]||0]))}))}' ${ready?"":"disabled"}>Submit my dice</button>`:
      `<button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side,onside:isKO&&!!ui.onside}))}'>🎲 ${isKO&&ui.onside?"Onside kick: roll":"Roll"} ${off?"black, white & blue":"red & green"}</button>`;
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your roll: ${T.name} ${what}</h2>${folNote}${isKO?`<label class="row small"><input type="checkbox" id="onside" ${ui.onside?"checked":""}> Onside kick (you recover on 36–39, about 1 in 7; otherwise they get it at your 45)</label>`:""}<label class="row small muted"><input type="checkbox" id="manualdice" ${ui.manual?"checked":""}> I'm rolling real dice</label>${manual}</div>`;
  }
  return "";
}

// ---------- Lobby / team ----------
function rosterCol(team){
  const L=teamList(S,team); const s=S;
  const c=callerOf(s,team), r=rollerOf(s,team);
  return `<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} <span class="muted small">${L.length} player${L.length===1?"":"s"}</span></h2>
   <ol class="roster">${L.map((p,i)=>`<li><span>${esc(p.name)}${p.id===myId?' <span class="tag">you</span>':""}${p.id===s.admin?' <span class="tag">admin</span>':""}</span><span class="roles">${s.phase!=="lobby"&&c&&c.id===p.id?'<span class="pill">calls next</span>':""}${s.phase!=="lobby"&&r&&r.id===p.id?'<span class="pill r">rolls next</span>':""}</span>${isAdmin()?`<span class="adm"><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"up",pid:p.id}))}' title="Move up" aria-label="Move ${esc(p.name)} up">↑</button><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"move",pid:p.id}))}' title="Switch team" aria-label="Switch ${esc(p.name)} to other team">⇄</button>${p.id!==s.admin?`<button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"admin",pid:p.id}))}' title="Make admin" aria-label="Make ${esc(p.name)} the admin">👑</button>`:""}<button class="mini" data-act="confirm" data-what="kick" data-pid="${esc(p.id)}" title="Remove" aria-label="Remove ${esc(p.name)}">✕</button></span>`:""}</li>`).join("")||'<li class="muted">No one yet</li>'}</ol>
   ${s.phase!=="lobby"&&isAdmin()&&L.length>1?`<div class="row"><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"call"}))}'>Skip caller</button><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"roll"}))}'>Skip roller</button></div>`:""}</div>`;
}
function joinBox(){
  const m=me(); const name=ui.name!=null?ui.name:(m?m.name:(localGet("tb.name")||""));
  return `<div class="panel"><h2>${m?"Your team":"Join a team"}</h2>
    <label class="small muted" for="pname">Your name</label><input id="pname" class="inp" maxlength="18" value="${esc(name)}" autocomplete="off">
    <div class="row btns"><button class="btn team-kc ${m&&m.team==="KC"?"on":""}" data-act="join" data-team="KC">Join Chiefs</button><button class="btn team-phi ${m&&m.team==="PHI"?"on":""}" data-act="join" data-team="PHI">Join Eagles</button>${m?`<button class="btn ghost small" data-act="send" data-a='{"type":"leave"}'>Leave team</button>`:""}</div>
    <div class="small muted">Turns rotate in the order players joined. The admin can reorder.</div></div>`;
}
function lobbyPanel(){
  return `${(isAdmin()||mode==="host")&&mode!=="local"?`<div class="panel"><h2>Invite players</h2><div class="small muted">Show this screen around. Everyone scans the QR, taps Join as a player, and picks a team. They wait here until you start.</div>${shareBox()}${mode==="host"?`<div class="note small"><b>Hosting on a computer?</b> Leave this tab open; it runs the game for everyone. Join on your phone, then tap 👑 next to your name here to make your phone the admin.${!isAdmin()?" Admin has been handed to a phone.":""}</div>`:""}</div>`:""}${joinBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>${isAdmin()?settingsBox()+`<button class="btn primary big" data-act="send" data-a='{"type":"start"}'>Start the game</button>`:`<div class="wait">Waiting for the admin to start.</div>`}`;
}
function settingsBox(){
  const s=S; const locked=!(s.phase==="lobby"||s.phase==="toss");
  return `<div class="panel"><h2>Game length</h2><div class="row"><label class="small muted" for="nq">Quarters</label><select id="nq" class="btn">${NQS.map(n=>`<option value="${n}" ${s.nq===n?"selected":""}>${n}</option>`).join("")}</select>
   <label class="small muted" for="qmin">Minutes per quarter</label><select id="qmin" class="btn" ${locked?"disabled":""}>${QMINS.map(n=>`<option value="${n}" ${s.qmin===n?"selected":""}>${n} min</option>`).join("")}</select></div>
   <div class="small muted">About ${Math.round(s.nq*s.qmin*2)} snaps and kicks, roughly ${Math.round(s.nq*s.qmin*2*40/60/5)*5} minutes at the table. 15 minutes is the real Paydirt length; pick 5 or 8 for a quicker game.</div></div>`;
}

// ---------- Playbook / rules ----------
// ---------- Paydirt-style charts ----------
function boxTD(c,hi){ const t=c&&c.k==="keep"?"KEEP":c&&c.k==="lost"?"LOST":boxTxt(c); return `<td class="bx ${boxCls(c)}${hi?" hi":""}"><b>${esc(t)}</b>${c&&c.ob?`<u>*</u>`:""}</td>`; }
const pct=n=>(Math.round(n/216*1000)/10)+"%";
// Odds line under each offense column, straight from the boxes.
function colOdds(team,pk){
  let comp=0,yd=0,inc=0,qt=0,to=0,b=0,pen=0; ROLLS.forEach(R=>{ const c=CHART[team][pk][R],w=OFFP[R];
    if(c.k==="y"){comp+=w;yd+=w*c.y;} else if(c.k==="inc")inc+=w; else if(c.k==="qt")qt+=w; else if(c.k==="int"||c.k==="f")to+=w; else if(c.k==="b")b+=w; else pen+=w; });
  const pass=PLAYS[pk].cat==="pass";
  return `${pass?`${pct(comp)} catch`:`avg ${(yd/comp).toFixed(1)}`}<br>${pass?`avg ${(yd/comp).toFixed(1)}`:`${pct(to)} fum`}${pass?`<br>${pct(inc)} inc<br>${pct(qt)} QT<br>${pct(to)} INT`:""}<br>${pct(b)} B`;
}
function offChart(team,hl){
  const cols=OFF_ORDER.concat(["QT","B"]);
  const name=k=>PLAYS[k]?`${PLAYS[k].n} · ${PLAYS[k].name}${RATE[team][k]>0?" ★":""}`:k==="QT"?"QT · QB trapped":"B · Breakaway";
  return `<div class="pd"><table><thead><tr><th class="rk">Roll</th><th class="pr">Odds</th>${cols.map(k=>`<th class="${hl&&(hl.pk===k||hl.fol===k)?"hc":""} ${PLAYS[k]?"":"xc"}">${name(k)}</th>`).join("")}</tr></thead><tbody>
  ${ROLLS.map(R=>`<tr class="${R%10===0?"dec":""}${hl&&(hl.R===R||hl.FR===R)?" hr":""}"><th class="rk">${R}</th><td class="pr">${OFFP[R]}</td>${cols.map(k=>boxTD(CHART[team][k][R],hl&&((hl.R===R&&hl.pk===k)||(hl.FR===R&&hl.fol===k)))).join("")}</tr>`).join("")}
  <tr class="odds"><th class="rk">Odds</th><td class="pr">of 216</td>${OFF_ORDER.map(k=>`<td>${colOdds(team,k)}</td>`).join("")}<td></td><td></td></tr>
  </tbody></table></div>`;
}
function stChart(team,hl){
  const cols=[["KR","Kickoff return"],["PU","Punt (net)"],["FG","Field goal (good up to)"],["XP","Extra point"],["IR","Interception return"],["FM","Fumble recovery"]];
  const cellOf=(k,R)=>k==="FM"?{k:FUMKEEP(R)?"keep":"lost"}:CHART[team][k][R];
  return `<div class="pd"><table><thead><tr><th class="rk">Roll</th>${cols.map(([k,n])=>`<th>${n}</th>`).join("")}</tr></thead><tbody>
  ${ROLLS.map(R=>`<tr class="${R%10===0?"dec":""}"><th class="rk">${R}</th>${cols.map(([k])=>boxTD(cellOf(k,R),false)).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function defChart(dk,hl,team){
  const Ds=[1,2,3,4,5];
  return `<div class="pd dc"><table><thead><tr><th class="rk">Play</th>${Ds.map(D=>`<th class="${hl&&hl.D===D?"hc":""}">${D}<small>${Math.round(DEFP[D]/36*100)}%</small></th>`).join("")}</tr></thead><tbody>
  ${OFF_ORDER.map(pk=>`<tr class="${hl&&hl.pk===pk?"hr":""}"><th class="rk">${PLAYS[pk].n} · ${PLAYS[pk].name}</th>${Ds.map(D=>boxTD(defBox(pk,dk,D),hl&&hl.pk===pk&&hl.D===D)).join("")}</tr>`).join("")}
  </tbody></table></div>`;
}
function playbookView(){
  const m=me(); const l=S&&S.last; const myT=m&&m.team;
  // Players only see their own team's sheet for the side they're on right now.
  const locked=!!(myT&&S&&S.phase!=="lobby"&&mode!=="local");
  const side=!locked?null:(ui.pbHL&&l&&l.team&&l.pk&&PLAYS[l.pk])?(l.team===myT?"off":"def"):(!S.poss||S.poss===myT?"off":"def");
  const team=locked?(side==="off"?myT:other(myT)):(ui.pbTeam||(m?m.team:"KC")); const def=other(team);
  const allowed=!locked?["off","def","st","how"]:side==="off"?["off","st","how"]:["def","st","how"];
  const dk=ui.pbDef||"A"; const sub=allowed.includes(ui.pbSub)?ui.pbSub:allowed[0];
  const stT=locked?myT:team;
  const SUBN={off:"Offense chart",def:"Defense chart",st:"Kicks & returns",how:"How to read"};
  const okL=ui.pbHL&&l&&l.team===team&&l.pk&&PLAYS[l.pk];
  const hlO=okL?{R:l.R,pk:l.pk,FR:l.fol&&(l.fol.kind==="QT"||l.fol.kind==="B")?l.fol.R:null,fol:l.fol?l.fol.kind:null}:null;
  const hlD=okL&&l.dk===dk?{D:l.D,pk:l.pk}:null;
  return `${locked?`<div class="panel slim ${TEAMS[myT].cls}"><div class="small"><b>${TEAMS[myT].name} ${side==="off"?"on offense":"on defense"}.</b> ${side==="off"?"You see your offense chart. Your defense chart shows up when the other team has the ball.":"You see your defense chart. Your offense chart shows up when you get the ball back."}</div></div>`:`<div class="seg wide">${["KC","PHI"].map(t=>`<button class="${team===t?"on":""}" data-act="pb" data-t="${t}">${TEAMS[t].name} on offense</button>`).join("")}</div>`}
   ${okL?`<div class="panel slim">${lookupLine(l).replace(/<button[^>]*>.*?<\/button>/,`<button class="btn ghost sm" data-act="pbclear">Clear highlight</button>`)}</div>`:""}
   <div class="seg">${allowed.map(k=>`<button class="${sub===k?"on":""}" data-act="pbsub" data-k="${k}">${SUBN[k]}</button>`).join("")}</div>
   ${sub==="off"?`<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} offense chart</h2>
    <div class="small">Find the offense roll (10–39) down the left and the play across the top. "Odds" is how many of the 216 dice combinations make that roll.</div>
    ${offChart(team,hlO)}${legend()}</div>`:""}
   ${sub==="def"?`<div class="panel"><h2>${TEAMS[def].name} defense chart</h2>
    <div class="seg">${DEF_ORDER.map(d=>`<button class="${dk===d?"on":""}" data-act="pbdef" data-d="${d}">${DEFS[d].name}</button>`).join("")}</div>
    <div class="small">${esc(DEFS[dk].desc)}. Find the play down the left and the defense roll (red + green, 1–5) across the top.${DEFRATE[def][dk]?` ${TEAMS[def].name} ★ ${DEFS[dk].short}: add 1 to the defense roll (max 5).`:""}</div>
    ${defChart(dk,hlD,team)}${legend()}</div>`:""}
   ${sub==="st"?`<div class="panel ${TEAMS[stT].cls}"><h2>${TEAMS[stT].name} kicks & returns</h2><div class="small">Roll the offense dice (black + white + blue). The box is the final result; don't use the defense chart.</div>${stChart(stT)}</div>`:""}
   ${sub==="how"?howToRead():""}`;
}
function legend(){ return `<div class="legend small"><span><span class="mini blk">+6</span> gain</span><span><span class="mini wht">0</span> no gain</span><span><span class="mini red">−3</span> loss / turnover / QT</span><span><span class="mini yel">DEF 5</span> flag</span><span><span class="mini brk">B</span> breakaway</span><span><span class="mini inc">INC</span> black = incomplete</span><span>( ) overrules the other box</span><span><u>*</u> out of bounds / auto first down</span><span>★ team strength</span></div>`; }
function howToRead(){
  return `<div class="panel"><h2>Reading a play, step by step</h2><ol class="small">
   <li><b>Offense box.</b> Offense chart, called play, offense roll (10–39).</li>
   <li><b>Defense box.</b> Defense chart, the defense that was called, play row, defense roll (1–5).</li>
   <li><b>Who wins:</b>
    <ul><li>Check in this order, like the real Paydirt priority chart:</li>
    <li>1. A <b>flag</b> (OFF, DEF, PI) always comes first. 2. Then an offense <b>F</b> (fumble).</li>
    <li>3. Then anything special in the <b>defense</b> box: <b>(TD)</b>, a number in <b>( )</b>, <b>QT</b>, a black box (incomplete, or no gain on a run), or <b>INT</b>. It overrules the offense box.</li>
    <li>4. Then the offense box: <b>B</b>, <b>QT</b>, <b>INT</b>, black (incomplete), or a number in ( ).</li>
    <li>5. Two plain numbers: <b>add them</b>.</li></ul></li>
   <li><b>Follow-up rolls.</b> QT → offense rolls again on its QT column (sack, throw-away, scramble or strip-sack). B → offense rolls on its Breakaway column. INT → the defense rolls on its Interception Return column. F → the team that fumbled rolls the fumble line (KEEP on 10–28, LOST on 29–39; 37–39 is returned, 39 all the way).</li>
   <li><b>Flags.</b> OFF = against the offense, DEF/PI = against the defense. * = automatic first down. The app rolls the offense dice again to see what the play itself did, and the team that was fouled takes whichever is better (accept or decline). A flag never goes more than half the distance to the goal.</li>
   <li><b>Kickoffs.</b> Roll on the receiving team's return column. The kicking team can try an <b>onside kick</b> instead: 36–39 recovers.</li>
   <li><b>Overtime.</b> NFL playoff rules: both teams get the ball at least once, then next score wins.</li></ol></div>
   <div class="panel"><h2>Where the numbers come from</h2><p class="small">Each column was built to match the team's real 2022 season: Chiefs 66.8% completions, 8.1 yards per pass, 1.8% interceptions, 3.8% sacked, 4.7 per carry. Eagles 65.3%, 8.1, 1.7%, 7.6% sacked, 4.6 per carry. Where each kind of box sits comes from 30 real 1983 Paydirt team charts: on every play and roll we counted how often those charts put an incomplete, QT, flag, interception, fumble or breakaway there, and put ours in the same spots. That is why passes have long black runs of incompletes in the 30s, Long Pass most of all, and why flags gather on 19, 29 and 39 and the rare 10s. The yard boxes then rise smoothly: the common 30s and 20s hold everyday gains, the rare 10s the extremes.</p></div>`;
}
function diceKey(){
  const row=(n,cls,map,note)=>`<tr><th><span class="die ${cls} sm">${n}</span></th>${map.map(v=>`<td>${v}</td>`).join("")}<td class="small muted">${note}</td></tr>`;
  return `<div class="tbl"><table class="dk"><thead><tr><th>Die</th>${[1,2,3,4,5,6].map(f=>`<th>${f}</th>`).join("")}<th></th></tr></thead><tbody>
   ${row("Black","blk",BLACK.map(v=>v*10),"tens (offense)")}${row("White","wht",WHITE,"ones (offense)")}${row("Blue","blu",BLUE,"ones (offense)")}${row("Red","red",RED,"defense")}${row("Green","grn",GREEN,"defense")}</tbody></table></div>`;
}
function rulesView(){
  const s=S;
  return `<div class="panel"><h2>How a play works</h2><ol class="small">
   <li><b>Call.</b> Both play callers pick secretly: offense picks one of 9 plays and a tempo; defense picks formation A–F.</li>
   <li><b>Roll.</b> Offense rolls black + white + blue (10–39). Defense rolls red + green (1–5).</li>
   <li><b>Look up.</b> Offense box from the offense chart, defense box from the defense chart, then the "who wins" rules (Playbook → How to read). The app does this and shows both boxes.</li>
   <li><b>Follow-up roll</b> when the result is QT, B, an interception or a fumble.</li>
   <li><b>Rotate.</b> After each play, the next player on each team becomes the caller, and the roller moves down one too.</li></ol></div>
  <div class="panel"><h2>Using normal dice</h2><div class="small">Use five dice of different colors. Each face reads as the number in the table. This gives the exact odds of Paydirt's special dice.</div>${diceKey()}
   <p class="small">Example: black 4 (30), white 3 (2), blue 6 (4) → <b>36</b>. Red 5 (2) + green 1 (0) → <b>2</b>. No colored dice? Tap "Roll" and let the app do it.</p></div>
  <div class="panel"><h2>Clock management</h2><ul class="small">
   <li>${s.nq} quarter${s.nq>1?"s":""} of ${s.qmin} minutes. Halftime resets timeouts to 3 per team.</li>
   <li>Time runs in 10-second boxes, like Paydirt. Every snap or kick uses 1 box (10s).</li>
   <li>If the clock is still running, the huddle uses more: Normal 3 boxes (30s), Hurry-up 1 box (10s), Run the clock 4 boxes (40s). So a run that stays in bounds costs 40s with a normal huddle.</li>
   <li><b>Clock stops</b> after an incomplete pass, out of bounds (*), a flag, a turnover, a score, a punt, a field goal try, a timeout, or a spike.</li>
   <li><b>Two-minute warning</b> stops the clock at 2:00 in Q${s.nq>=2?s.nq/2:"-"} and Q${s.nq}.</li>
   <li>If the clock would hit 0:00 before the snap, the quarter ends with no play.</li>
   <li>Any player can call their team's timeout while the clock is running, before the dice are rolled.</li></ul></div>
  <div class="panel"><h2>Kicks and scoring</h2><ul class="small">
   <li>Kickoffs, punts, field goals and extra points: roll the offense dice and read the Kicks & returns chart. That box is final.</li>
   <li>Field goal distance = yards to the goal line + 17. It's good if the box is at least that far.</li>
   <li>Extra point: red box (10–11) is no good. Two-point try is a normal play from the 2.</li>
   <li>Safety: 2 points and a free kick. Tied at the end: overtime with NFL playoff rules. Coin toss, then both teams get the ball at least once, even if the first team scores a touchdown. Still tied after that: next score wins. 3 timeouts each.</li></ul></div>
  <div class="panel"><h2>About the original</h2><p class="small">A homemade tribute to Paydirt (Sports Illustrated / Avalon Hill), where each real team got its own chart built from its stats. Same dice, same 9 plays, same A–F defenses and the same "who wins" rules. The charts here are built from the 2022 Chiefs and Eagles, the Super Bowl LVII teams (KC 38, PHI 35).</p></div>`;
}

// ---------- Admin ----------
function adminView(){
  const s=S;
  return `<div class="panel"><h2>Admin</h2><div class="small muted">You control the game from this phone. Keep it open: it hosts the game for everyone.</div>
   ${shareBox()}
   <div class="row">${s.paused?`<button class="btn primary" data-act="send" data-a='{"type":"pause","on":false}'>▶ Resume game</button>`:`<button class="btn" data-act="confirm" data-what="pause">⏸ Pause game</button>`}
   <button class="btn" data-act="confirm" data-what="undo" ${s.prev?"":"disabled"}>↶ Undo last play</button>
   <button class="btn danger" data-act="confirm" data-what="newgame">Restart game</button></div></div>
   ${settingsBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>`;
}
function shareURL(){ const base=location.href.split("#")[0]; return net.via==="db"?base:`${base}#${S.code}`; }
function shareBox(){
  if(net.via==="db") return `<div class="share"><div><div class="tag">Share this page's link</div></div></div>`;
  const url=shareURL();
  return `<div class="share"><div><div class="qr" id="qr" role="button" tabindex="0" data-act="qrbig" aria-label="QR code to join. Tap to make it bigger"></div><div class="qrhint">Tap to enlarge</div></div><div style="min-width:0"><div class="tag">Game code</div><div class="code">${esc(S.code)}</div><div class="small url">${esc(url)}</div><div class="row"><button class="btn small" data-act="copy">Copy link</button><button class="btn small" data-act="tvopen">Open TV view</button><a class="btn small" href="card.html#${esc(S.code)}" target="_blank" rel="noopener">Quick card</a></div></div></div>`;
}
function showBigQR(){
  if(!window.qrcode||!S) return; const ov=document.createElement("div"); ov.className="qrbig"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Big QR code");
  let svg=""; try{ const q=window.qrcode(0,"M"); q.addData(shareURL()); q.make(); svg=q.createSvgTag({cellSize:8,margin:2,scalable:true}); }catch(e){}
  ov.innerHTML=`<div class="big">${svg}</div><div class="c">${esc(S.code||"")}</div><div class="h">Scan to join · tap anywhere to close</div>`;
  const close=()=>{ ov.remove(); document.removeEventListener("keydown",esc1); }; const esc1=e=>{ if(e.key==="Escape") close(); };
  ov.addEventListener("click",close); document.addEventListener("keydown",esc1); document.body.appendChild(ov);
}
function drawQR(){
  const el=document.getElementById("qr"); if(!el||!window.qrcode) return;
  try{ const q=window.qrcode(0,"M"); q.addData(shareURL()); q.make(); el.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true}); }catch(e){}
}

// ---------- TV ----------
function tvView(){
  const s=S;
  return `<div class="tv">${scoreboard(true)}${field(true)}${resultBanner()}<div class="tvwait">${esc(waitingText())}</div>
   <div class="row" style="justify-content:space-between"><span class="tag">Join: ${esc(net.via==="db"?"open this page":shareURL())}</span><button class="btn ghost small" data-act="tab" data-t="field">Exit TV view</button></div></div>`;
}

// ---------- Home (not in a game yet) ----------
function homeView(){
  const code=(ui.code!=null?ui.code:(location.hash||"").replace("#","")).toUpperCase().slice(0,4);
  const canResume=(()=>{ const h=loadHost(); return h&&h.v===4&&h.admin===myId&&h.phase!=="over"?h:null; })();
  return `<div class="hero"><div class="tag">Super Bowl LVII rematch · Feb 12, 2023</div>
    <div class="herobox"><div class="hl kc"><span>Chiefs</span><b>38</b></div><div class="hl phi"><span>Eagles</span><b>35</b></div></div>
    <div class="muted">Paydirt-style dice football. Everyone plays on their own phone.</div></div>
   <div class="panel"><h2>Join a game</h2><label class="small muted" for="code">Game code</label>
    <input id="code" class="inp code-inp" maxlength="4" value="${esc(code)}" placeholder="ABCD" autocomplete="off" autocapitalize="characters">
    <div class="stack"><button class="btn primary" data-act="joincode">Join as a player</button><button class="btn" data-act="joincode" data-tv="1">Join as TV / cast screen</button></div></div>
   <div class="panel"><h2>Run the game (admin)</h2><div class="small muted">Start a new game on your phone. Everyone else joins with the code.</div>
    <div class="stack">${canResume?`<button class="btn primary" data-act="resume">Resume game ${esc(canResume.code)} (KC ${canResume.score.KC}, PHI ${canResume.score.PHI})</button>`:""}<button class="btn ${canResume?"":"primary"}" data-act="host">Start a new game</button></div></div>
   <div class="panel"><h2>One phone only?</h2><div class="small muted">Play everything on this device and pass it around.</div><div class="stack"><button class="btn" data-act="local">Play on this device</button></div></div>
   <div class="stack"><a class="btn ghost" href="card.html">Quick card: QR code, dice and rules</a></div>
   ${!window.Peer?`<div class="note small">Live sync didn't load. Reload, or use "Play on this device".</div>`:""}`;
}

// ---------- App shell ----------
function tabs(){
  const t=ui.tab||"field"; const items=[["field","Field","🏈"],["book","Playbook","📋"],["team","Teams","👥"],["rules","Rules","📖"]]; if(isAdmin()) items.push(["admin","Admin","⚙"]);
  return `<nav class="tabbar">${items.map(([k,l,i])=>`<button class="${t===k?"on":""}" data-act="tab" data-t="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join("")}<button data-act="tab" data-t="tv"><span aria-hidden="true">📺</span>TV</button></nav>`;
}
function headerBar(){
  const m=me(); const st=mode==="local"?"One device":net.live?"Live":"Offline";
  return `<div class="topbar"><div class="row"><span class="brand">TURKEY BOWL <b>LVII</b></span>${m?`<span class="chip ${TEAMS[m.team].cls}">${esc(m.name)} · ${TEAMS[m.team].short}</span>`:ui.spectator?`<span class="chip">TV</span>`:""}</div><span class="sync ${net.live||mode==="local"?"on":"off"}" title="${esc(net.status)}">● ${st}${S&&S.code&&net.via==="peer"?" · "+esc(S.code):""}</span></div>${net.status&&!net.live&&mode!=="local"?`<div class="note small">${esc(net.status)}</div>`:""}${ui.err?`<div class="note small err">${esc(ui.err)}</div>`:""}${mode==="client"&&!net.live&&S&&net.lostAt&&Date.now()-net.lostAt>20000?`<div class="note small">Admin's phone gone for good? Any phone can pick the game up from its last play. <button class="btn small" data-act="confirm" data-what="takeover">Take over hosting</button></div>`:""}`;
}
function confirmModal(){
  const c=ui.confirm; if(!c) return "";
  const msgs={newgame:["Restart the game?","The score, clock and play log reset for everyone. Players stay on their teams."],pause:["Pause the game?","Nobody can call or roll until you resume."],undo:["Undo the last play?","The field, score and clock go back one play."],kick:["Remove this player?","They can join again with the code."],takeover:["Take over hosting?","This phone becomes the host, with a new game code, starting from the last play it saw. Everyone else rejoins with the new code and keeps their team."],timeout:["Call a timeout?",`Stops the clock. ${TEAMS[c.team]?TEAMS[c.team].name:""} will have ${S&&c.team?S.to[c.team]-1:0} left this half.`]};
  const [h,p]=msgs[c.what]||["Are you sure?",""];
  return `<div class="cover" role="dialog" aria-modal="true" aria-labelledby="cfh"><div class="inner modal"><h2 id="cfh">${h}</h2><p class="muted">${esc(p)}</p><div class="row"><button class="btn danger big" data-act="confirmyes">Yes, ${c.what==="timeout"?"call timeout":c.what==="newgame"?"restart":c.what==="takeover"?"take over":c.what}</button><button class="btn big" data-act="confirmno">No, go back</button></div></div></div>`;
}
function render(){ try{ render0(); }catch(e){ showCrash(e&&e.message); } }
function render0(){
  if(mode==="host"||mode==="local") keepAwake();
  if(S){ if(ui.lastPhase==="lobby"&&S.phase!=="lobby"&&ui.tab!=="tv") ui.tab="field"; ui.lastPhase=S.phase; }
  const y=window.scrollY; const active=document.activeElement&&document.activeElement.id; const val=active&&document.getElementById(active)?document.getElementById(active).value:null;
  let html="";
  if(mode==="none"||!S){ html=homeView(); if(mode!=="none"&&!S) html=headerBar()+`<div class="panel"><div class="wait">${esc(net.status||"Connecting…")}</div><button class="btn ghost" data-act="leavegame">Back</button></div>`; }
  else if(ui.tab==="tv") html=tvView();
  else {
    const t=ui.tab||"field"; let body="";
    if(t==="field") body=`${scoreboard()}${field()}${resultBanner()}${S.phase!=="lobby"&&!me()&&!isAdmin()&&!ui.spectator?joinBox():""}${ui.spectator&&S.phase!=="lobby"?"":turnPanel()}${S.phase!=="lobby"?logPanel():""}`;
    if(t==="book") body=playbookView();
    if(t==="team") body=S.phase==="lobby"?lobbyPanel():`${joinBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>`;
    if(t==="rules") body=rulesView();
    if(t==="admin"&&isAdmin()) body=adminView();
    html=`${headerBar()}${body}<div class="row" style="justify-content:center"><button class="btn ghost small" data-act="leavegame">Leave game</button></div>${tabs()}`;
  }
  app.innerHTML=html+confirmModal();
  document.body.classList.toggle("tvmode",ui.tab==="tv");
  if(active&&document.getElementById(active)&&val!=null){ const el=document.getElementById(active); el.value=val; el.focus(); }
  window.scrollTo(0,y); drawQR();
}
function logPanel(){
  return `<details class="panel" ${ui.logOpen?"open":""} id="logd"><summary>Play-by-play</summary><div class="log">${S.log.map(l=>`<div class="${l.t==="KC"?"k":l.t==="PHI"?"p":""}"><span class="tag">${l.q>S.nq?"OT":"Q"+l.q}</span> ${esc(l.x)}</div>`).join("")||'<div class="muted">No plays yet.</div>'}</div></details>`;
}
function localGet(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
function localSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }

// ---------- Events ----------
app.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b||b.disabled) return;
  const A=b.dataset.act;
  if(A==="qrbig"){ showBigQR(); return; }
  if(A==="send"){ let a; try{a=JSON.parse(b.dataset.a);}catch(_){return;} if(a.type==="call"&&!a.play) return; if(a.type==="call"||a.type==="roll"){ ui.sel=null; ui.md={}; ui.onside=false; } if(a.type==="call") ui.tempo="normal"; act(a); return; }
  if(A==="pick"){ ui.sel={key:b.dataset.key,play:b.dataset.play}; render(); return; }
  if(A==="tempo"){ ui.tempo=b.dataset.k; render(); return; }
  if(A==="face"){ ui.md[b.dataset.k]=+b.dataset.v; render(); return; }
  if(A==="tab"){ ui.tab=b.dataset.t; window.scrollTo(0,0); render(); return; }
  if(A==="pb"){ ui.pbTeam=b.dataset.t; render(); return; }
  if(A==="pbdef"){ ui.pbDef=b.dataset.d; render(); return; }
  if(A==="pbsub"){ ui.pbSub=b.dataset.k; render(); return; }
  if(A==="pbclear"){ ui.pbHL=false; render(); return; }
  if(A==="lookup"){ const l=S&&S.last; if(l&&l.team){ ui.pbTeam=l.team; ui.pbDef=l.dk||"A"; const mm=me(); ui.pbSub=(mm&&mm.team&&mm.team!==l.team)?"def":"off"; ui.pbHL=true; } ui.tab="book"; window.scrollTo(0,0); render(); setTimeout(()=>{ const h=document.querySelector(".pd td.hi"); if(h) h.scrollIntoView({block:"center",inline:"center"}); },50); return; }
  if(A==="join"){ const n=(document.getElementById("pname")||{}).value||""; if(!n.trim()){ ui.err="Type your name first."; render(); return; } localSet("tb.name",n.trim()); ui.name=null; ui.spectator=false; act({type:"join",name:n.trim(),team:b.dataset.team}); return; }
  if(A==="confirm"){ ui.confirm={what:b.dataset.what,team:b.dataset.team,pid:b.dataset.pid}; render(); return; }
  if(A==="confirmno"){ ui.confirm=null; render(); return; }
  if(A==="confirmyes"){ const c=ui.confirm; ui.confirm=null;
    if(c.what==="newgame") act({type:"newgame"}); else if(c.what==="pause") act({type:"pause",on:true}); else if(c.what==="undo") act({type:"undo"}); else if(c.what==="kick") act({type:"kick",pid:c.pid}); else if(c.what==="timeout") act({type:"timeout",team:c.team}); else if(c.what==="takeover") takeOver();
    render(); return; }
  if(A==="host"){ const code=genCode(); hostPeer(code,false); ui.tab="team"; return; }
  if(A==="resume"){ S=loadHost(); hostPeer(S.code,true); ui.tab="field"; return; }
  if(A==="local"){ mode="local"; net.via=null; S=(()=>{const h=loadHost(); return h&&h.v===4&&h.code==="LOCAL"?h:null;})()||freshState("LOCAL"); S.admin=myId; saveHost(); ui.tab="team"; render(); return; }
  if(A==="joincode"){ const c=((document.getElementById("code")||{}).value||"").trim().toUpperCase(); if(c.length!==4){ ui.err="Enter the 4-letter game code."; render(); return; } ui.spectator=!!b.dataset.tv; ui.tab=ui.spectator?"tv":"team"; const h=loadHost(); if(h&&h.code===c&&h.admin===myId){ S=h; hostPeer(c,true); return; } joinPeer(c); return; }
  if(A==="leavegame"){ try{ if(net.peer) net.peer.destroy(); }catch(_){} net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null}; mode="none"; S=null; location.hash=""; render(); return; }
  if(A==="copy"){ const u=shareURL(); if(navigator.clipboard) navigator.clipboard.writeText(u).then(()=>{b.textContent="Copied";},()=>{b.textContent="Select the link above";}); return; }
  if(A==="tvopen"){ ui.tab="tv"; render(); return; }
});
app.addEventListener("change",e=>{
  if(e.target.id==="onside"){ ui.onside=e.target.checked; render(); }
  if(e.target.id==="manualdice"){ ui.manual=e.target.checked; ui.md={}; render(); }
  if(e.target.id==="nq"||e.target.id==="qmin"){ act({type:"settings",nq:+(document.getElementById("nq")||{}).value,qmin:+(document.getElementById("qmin")||{}).value}); }
});
app.addEventListener("input",e=>{ if(e.target.id==="pname") ui.name=e.target.value; if(e.target.id==="code") ui.code=e.target.value.toUpperCase(); });
app.addEventListener("toggle",e=>{ if(e.target.id==="logd") ui.logOpen=e.target.open; },true);

// ---------- Boot ----------
setTimeout(function boot(){
  if(hasClaude()){ initDb().then(()=>{ if(!net.db){ mode="none"; render(); } }); ui.tab="team"; }
  // Always-on host: open ?host=CODE&admin=NAME on a computer. It hosts game CODE and the player
  // who joins as NAME becomes the admin automatically.
  let qs=null; try{ qs=new URLSearchParams(location.search); }catch(e){}
  const hq=qs?(qs.get("host")||"").toUpperCase():"";
  if(!hasClaude() && /^[A-Z]{4}$/.test(hq)){
    const h=loadHost(); const same=!!(h&&h.code===hq&&h.v===4); if(same) S=h;
    hostPeer(hq,same); const an=(qs.get("admin")||"").trim().toLowerCase(); if(an&&S){ S.autoAdmin=an; saveHost(); }
    ui.tab=S&&S.phase!=="lobby"?"tv":"team"; render(); return;
  }
  const code=(location.hash||"").replace("#","").toUpperCase();
  if(!hasClaude() && /^[A-Z]{4}$/.test(code)){
    const h=loadHost();
    if(h&&h.code===code&&(h.admin===myId||h.host===myId)){ S=h; ui.tab="field"; hostPeer(code,true); return; }
    ui.code=code;
  }
  render();
},0);
window.__tb={handleAction,needs,resolvePending,freshState,get S(){return S;},whoFor,callerOf,rollerOf};
// ---------- Safety nets: crash screen, keep-awake, backups, leave warning ----------
function showCrash(msg){
  if(document.getElementById("crash")) return;
  const d=document.createElement("div"); d.id="crash"; d.className="cover";
  d.innerHTML=`<div class="inner modal"><h2>Something hiccuped</h2><p class="muted">The game is saved after every play. Reload to pick up where you left off.</p><p class="small muted" style="word-break:break-word">${esc(String(msg||"").slice(0,160))}</p><div class="row"><button class="btn primary big" id="crashreload">Reload</button><button class="btn big" id="crashkeep">Keep going</button></div></div>`;
  document.body.appendChild(d);
  d.querySelector("#crashreload").onclick=()=>{ try{ if(S&&(mode==="host"||mode==="local")) saveHost(); }catch(e){} location.reload(); };
  d.querySelector("#crashkeep").onclick=()=>d.remove();
}
window.addEventListener("error",e=>{ if(e&&e.filename&&/peerjs/.test(e.filename)) return; showCrash(e&&e.message); });
window.addEventListener("unhandledrejection",e=>{ const m=String(e&&e.reason&&(e.reason.message||e.reason)||""); if(/wake|peer|webrtc|ice|negotiat/i.test(m)) return; });
// Keep the hosting phone's screen on.
let wakeLock=null;
async function keepAwake(){ try{ if((mode==="host"||mode==="local")&&navigator.wakeLock&&!wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>{wakeLock=null;}); } }catch(e){ wakeLock=null; } }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"){ keepAwake(); if(mode==="host"&&net.peer&&net.peer.disconnected){ try{net.peer.reconnect();}catch(e){} } } });
// Warn before the host closes or leaves the page mid-game.
window.addEventListener("beforeunload",e=>{ if(mode==="host"&&S&&S.phase!=="lobby"&&S.phase!=="over"){ try{saveHost();}catch(_){} e.preventDefault(); e.returnValue=""; } });
// Every player's phone keeps a copy, so another phone can take over hosting.
const BKEY="turkeybowl57.backup";
function saveBackup(){ try{ if(S) localStorage.setItem(BKEY,JSON.stringify(S)); }catch(e){} }
function loadBackup(){ try{ const j=localStorage.getItem(BKEY); const b=j?JSON.parse(j):null; return b&&b.v===4?b:null; }catch(e){ return null; } }
function takeOver(){
  const b=loadBackup()||S; if(!b) return;
  const code=genCode(); const s=JSON.parse(JSON.stringify(b)); s.code=code; s.admin=myId; s.paused=false; delete s.prev;
  try{ if(net.peer) net.peer.destroy(); }catch(e){}
  net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null};
  S=s; addLog(S,null,"A new phone took over hosting. Rejoin with code "+code+"."); saveHost(); hostPeer(code,true); ui.tab="admin"; render();
}
// Installable app: cache the game so a Wi-Fi blip can't stop it from loading.
if("serviceWorker" in navigator && location.protocol==="https:"){ window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
})();
