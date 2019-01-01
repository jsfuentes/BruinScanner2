const
  C = require('../constants.js'),
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils/utils.js');

const CLASS_BASE_URL = "https://sa.ucla.edu/ro/Public/SOC/Results";

module.exports = class Classes extends Scrapper {
  constructor(headless, secrets, subject) { //TODO: Add all option here or a specific class name
    super(headless, secrets, subject);
    this.classData = []; //array of dicts of lecture and discussions
  }
  
  //returns array of dicts of lecture and discussions
  async scrape() {
    const url = this.generateUrl();
    
    await this.setup();
    await this.page.goto(url);
    //TODO: check for url failure
    
    const pages = await this.page.$$('#divPagination > div > div > div:nth-child(2) > ul > li');
    if (pages.length == 0) { //no pagination div means there is just one page 
      await this.parsePage();
    } else { //handle multiple pages 
      for (let i = 0; i < pages.length; i++) {
          const pageDiv = pages[i];
          await Promise.all([
            pageDiv.click(),
            this.waitForNetworkIdle(this.page), //assumption page divs will be loaded after a sec of network idle 
          ]);
          await this.parsePage();
      }
    }
    
    return this.classData;
  }
  
  //only waits for expand page which only matters for first page
  async parsePage() {
    //TODO: find if the page has nothing
    const expandAllS = "#expandAll";
    await this.page.waitForSelector(expandAllS);
    await Promise.all([
      this.page.click(expandAllS),
      this.waitForNetworkIdle(this.page), // similar to 'networkidle0'
    ]);
    //assumption that all divs will be loaded after network idle for 1 second
    
    //get and parse each classBlock 
    const classBlockS = '.class-title';
    const classArr = await this.page.$$(classBlockS);
    for (let i = 0; i < classArr.length; i++) {
      const classBlock = classArr[i];
      await this.parseClassBlock(classBlock); //data added at lowest level of ft call
    }
  }
  
  //call parse each lecture block
  async parseClassBlock(classBlock) {
    const className = await this.page.evaluate(e => e.querySelector('a').textContent, classBlock);
    //TODO: add class filter right here to only get the class you want to scrape :O
    const lectureArr = await classBlock.$$('.primary-row');
    for (let i = 0; i < lectureArr.length; i++) {
      const lectureBlock = lectureArr[i];
      await this.parseLectureBlock(lectureBlock, className);
    }
  }
  
  //actually parsing of data
  async parseLectureBlock(lectureBlock, className) {
    const data = await this.page.evaluate((e) => {
      function extractInfo(divs) {
        const section = divs[1].innerText.trim();
        const status = divs[2].innerText.trim();
        const waitlist = divs[3].innerText.trim();
        const day = divs[5].innerText.trim();
        const time = divs[6].innerText.trim();
        const loc = divs[7].innerText.trim();
        const units = divs[8].innerText.trim();
        const instructor = divs[9].innerText.trim();
        
        return {section, status, waitlist, day, time, loc, units, instructor};
      }
      
      const lectureDivs = e.children;
      const lecture = extractInfo(lectureDivs);
      
      let discussions = [];
      //if there are discussions, parse them
      if (lectureDivs.length == 11) {
        const discussionDiv = lectureDivs[10];
        const discussionArr = discussionDiv.querySelectorAll('.class-info');
        for (let i = 0; i < discussionArr.length; i++) {
          const disDivs = discussionArr[i].children;
          const dis = extractInfo(disDivs);
          discussions.push(dis);
        }
      }

      return {lecture, discussions};
    }, lectureBlock);
    
    //add class name and subject to data
    const subject = this.key;
    const subjectAbbr = this.getSubjectAbbr(this.key);
    data['lecture'] = {...data['lecture'], className, subject, subjectAbbr}; 
    data['discussions'] = data['discussions'].map(dis => {return {...dis, className, subject, subjectAbbr}});
    
    this.classData.push(data);
  }
  
  generateUrl() {
    const params = {
      "t": C.TERM,
      "sBy": "subject",
      "sName": this.encodeSName(this.key),
      "subj": this.encodeSubj(this.key),
      "crsCatlg": "Enter+a+Catalog+Number+or+Class+Title+%28Optional%29",
      "catlg": "",
      "cls_no": "",
      "btnIsInIndex": "btn_inIndex",
    };
    const url = CLASS_BASE_URL + "?" + this.encodeQueryData(params);
    return url;
  }
  
  encodeQueryData(data) {
     const ret = [];
     for (let d in data)
       ret.push(d + '=' + data[d]);
     return ret.join('&');
  }

  encodeSName(subject) {
    let sName = subject;
    sName = sName.replace(/ /g, "+");
    sName = sName.replace(/\(/g, "%28");
    sName = sName.replace(/\)/g, "%29");
    return sName;
  }

  encodeSubj(subject) {
    let subj = subject;
    subj = subj.replace(/ /g, "+");
    //UCLA uses the subString in () if there is one, this does too
    subj = this.getSubjectAbbr(subj);
    return subj;
  }
  
  //return abbr of class (if no () then just return)
  getSubjectAbbr(subj) {
    let subMatch = subj.match(/\(.*\)/);
    if (subMatch !== null) {
      subj = subMatch[0]; //get match
      subj = subj.slice(1, subj.length-1); //remove ( and )
    }
    return subj;
  }
  
  //copied from stackoverflow
  waitForNetworkIdle(page, timeout=1000, maxInflightRequests = 0) {
    page.on('request', onRequestStarted);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);

    let inflight = 0;
    let fulfill;
    let promise = new Promise(x => fulfill = x);
    let timeoutId = setTimeout(onTimeoutDone, timeout);
    return promise;

    function onTimeoutDone() {
      page.removeListener('request', onRequestStarted);
      page.removeListener('requestfinished', onRequestFinished);
      page.removeListener('requestfailed', onRequestFinished);
      fulfill();
    }

    function onRequestStarted() {
      ++inflight;
      if (inflight > maxInflightRequests)
        clearTimeout(timeoutId);
    }
    
    function onRequestFinished() {
      if (inflight === 0)
        return;
      --inflight;
      if (inflight === maxInflightRequests)
        timeoutId = setTimeout(onTimeoutDone, timeout);
    }
  }
}



