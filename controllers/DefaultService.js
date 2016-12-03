'use strict';
const parser = require("./reportParser");
const loader = require("./reportLoader");
const getRequestIP = require( 'get-request-ip' );
const config = require('../config.js');
const blotterPageParser = require("./blotterPageParser");
const inmateBookingPageParser = require("./inmateBookingPageParser");
const fs = require("fs");


exports.deskBlotterGET = function(args, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var scrub = config.whitelist.every(x => !getRequestIP(req, {
        headers: []
    }).endsWith(x));


  try{
    var stat = fs.statSync("cache/cachedDeskBlotterResults" + scrub + ".json");
    var ctime = new Date(stat.ctime);
    var now = new Date();

    if((now - ctime) > 3600000) {
      console.log("old file.");
      fs.unlinkSync("cache/cachedDeskBlotterResults" + scrub + ".json")
    }
    else {
      fs.readFile("cache/cachedDeskBlotterResults" + scrub + ".json", (err, data) => res.end(data));
      return;
    }
  }
  catch(e) {
    //...
  }

  loader('http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf')
    .then(parser(blotterPageParser(scrub)))
    .then(data => {fs.writeFileSync("cache/cachedDeskBlotterResults" + scrub + ".json", JSON.stringify(data)); return data; })
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => res.end(JSON.stringify(err)));
}

exports.inmateBookingGET = function(args, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var scrub = config.whitelist.every(x => !getRequestIP(req, {
        headers: []
    }).endsWith(x));


  try{
    var stat = fs.statSync("cache/cacheInmateBookingResults" + scrub + ".json");
    var ctime = new Date(stat.ctime);
    var now = new Date();

    if((now - ctime) > 3600000) {
      fs.unlinkSync("cache/cacheInmateBookingResults" + scrub + ".json")
    }
    else {
      fs.readFile("cache/cacheInmateBookingResults" + scrub + ".json", (err, data) => res.end(data));
      return;
    }
  }
  catch(e) {
    //...
  }

  loader('http://iic.tulsacounty.org/expInmateBookings/Export')
    .then(parser(inmateBookingPageParser(scrub)))
    .then(data => {fs.writeFileSync("cache/cacheInmateBookingResults" + scrub + ".json", JSON.stringify(data)); return data; })
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => res.end(JSON.stringify(err)));
}
