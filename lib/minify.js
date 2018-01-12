// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// core
var fs = require('fs')
var path = require('path')
var childProcess = require('child_process')
const md5File = require('md5-file')

// npm
var redis = require('redis')

// --------------------------------------------------------------------------------------------------------------------
// setup

const oneMinInSecs = 60 // in seconds
const oneHourInSecs = 24 * 60 * 60 // in seconds
const oneDayInSecs = 24 * 60 * 60 // in seconds
const blockTimeInSecs = process.env.NODE_ENV === 'production' ? oneDayInSecs : oneMinInSecs

// file/exec dirs and locations
var execFile = childProcess.execFile;
var libDir = '/var/lib/com-cssminifier'
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
  // remove this file in 10s
  setTimeout(() => {
    fs.unlink(filename, err => {
      if (err) return console.error('Error removing file:', err)
      console.log('File removed: ' + filename)
    })
  }, 10 * 1000)
}

// minify() swallows errors with the CSS, but returns errors with the program (reading or writing files)
function minify(rid, css, callback) {
  // Here, there are three things to do:
  // 1. Write the file to the filesystem
  // 2. Call cleanCss to minify the input to the output (the cleanCss command will write the output file)
  // 3. Read the output file for return to the user

  // write this input to a file
  var orgFilename = path.join(libDir, rid + '.css')
  var minFilename = path.join(libDir, '/' + rid + '.min.css')

  fs.writeFile(orgFilename, css, (err) => {
    if (err) return callback(err)

    // do an MD5 of the file so we can check if we've done it before
    md5File(orgFilename, (err, hash) => {
      if (err) return console.error('Error doing MD5 hash: ', err)
      console.log('md5=' + hash)

      // Before doing the minification, check if we can set `file:hash` in Redis since that'll show us if either one is
      // in-progress, or if it is hanging around that it failed.
      const key = `file:${hash}`
      client.set(key, rid, 'EX', blockTimeInSecs, 'NX', (err, ok) => {
        if (err) return console.error('Redis.set failed :', err)
        console.log('Key set in Redis:', key)

        // if the set failed, then we return that there is already one in progress
        if ( !ok ) {
          callback(null, '/* Error: Concurrent processing of the same file - try again later. */\n')
          removeFile(orgFilename)
          return
        }

        // all good, so we can proceed with the minification

        // cleancss -o outfile.min.css infile.css
        var args = [ '--skip-import', '--output', minFilename, orgFilename ]
        var child = execFile(execCmd, args, execOpts, (err, stdout, stderr) => {
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

            // remove both files after some time
            removeFile(orgFilename)
            removeFile(minFilename)

            // and remove the key from Redis
            client.del(key, err => {
              if (err) return console.error('Error when removing key from Redis:', err)
              console.log('Key deleted from Redis:', key)
            })

            // callback with the minified styles
            callback(null, styles)
          })
        })
      })
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = minify

// --------------------------------------------------------------------------------------------------------------------
