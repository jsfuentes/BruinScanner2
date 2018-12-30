const
  conf = require('./config.js'),
  C = require('./constants.js'),
  utils = require('./utils/utils.js');
  
module.exports = class Jscrape {
  constructor(key, headless, secrets) {
    this.fails = {};
    this.wins = {};
    this.key = key;
    this.headless = headless;
    this.secrets = secrets;
    this.allInfo = {};
  }
  
  async scrape(toScrape=[C.SCRAPE_ALL]) {
    for(let i = 0; i < conf.SCRAPPERS.length; i++) {
      let scrapeDef = conf.SCRAPPERS[i];
      let scrapeName = scrapeDef[0];
      let scrapeClass = scrapeDef[1];
      let scrapeVersion = scrapeDef[2];
      
      //TODO: Find a way to do this in parallel with promises
      if(toScrape[0] === C.SCRAPE_ALL || toScrape.indexOf(scrapeName) != -1) {
        try {
          await this.getKeyInfo(scrapeName, scrapeClass, scrapeVersion);
        } catch (err) {
          console.log("Error scrapping", scrapeName, ":", err);
          console.log("Leaving browser open");
          return this.allInfo;
        }
      }
    }
    
    this.allInfo = {
      [C.CLASS_SUBJECT_KEY]: this.key,
      ...this.allInfo 
    }
    
    // console.log(this.allInfo);
    return this.allInfo;
  }
  
  //collects info ` `
  async getKeyInfo(scrapeName, scrapeClass, scrapeVersion) {
    const scrapper = new scrapeClass(this.headless, this.secrets[scrapeName], this.key);
    //TODO: Add date scrapped to dict
    let data = await scrapper.scrape();
    this.allInfo = {
      ...this.allInfo,
      data
    }
    await scrapper.close();
  }
  
}
