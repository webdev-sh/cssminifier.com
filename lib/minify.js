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

// --------------------------------------------------------------------------------------------------------------------

var execFile = childProcess.execFile;
var libDir = '/var/lib/com-cssminifier'
var execCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'cleancss')
var execOpts = {
  timeout : 10 * 1000, // 10 seconds
}

// minify() swallows errors with the CSS, but returns errors with the program (reading or writing files)
function minify(rid, css, callback) {
  // Here, there are three things to do:
  // 1. Write the file to the filesystem
  // 2. Call cleanCss to minify the input to the output (the cleanCss command will write the output file)
  // 3. Read the output file for return to the user

  // write this input to a file
  var orgFilename = libDir + '/' + rid + '.css'
  var minFilename = libDir + '/' + rid + '.min.css'

  fs.writeFile(orgFilename, css, function(err) {
    if (err) return callback(err)

    // cleancss -o outfile.min.css infile.css
    var args = [ '--skip-import', '--output', minFilename, orgFilename ]
    var child = execFile(execCmd, args, execOpts, function (err, stdout, stderr) {
      if (err) {
        process.stderr.write('' + err)
        console.log('err:', err)
        callback(null, '/* Error: Internal server error */\n')
        return
      }

      fs.readFile(minFilename, function(err, styles) {
        if (err) return callback(err)
        callback(null, styles)
      })
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = minify

// --------------------------------------------------------------------------------------------------------------------
