// Filename: express.js  
// Timestamp: 2017.10.22-21:39:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import express from 'express'
import http from 'http'

const port = 4343
const app = express()

app.use('/readyaim/', express.static(import.meta.dirname + '/docs'))

http.createServer(app).listen(port)

console.log(`[...] localhost:${port}/readyaim/`)
