var http = require("http");
var parser = require("./blotterParser");
var loader = require("./blotterLoader");

var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "application/json"});
  if(req.url == '/deskBlotter?type=json' || req.url == '/deskBlotter') {
    loader().then(parser).then(data => res.end(JSON.stringify(data)));
    return;
  }
  res.end(JSON.stringify({errorMessage: "Invalid request"}));
});

server.listen(3030);
