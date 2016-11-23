var http = require('http');
var url = require('url');

module.exports = function(reportUrl) {
  return new Promise(function(resolve, reject) {
    http.get(url.parse(reportUrl), function(res) {
      var data = [];

      res.on('data', function(chunk) {
        data.push(chunk);
      }).on('end', function() {
        var buffer = Buffer.concat(data);
        resolve(buffer);
      });
    });
  });
}
