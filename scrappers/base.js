const
  puppeteer = require('puppeteer');
    
module.exports = class Scrapper {
  constructor(headless, secrets, key=null) {
    this.secrets = secrets;
    this.headless = headless;
    this.key = key;
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