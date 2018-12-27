const
  C = require('../constants.js'),
  ObjectID = require('mongodb').ObjectID,
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils/utils.js');

const CLASS_BASE_URL = "https://sa.ucla.edu/ro/Public/SOC/Results";
//?t=19W&sBy=subject&sName=Asian&subj=ASIAN&crsCatlg=Enter+a+Catalog+Number+or+Class+Title+%28Optional%29&catlg=&cls_no=&btnIsInIndex=btn_inIndex

module.exports = class Classes extends Scrapper {
  constructor(headless, secrets, key) {
    super(headless, secrets, key);
    this.classes = [];
    this.discussions = [];
  }
  
  async scrape() {
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
    console.log(url);
    return {"url": url};
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
    
    //replace subj with in () if needed
    let subMatch = subj.match(/\(.*\)/);
    if (subMatch !== null) {
      subj = subMatch[0]; //get match
      subj = subj.slice(1, subj.length-1); //remove ( and )
    }
    
    return subj;
  }
}