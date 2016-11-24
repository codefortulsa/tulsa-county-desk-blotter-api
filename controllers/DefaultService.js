'use strict';
const parser = require("./reportParser");
const loader = require("./reportLoader");
const blotterPageParser = require("./blotterPageParser");
const inmateBookingPageParser = require("./inmateBookingPageParser")

exports.deskBlotterGET = function(args, res, next) {
  res.setHeader('Content-Type', 'application/json');
  loader('http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf')
    .then(parser(blotterPageParser))
    .then(data => res.end(JSON.stringify(data)))
    .catch(err => res.end(JSON.stringify(err)));
}

exports.inmateBookingGET = function(args, res, next) {
  res.setHeader('Content-Type', 'application/json');
    loader('http://iic.tulsacounty.org/expInmateBookings/Export')
      .then(parser(inmateBookingPageParser))
      .then(data => res.end(JSON.stringify(data)))
      .catch(err => res.end(JSON.stringify(err)));
}
