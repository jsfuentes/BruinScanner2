const
  C = require('./constants.js'),
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  UCLABase = require('./scrappers/UCLABase.js'),
  utils = require('./utils/utils.js');

async function subjects(db, secrets, headless=true) {
  const uclaBase = new UCLABase(headless, secrets);
  const subjects = await uclaBase.scrape();
  await db.insertOne(subjects);
}

//SAMPLE USAGE OF JScrape
async function main(headless=true) {
  const secrets = await utils.readSecrets(); 
  const subjectsDB = await utils.connectToDB(secrets, C.SUBJECTS_DB);
  
  // await subjectsDB.find()
  await subjects(subjectsDB, secrets, headless);
  
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
