const
  C = require('../constants.js'),
  ClassScrapper = require('./scrappers/classes.js'),
  SubjectScrapper = require('./scrappers/subjects.js'),
  assert = require('assert'),
  utils = require('../utils.js');

async function getSubjects(secrets, headless = true) {
  const db = await utils.connectToDB(secrets, C.SUBJECTS_DB);

  let arr = await db.find().toArray();
  if (arr.length === 0) { //scrape if not already in db
    const subjectScrapper = new SubjectScrapper(headless, secrets);
    const subjects = await subjectScrapper.scrape();
    await db.insertOne(subjects);
    await subjectScrapper.close();
    arr = await db.find().toArray();
  }
  assert(arr.length !== 0);

  const subjects = arr[0][C.SUBJECTS_KEY];
  return subjects;
}

async function getClasses(headless, secrets, subject) {
  const scrapper = new ClassScrapper(headless, secrets, subject);
  //TODO: Add date scrapped to dict
  let data = await scrapper.scrape();
  await scrapper.close();
  if (Object.keys(data).length === 0) { //check if dictionary is empty 
    return null;
  }
  const date = new Date(); //get current date
  data = {
    [C.CLASS_SUBJECT_KEY]: subject, 
    "ds": date.toISOString(),
    ...data
  }

  return data;
}

async function main(headless = true) {
  const secrets = await utils.readSecrets();
  const subjects = await getSubjects(secrets, headless);
  const classDB = await utils.connectToDB(secrets, C.RAW_CLASSES_DB);
  
  for (let i = 0; i < subjects.length; i++) {
    subject = subjects[i];
    console.log("Scraping", subject);

    let subjectDocs = await classDB.find({
      [C.CLASS_SUBJECT_KEY]: subject
    }).toArray();
    if (subjectDocs.length == 0) { //TODO: check version number too
      try {
        const data = await getClasses(headless, secrets, subject);
        if (data !== null) {
          await classDB.insertOne(data);
        }
      } catch (err) {
        console.log("Failed to scrape", subject, "with", err);
      }

      await utils.randomDelay();
    }
  }

}

main()
  .then(() => {
    console.log("COMPLETE");
    // process.exit();
  })
  .catch(console.error);