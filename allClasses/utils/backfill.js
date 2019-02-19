const
  C = require('../constants.js'),
  utils = require('../../utils.js'),
  jscrape = require('./scrape.js');

///////////////////////
//EDIT updateDoc to determine how to update
//////////////////////
function updateDoc(d) {
  const date = new Date(); //get current date
  d["ds"] = date.toISOString();
  return d;
}

async function testBackfill(key) {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToDB(secrets, C.RAW_CLASSES_DB);
  
  const query = {[C.CLASS_SUBJECT_KEY]: key};
  let keyDoc = await dbData.find(query).toArray();
  console.log(keyDoc);
  keyDoc.forEach((d) => {
    const newDoc = updateDoc(d);
    dbData.updateOne(query, {$set: newDoc});
  });
  
  console.log("Backfill of", key, "complete");
}

async function backfillAll() {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToDB(secrets, C.RAW_CLASSES_DB);
  // const dbSanitizedData = await utils.connectToSanitizedData(secrets);
  
  let keyDoc = await dbData.find().toArray();
  keyDoc.forEach((d) => {
    const query = {[C.CLASS_SUBJECT_KEY]: d[C.CLASS_SUBJECT_KEY]};
    const newDoc = updateDoc(d);
    dbData.updateOne(query, {$set: newDoc});
  });
  
  console.log("Backfill All complete");
}

backfillAll();