const
  C = require('./constants.js'),
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  SubjectScrapper = require('./scrappers/subjects.js'),
  assert = require('assert'),
  utils = require('./utils/utils.js');

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
        const jscrape = new Jscrape(subject, headless, secrets);
        const data = await jscrape.scrape();
        if (data !== {}) {
          await classDB.insertOne(data);
        }
      } catch (err) {
        console.log("Failed to scrape", subject, "with", err);
      }

      await utils.randomDelay();
      await utils.randomDelay();
    }
  }

}

main(false)
  .then(() => {
    console.log("COMPLETE");
    // process.exit();
  })
  .catch(console.error);