// Filename: express.js  
// Timestamp: 2017.09.28-00:44:05 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var express = require('express'),
    http = require('http'),
    port = 4343,
    app = express();

app.use('/', express.static(__dirname + '/docs'));

http.createServer(app).listen(port);

console.log(`[...] localhost:${port}`);
