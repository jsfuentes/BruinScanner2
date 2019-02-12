const
  assert = require('assert');
  
function toMilitaryTime(h, period) {
  if(h == "12" && period == "am") {
    h = "00";
  } else if (h == "12" && period == 'pm') {
    h = "12";
  } else if (period == 'pm') {
    let hInt = parseInt(h) + 12;
    h = hInt.toString();
  }
  return h;
}

//IN: moment like "7:45am" or "10:50am" or "1pm"
//OUT: military time string like 0745, 1050, 1300
function parseMoment(moment) {
  let hour;
  let min = "00";
  //if it has a colon in form 10:45am
  if(moment.indexOf(':') != -1) {
    const parts = moment.split(":");
    assert(parts[1].length == 4, "parts[1].length == 4; Timestamp cant be parsed");
    min = parts[1].slice(0, 2);
    const period = parts[1].slice(2); //'am' or 'pm'
    
    hour = parts[0];
    hour = toMilitaryTime(hour, period);
  } else { //if it has no colon in form 9am
    const digitRe = /[0-9]/;
    let curNum = "";
    let period;
    for(let i = 0; i < moment.length; i++) {
      if(digitRe.test(moment[i])) {
        curNum += moment[i]
      } else { //stop when you hit a or p
        period = moment.slice(i);
        break;
      }
    }
    
    hour = curNum;
    hour = toMilitaryTime(hour, period);
  }
  return hour.padStart(2, '0') + min.padStart(2, '0');
}

// IN: ts-"7:45am-10:50am", "1pm-1:50pm"
//OUT: {startTime: 0745, endTime: 1050}, {startTime: 1300, endTime: 1350} 
function parseTime(ts) {
  let moments = ts.split("-");
  assert(moments.length == 2, "LINE: moments.length == 2; Timestamp cant be parsed");
  let startTime = parseMoment(moments[0]);
  let endTime = parseMoment(moments[1]);
  return {startTime, endTime};
}

module.exports = {parseTime, parseMoment, toMilitaryTime};
