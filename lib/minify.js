// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var CleanCss = require('clean-css')

// --------------------------------------------------------------------------------------------------------------------

var cleancss = new CleanCss({
  processImport : false,
  // debug: true, // gives result.stats
})

function minify(css, callback) {
  var result, styles, err

  try {
    result = cleancss.minify(css)
    styles = result.styles
    console.log('result:', result)

    // ToDo : Errors (same as below perhaps)

    // Warnings : see if there were any warnings
    if ( result.warnings.length ) {
      styles = styles + '\n/* WARNING : ' + result.warnings.length + ' warning(s) */'
      result.warnings.forEach(function(warning) {
        warning = warning.replace(/[\r\n\*]/gm, '');
        styles = styles + '\n/* WARNING : ' + warning + ' */'
      })
      styles = styles + '\n'
    }

  }
  catch (e) {
    err = e
    log.error('Error minifying css: ' + e)
    styles = '/* Error minifying CSS : ' + e + ' */'
  }

  process.nextTick(function() {
    if (err) {
      return callback(err, styles)
    }
    callback(null, styles)
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = minify

// --------------------------------------------------------------------------------------------------------------------
