'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.deskBlotterGET = function deskBlotterGET (req, res, next) {
  Default.deskBlotterGET(req.swagger.params, res, next);
};

module.exports.inmateBookingGET = function inmateBookingGET (req, res, next) {
  Default.inmateBookingGET(req.swagger.params, res, next);
};
