const
  assert = require('assert'),
  C = require('./constants.js'),
  militaryTime = require('./utils/militaryTime.js'),
  utils = require('./utils/utils.js');

//Apparently if you have day == 'Not scheduled' || day == "Varies" then the time and loc are empty strings(unless loc == Online in rare case)
//Unless!, there is two locs in which case if you split by \n you wont get an empty string for the 2nd loc/time 
//Can have time == "To be arranged" when not scheduled, but if \n in time then to be arranged can be one of two and day is just the one day string no \n

//IN:  
//  ld- a object that signifies either a lecture or discussion
//  clsId - referencing cls object in other class db
//  lecture- bool whether passed unit is a lecture
//return: array of l/d, usually 1 
function parseLD(ld, classId, isLecture) {
  let lds = [];

  const locs = ld.loc.split("\n");
  const times = ld.time.split("\n");
  const days = ld.day.split("\n");
  if(locs.length != times.length) {
    console.log("Special Case", ld);
  }
  for (let i = 0; i < locs.length; i++) {
    let day = days[i].trim();
    if(day == 'Not scheduled' || day == "Varies") {
      continue;
    }
    
    let loc = locs[i].trim();
    assert(times[i] != undefined, "times[i] != undefined");
    let timeObj = militaryTime.parseTime(times[i]);
    let newLd = Object.assign({}, ld, timeObj, {loc, day, classId, isLecture}); //{} first creates new Object
    delete newLd.time;
    lds.push(newLd);
  }
  
  return lds;
}

//Makes copies of cls and discs and returns a new cls 
function combineClsAndDisc(clsOrig, discs) {
  let cls = Object.assign({}, clsOrig);
  cls.discussions = [];
  discs.forEach((discOrig) => {
    let disc = Object.assign({}, discOrig);
    transformDisc(disc);
    cls.discussions.push(disc);
  });
  return cls;
}

function transformDisc(disc) {
  delete disc.className;
  delete disc.subject;
  delete disc.subjectAbbr;
}

async function parseData() {
  const secrets = await utils.readSecrets();
  const rawDB = await utils.connectToDB(secrets, C.RAW_CLASSES_DB);
  const subjectData = await rawDB.find().toArray();
  const classDB = await utils.connectToDB(secrets, C.CLASSES_DB);
  const lecDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);

  for (let subject of subjectData) {
    if (subject.data === undefined) {
      return;
    }

    for (let clsData of subject.data) {
      //Adds discussion to their class
      let cls = combineClsAndDisc(clsData.lecture, clsData.discussions);
      const clsId = (await classDB.insertOne(cls)).insertedId;
      
      //Creates mass of both lectures and discussions that actually meet
      const parsedLecs = parseLD(clsData.lecture, clsId, true);
      for(let lec of parsedLecs) { //need to insertOne because will crash if you insert an empty array :(
        await lecDiscDB.insertOne(lec); 
      }
      for (let dis of clsData.discussions) {
        const parsedDis = parseLD(dis, clsId, false);
        for(d of parsedDis) {
          await lecDiscDB.insertOne(d);
        }
      }
    }
  }
}

parseData().then(() => {
  console.log("DONE");
}).catch( (fromReject) => {
  console.log("ERR" + fromReject);
});