// Filename: express.js  
// Timestamp: 2017.10.22-21:39:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const express = require('express'),
      http = require('http'),
      port = 4343,
      app = express();

app.use('/readyaim/', express.static(__dirname + '/docs'));

http.createServer(app).listen(port);

console.log(`[...] localhost:${port}/readyaim/`);
