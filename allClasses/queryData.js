const
  assert = require('assert'),
  C = require('./constants.js'),
  utils = require('./utils/utils.js');
  
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
  
  async function queryEmptyClassrooms(ts, day) {
    const secrets = await utils.readSecrets();
    const clsDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);
    
    const allMeets = await clsDiscDB.find().toArray();
    const allRooms = getClassrooms(allMeets);
    const nowMeets = await clsDiscDB.find(constructQuery(ts, day)).toArray();
    const nowRooms = getClassrooms(nowMeets);
    
    const roomDiff = [...allRooms].filter(x => !nowRooms.has(x)).sort();
    console.log(roomDiff);
    return roomDiff;
  }
    
  
mapRoomsToClasses().then(() => {
  console.log("DONE");
}); 