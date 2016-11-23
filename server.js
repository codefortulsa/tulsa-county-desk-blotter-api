const http = require("http");
const parser = require("./reportParser");
const loader = require("./reportLoader");
const blotterPageParser = require("./blotterPageParser");
const inmateBookingPageParser = require("./inmateBookingPageParser")
var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});

  if(req.url == '/deskBlotter?type=json' || req.url == '/deskBlotter') {
    loader('http://iic.tulsacounty.org/srsreports/Desk%20Blotter.pdf')
      .then(parser(blotterPageParser))
      .then(data => res.end(JSON.stringify(data)))
      .catch(err => res.end(JSON.stringify(err)));
    return;
  }

  if(req.url == '/inmateBooking?type=json' || req.url == '/inmateBooking') {
    loader('http://iic.tulsacounty.org/expInmateBookings/Export')
      .then(parser(inmateBookingPageParser))
      .then(data => res.end(JSON.stringify(data)))
      .catch(err => res.end(JSON.stringify(err)));
    return;
  }

  res.end(JSON.stringify({errorMessage: "Invalid request"}));
});

server.listen(3030);
