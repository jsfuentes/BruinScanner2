const
  assert = require('assert'),
  C = require('./constants.js'),
  utils = require('./utils/utils.js');
  

  async function mapRoomsToClasses() {
    const secrets = await utils.readSecrets();
    const clsDiscDB = await utils.connectToDB(secrets, C.LECTURE_AND_DISCUSSION_DB);
    //TODO: This
  }
    
  
mapRoomsToClasses().then(() => {
  console.log("DONE");
}); 