const
  C = require('./constants.js'),
  ClassScrapper = require('./scrappers/classes.js'); //SAMPLE
  
module.exports = {
  //Key(string name), the scrappers class, and the version
  SCRAPPERS: [
    [C.CLASSES, ClassScrapper, 1] //SAMPLE
  ]
};