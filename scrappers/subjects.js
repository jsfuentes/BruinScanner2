const
  C = require('../constants.js'),
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils/utils.js');

const UCLA_CLASS_SCHEDULE_URL = "https://sa.ucla.edu/ro/public/soc";

module.exports = class SubjectScrapper extends Scrapper {
  constructor(headless, secrets, key=null) {
    super(headless, secrets, key);
  }
  
  async scrape() {
    await this.setup();
    await this.page.goto(UCLA_CLASS_SCHEDULE_URL);
    
    const classSearchS = '#select_filter_subject';
    await this.page.waitForSelector(classSearchS);
    await this.page.click(classSearchS);
    
    await this.page.waitForSelector('#ui-id-1 > li:nth-child(1)');
    //get all subjects
    const subjects = await this.page.evaluate(() => {
      const subjects = [];
      const listOfSubjects = document.querySelectorAll('#ui-id-1 > li');
      for(let i = 0; i < listOfSubjects.length; i++) {
        let subjectLi = listOfSubjects[i];
        let subject = subjectLi.textContent;
        subjects.push(subject);
      }
      
      return subjects;
    });
      
    return {[C.SUBJECTS_KEY]: subjects};
  }
}