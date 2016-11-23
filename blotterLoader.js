var http = require('http');
var url = require('url');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    http.get(url.parse('http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf'), function(res) {
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
