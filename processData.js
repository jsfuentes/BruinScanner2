const
  C = require('./constants.js'),
  utils = require('./utils/utils.js');

async main() {
  const rawClassDB = await utils.connectToDB(secrets, C.RAW_CLASSES_DB);
  const classDB = await utils.connectToDB(secrets, C.PROCESSED_CLASSES_DB);
  
  //get all the different ways something looks 
  //create ObjectID
  
  // "subject": "African American Studies (AF AMER)",
  // "data": [
  //     {
  //         "lecture": {
  //             "section": "Lec 1",
  //             "status": "Open\n196 of 216 Enrolled\n20 Spots Left",
  //             "waitlist": "No Waitlist",
  //             "day": "MW",
  //             "time": "2pm-3:50pm",
  //             "loc": "Haines Hall 39",
  //             "units": "5.0",
  //             "instructor": "Lacayo, C.O.",
  //             "className": "M5 - Social Organization of Black Communities",
  //             "subject": "African American Studies (AF AMER)",
  //             "subjectAbbr": "AF AMER"
  //         },
  //         "discussions": [
  //             {
  //                 "section": "Dis 1A",
  //                 "status": "Open\n14 of 18 Enrolled\n4 Spots Left",
  //                 "waitlist": "No Waitlist",
  //                 "day": "M",
  //                 "time": "8am-8:50am",
  //                 "loc": "Rolfe Hall 3129",
  //                 "units": "0.0",
  //                 "instructor": "Mitchell, E.J.",
  //                 "className": "M5 - Social Organization of Black Communities",
  //                 "subject": "African American Studies (AF AMER)",
  //                 "subjectAbbr": "AF AMER"
  //             },
}

