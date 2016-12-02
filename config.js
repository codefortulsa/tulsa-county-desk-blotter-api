
var rc = require("rc");

module.exports = exports = rc("iic-api", {
    whitelist: [
      "127.0.0.1",
      "::1"
    ],
    port: 3030
  });
