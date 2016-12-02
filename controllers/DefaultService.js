'use strict';
const parser = require("./reportParser");
const loader = require("./reportLoader");
const getRequestIP = require( 'get-request-ip' );
const config = require('../config.js');
const blotterPageParser = require("./blotterPageParser");
const inmateBookingPageParser = require("./inmateBookingPageParser")

exports.deskBlotterGET = function(args, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var scrub = config.scrubData && config.whitelist.every(x => !getRequestIP(req, {
        headers: []
    }).endsWith(x)));

  loader('http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf')
    .then(parser(blotterPageParser(scrub)))
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => res.end(JSON.stringify(err)));
}

exports.inmateBookingGET = function(args, req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var scrub = config.scrubData && config.whitelist.every(x => !getRequestIP(req, {
        headers: []
    }).endsWith(x)));

  loader('http://iic.tulsacounty.org/expInmateBookings/Export')
    .then(parser(inmateBookingPageParser(scrub)))
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => res.end(JSON.stringify(err)));
}
