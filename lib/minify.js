// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var CleanCss = require('clean-css')

// --------------------------------------------------------------------------------------------------------------------

var cleancss = new CleanCss({ processImport : false })

function minify(css) {
  var result = ''
  try {
    result = cleancss.minify(css)
    // console.log('result:', result)
  }
  catch (e) {
    log.error('Error minifying css: ' + e)
    min = '/* There is an error in your CSS. */'
  }
  return result.styles
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = minify

// --------------------------------------------------------------------------------------------------------------------
