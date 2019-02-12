const
  assert = require('assert'),
  C = require('./constants.js'),
  militaryTime = require('./utils/militaryTime.js'),
  utils = require('./utils/utils.js');

//IN:  
//  ld- a object that signifies either a lecture or discussion
//  lecture- bool whether passed unit is a lecture
//return: array of l/d, usually 1 
function parseLD(ld, isLecture) {
  let lds = [];

  const locs = ld.loc.split("\n");
  const times = ld.time.split("\n");
  assert(times.length >= locs.length, "times.length >= locs.length");
  for (let i = 0; i < locs.length; i++) {
    if(locs[i] === '') {
      continue;
    }
    let timeObj = militaryTime.parseTime(times[i]);
    let newLd = Object.assign({}, ld, timeObj, {loc: locs[i]}); //{} first creates new Object
    lds.push(newLd);
  }
  
  return lds;
}

//Makes copies of cls and discs and returns a new cls 
function combineClsAndDisc(cls, discs) {
  cls.discussions = [];
  discs.forEach((disc) => {
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
  subjectData = await rawDB.find().toArray();
  const classDB = await utils.connectToDB(secrets, C.CLASSES_DB);
  const lecDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);

  let test = 0;
  for (let subject of subjectData) {
    if(test < 27) {
      test += 1;
      continue;
    }
    
    if (subject.data === undefined) {
      return;
    }

    for (let clsData of subject.data) {
      //Creates mass of both lectures and discussions
      const parsedLecs = parseLD(clsData.lecture, true);
      for(lec of parsedLecs) { //need to insertOne because will crash if you insert an empty array :(
        await lecDiscDB.insertOne(lec); 
      }
      for (let dis of clsData.discussions) {
        const parsedDis = parseLD(dis, false);
        for(d of parsedDis) {
          await lecDiscDB.insertOne(d);
        }
      }

      //Adds discussion to their class
      let cls = combineClsAndDisc(clsData.lecture, clsData.discussions);
      await classDB.insertOne(cls);
    }
    break;
  }
}

parseData().then(() => {
  console.log("DONE");
}).catch( (fromReject) => {
  console.log("ERR" + fromReject);
});