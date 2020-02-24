// ----------------------------------------------------------------------------

"use strict"

// core
const http = require('http')

// local
const pkg = require('./lib/pkg.js')
const log = require('./lib/log.js')
const app = require('./lib/app.js')

// ----------------------------------------------------------------------------
// setup

process.title = pkg.name

// every so often, print memory usage
var memUsageEverySecs = process.env.NODE_ENV === 'production' ? 10 * 60 : 30
setInterval(() => {
  log.withFields(process.memoryUsage()).debug('memory')
}, memUsageEverySecs * 1000)

// ----------------------------------------------------------------------------
// server

const server = http.createServer()
server.on('request', app)

const port = process.env.PORT || 8011
server.listen(port, () => {
  log.withFields({ port }).info('server-started')
})

process.on('SIGTERM', () => {
  log.info('sigterm')
  server.close(() => {
    log.info('exiting')
    process.exit(0)
  })
})

// ----------------------------------------------------------------------------
