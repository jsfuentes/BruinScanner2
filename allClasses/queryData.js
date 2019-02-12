const
  assert = require('assert'),
  C = require('./constants.js'),
  utils = require('./utils/utils.js');
  
const ts = "1000";
const day = "T";
const classroom = "Boelter Hall 5422";
  
  function constructQuery(ts, day) {
    return {startTime: {$lte: ts}, endTime: {$gte: ts}, day: {$regex: ".*" + day + ".*"}};
  }

  function getClassrooms(meets) {
    let classrooms = new Set();
    for(meet of meets) {
      classrooms.add(meet.loc);
    }
    return classrooms;
  }
  
  //IN: ts in military 4 letter string, day is one char from "MTWRF"
  //OUT: sorted list of empty classrooms
  async function queryEmptyClassrooms(ts, day) {
    const secrets = await utils.readSecrets();
    const clsDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);
    
    const allMeets = await clsDiscDB.find().toArray();
    const allRooms = getClassrooms(allMeets);
    const nowMeets = await clsDiscDB.find(constructQuery(ts, day)).toArray();
    const nowRooms = getClassrooms(nowMeets);
    
    const roomDiff = [...allRooms].filter(x => !nowRooms.has(x)).sort();
    return roomDiff;
  }
  
  //takes a classroom and outputs when it will be used next
  async function nextClass(ts, day, classroom) {
    const secrets = await utils.readSecrets();
    const clsDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);
    
    const nextQuery = {startTime: {$gte: ts}, day: {$regex: ".*" + day + ".*"}, loc: classroom};
    const allMeets = await clsDiscDB.find(nextQuery).toArray();
    let minTime = null;
    let minClass = null;
    for(let meet of allMeets) {
      if(minTime === null || meet.startTime < minTime) {
        minTime = meet.startTime;
        minClass = meet;
      }
    }
    return minClass;
  }
  
  //IN: ts in military 4 letter string, day is one char from "MTWRF"
  //OUT: sorted list of classNames 
  async function queryClasses(ts, day) {
    const secrets = await utils.readSecrets();
    const clsDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);
    const classDB = await utils.connectToDB(secrets, C.CLASSES_DB);

    const query = Object.assign(constructQuery(ts, day), {isLecture: true});
    const nowMeets = await clsDiscDB.find(query).toArray();
    let clss = [];
    for(let meet of nowMeets) {
      const cls = await classDB.findOne({_id: meet.classId});
      clss.push(cls.subjectAbbr + " " + cls.className);
    }
    //TODO: sort by closest start time
    console.log(clss.length);
    console.log(clss.sort());
    return clss.sort();
  }
  
queryEmptyClassrooms(ts, day).then((e) => {
  console.log(e);
  console.log("DONE");
}).catch( (fromReject) => {
  console.log("ERR" + fromReject);
});
    
// queryClasses(ts, day).then((e) => {
//   console.log(e);
//   console.log("DONE");
// }).catch( (fromReject) => {
//   console.log("ERR" + fromReject);
// });
  
// nextClass(ts, day, classroom).then((e) => {
//   console.log(e);
//   console.log("DONE");
// }).catch( (fromReject) => {
//   console.log("ERR" + fromReject);
// });