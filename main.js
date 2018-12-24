const
  C = require('./constants.js'),
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  UCLABase = require('./scrappers/UCLABase.js'),
  assert = require('assert'),
  utils = require('./utils/utils.js');

async function getSubjects(db, secrets, headless=true) {
  const uclaBase = new UCLABase(headless, secrets);
  const subjects = await uclaBase.scrape();
  await db.insertOne(subjects);
  await uclaBase.close();
}

async function main(headless=true) {
  const secrets = await utils.readSecrets(); 
  const subjectsDB = await utils.connectToDB(secrets, C.SUBJECTS_DB);
  
  let subjectsArr = await subjectsDB.find().toArray()
  if (subjectsArr.length === 0 ) {
    await getSubjects(subjectsDB, secrets, headless);
    subjectsArr = await subjectsDB.find().toArray();
  }
  assert(subjectsArr.length !== 0);
  const subjects = subjectsArr[0][C.SUBJECTS_KEY];
  
  // keysToScrape = ["goguardian", "nuro"];
  // for (let i = 0; i < keysToScrape.length; i++) {
  //   company = keysToScrape[i];
  //   console.log("Scraping", company);
  // 
  //   let companyDocs = await dbData.find({"company": company}).toArray();
  //   if(companyDocs.length == 0) {
  //     try {
  //       const jscrape = new Jscrape(company, headless, secrets);
  //       const data = await jscrape.getkeyInfo();
  //       await dbData.insertOne(data);
  //     } catch (err) {
  //       console.log("Failed to scrape", company, "with", err);
  //     }
  // 
  //     await utils.randomDelay();
  //     await utils.randomDelay();
  //   }
  // }

}

main(false)
  .then(() => {
    console.log("COMPLETE"); 
    // process.exit();
  })
  .catch(console.error);
