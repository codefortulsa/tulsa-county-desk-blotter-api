
var rc = require("rc");

module.exports = exports = rc("iic-api", {
    scrubData: true,
    whitelist: [
      "127.0.0.1",
      "::1"
    ]
  });
