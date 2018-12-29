const
  C = require('../constants.js'),
  ObjectID = require('mongodb').ObjectID,
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils/utils.js');

const CLASS_BASE_URL = "https://sa.ucla.edu/ro/Public/SOC/Results";

module.exports = class Classes extends Scrapper {
  constructor(headless, secrets, key) {
    super(headless, secrets, key);
    this.classes = [];
    this.discussions = [];
  }
  
  async scrape() {
    const url = this.generateUrl();
    
    await this.setup();
    await this.page.goto(url);

    const expandAllS = "#expandAll";
    await this.page.waitForSelector(expandAllS);
    await Promise.all([
      this.page.click(expandAllS),
      this.waitForNetworkIdle(this.page), // similar to 'networkidle0'
    ]);
    console.log("Network Finished"); //assumption that all divs will be loaded after network idle for 1 second
    
    // //click needed classes
    // const classBlockS = '.head > a';
    // await this.page.waitForSelector(classBlockS);
    // const classArr = await this.page.$$(classBlockS);
    // for (let i = 0; i < classArr.length; i++) {
    //   const curClassNode = classArr[i];
    //   const title = await this.page.evaluate(e => e.textContent, curClassNode);
    //   // Example
    // 
    // }
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



