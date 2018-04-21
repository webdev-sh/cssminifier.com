// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// core
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const md5File = require('md5-file')

// npm
const redis = require('redis')
const LogFmtr = require('logfmtr')

// local
const constants = require('./constants.js')
const log = require('./log.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

const isProd = process.env.NODE_ENV === 'production'

const oneMinInSecs        = 60 // in seconds
const oneHourInSecs       = 24 * 60 * 60 // in seconds
const oneDayInSecs        = 24 * 60 * 60 // in seconds
const halfDayInSecs       = oneDayInSecs / 2 // in seconds
const blockTimeInSecs     = isProd ? oneHourInSecs : oneMinInSecs
const cacheFileTimeInSecs = isProd ? halfDayInSecs : oneMinInSecs

const tenSecsInMs = 10 * 1000
const tenMinsInMs = 10 * 60 * 1000
const removeFileTimeInMs  = tenSecsInMs

// file/exec dirs and locations
var execFile = childProcess.execFile;
var libDir = constants.cacheDir
var execCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'cleancss')
var execOpts = {
  timeout : 10 * 1000, // 10 seconds
}

// redis
var client = redis.createClient()
client.on("error", err => {
  console.log("Redis Error: " + err)
})

// --------------------------------------------------------------------------------------------------------------------
// functions

function removeFile(filename) {
  console.log('Removing ' + filename + ' soon!')
  // remove this file in 10s
  setTimeout(() => {
    fs.unlink(filename, err => {
      if (err) return console.error('Error removing file:', err)
      console.log('File removed: ' + filename)
    })
  }, removeFileTimeInMs)
}

// minify() swallows errors with the CSS, but returns errors with the program (reading or writing files)
function minify(rid, css, callback) {
  // Here, there are three things to do:
  // 1. Write the file to the filesystem
  // 2. Call cleanCss to minify the input to the output (the cleanCss command will write the output file)
  // 3. Read the output file for return to the user

  // write this input to a file
  var orgFilename = path.join(libDir, rid + '.css')

  fs.writeFile(orgFilename, css, (err) => {
    if (err) return callback(err)

    // do an MD5 of the file so we can check if we've done it before
    md5File(orgFilename, (err, hash) => {
      if (err) return console.error('Error doing MD5 hash: ', err)
      console.log('md5=' + hash)

      // create the minified file's location
      var minFilename = path.join(libDir, '/' + hash + '.min.css')

      // see if a `cssminifier:hash:${hash}` key exists, and re-use that file to send, instead of doing the minification
      const hashKey = `cssminifier:hash:${hash}`
      client.get(hashKey, (err, result) => {
        console.log('get hashKey:', err, result)

        // yes, this file still exists
        if ( result ) {
          console.log('A cache file should already be there : ' + minFilename)

          // read the file back and return it to the caller
          fs.readFile(minFilename, (err, styles) => {
            if (err) return callback(err)

            // remove the original file some time, the cron job will tidy-up old minified files
            removeFile(orgFilename)

            // callback with the minified styles
            callback(null, styles)
          })

          // nothing more to do
          return
        }

        // Before doing the minification, check if we can set `file:hash` in Redis since that'll show us if either one is
        // in-progress, or if it is hanging around that it failed.
        const fileKey = `cssminifier:try:${hash}`
        client.set(fileKey, rid, 'EX', blockTimeInSecs, 'NX', (err, ok) => {
          if (err) return console.error('Redis.set failed :', err)
          console.log('Key set in Redis:', fileKey)

          // if the set failed, then we return that there is already one in progress
          if ( !ok ) {
            callback(null, '/* Error: Concurrent processing of the same file - try again later. */\n')
            removeFile(orgFilename)
            return
          }

          // cleancss -o outfile.min.css infile.css
          console.log('Performing minification on ' + orgFilename)
          var args = [ '--skip-import', '--output', minFilename, orgFilename ]
          var child = execFile(execCmd, args, execOpts, (err, stdout, stderr) => {
            // output this in dev, even prior to checking if there was an error
            if ( !isProd ) {
              console.log('-------------------------------------------------------------------------------')
              console.log(stdout)
              console.log('-------------------------------------------------------------------------------')
            }

            if (err) {
              process.stderr.write('' + err)
              console.log('err:', err)
              callback(null, '/* Error: Internal server error */\n')

              // since there was a problem minifying the file, leave the key in Redis

              return
            }

            // read the file back and return it to the caller
            fs.readFile(minFilename, (err, styles) => {
              if (err) return callback(err)

              // set a `hash:${hash}` key in Redis so we can re-send this file for future uploads of the same file
              client.set(hashKey, Date.now(), 'EX', cacheFileTimeInSecs, (err, result) => {
                console.log('set hashKey:', err, result)
              })

              // Remove the original file some time later.
              // The cron job will tidy-up old minified files every so often.
              removeFile(orgFilename)

              // and remove the fileKey from Redis, so the file can be reprocessed in the future
              client.del(fileKey, err => {
                if (err) return console.error('Error when removing fileKey from Redis:', err)
                console.log('Key deleted from Redis:', fileKey)
              })

              // callback with the minified styles
              callback(null, styles)
            })
          })
        })
      })
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = minify

// --------------------------------------------------------------------------------------------------------------------
