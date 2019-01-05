const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

const UCLA_LOGIN_URL = "https://be.my.ucla.edu/";
const STUDYLIST_URL = "https://be.my.ucla.edu/studylist.aspx";
module.exports = class Scrapper {  
  constructor(headless, secrets) {
    this.secrets = secrets;
    this.headless = headless;
  }
  
  async setup() {
    this.browser = await puppeteer.launch({headless: this.headless});
    this.page = await this.browser.newPage();
    //not sure if below works actually...
    await this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });
    this.page.setDefaultNavigationTimeout(30000); //increase timeout to 30 seconds
  }
  
  async waitUntilURLChanges(page, originalURL) {

  }
  
  async login() {
    const loginPage = await this.browser.newPage();

    await loginPage.goto(UCLA_LOGIN_URL);
    
    //wait for redirection
    let pageURL = await loginPage.url();
    while (pageURL == UCLA_LOGIN_URL) {
      await utils.delay(500);
      pageURL = await loginPage.url();
    }    
    pageURL = await loginPage.url();
    if (pageURL == STUDYLIST_URL) { //already logged in 
      return;
    }
    
    const usernameS = "#logon";
    await loginPage.waitForSelector(usernameS);
    await loginPage.type(usernameS, "jsjfuentes", {delay: 100});
    
    const passwordS = "#pass";
    await loginPage.type(passwordS, "[PASSWORD]", {delay: 100});
    
    const loginButtonS = "#sso > div > button";
    await loginPage.click(loginButtonS);

    const sendPushS = '.auth-button';
    await loginPage.waitForSelector(sendPushS);    
    await loginPage.click(sendPushS);
    
    //wait for login
    pageURL = await loginPage.url();
    while (pageURL != UCLA_LOGIN_URL) {
      await utils.delay(500);
      pageURL = await loginPage.url();
    }
  }
  
  async scrape() {
   throw new Error('You have to implement the method scrape!');
  }
  
  async close() {
    await this.browser.close();
  }
  
  async scrollPage() {
    await this.page.evaluate(_ => {
      window.scrollBy({left: 0, top: window.innerHeight, behavior: 'smooth'});
    });
  }
}

function main() {
  const test = new module.exports(false);
  test.setup().then(() => {
    test.login().then(() => {
      test.login(() => {
        console.log("COMPLETE");
      });
    });
  });
}

main();