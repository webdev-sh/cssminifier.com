// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

'use strict'

// local
var headers = require('./headers.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

var page = {
  'wget'   : {
    title : 'Using cssminifier.com with wget',
    name  : 'wget',
  },
  'curl'   : {
    title : 'Using cssminifier.com with curl',
    name  : 'Curl',
  },
  'nodejs' : {
    title : 'Using cssminifier.com in Node.js',
    name  : 'Node.js',
  },
  'python' : {
    title : 'Using cssminifier.com in Python',
    name  : 'Python',
  },
  'ruby'   : {
    title : 'Using cssminifier.com in Ruby',
    name  : 'Ruby',
  },
  'perl'   : {
    title : 'Using cssminifier.com in Perl',
    name  : 'Perl',
  },
  'php'    : {
    title : 'Using cssminifier.com in PHP',
    name  : 'PHP',
  },
  'c-sharp'    : {
    title : 'Using cssminifier.com in C#',
    name  : 'C#',
  },
  'rust'    : {
    title : 'Using cssminifier.com in Rust',
    name  : 'Rust',
  },
  'kotlin'    : {
    title : 'Using cssminifier.com in Kotlin',
    name  : 'Kotlin',
  },
  'swift'    : {
    title : 'Using cssminifier.com in Swift',
    name  : 'Swift',
  },
}

var pages = Object.keys(page)

// the routes function (adds routes to the app object)
function routes(app) {

  pages.forEach(function(pageName) {
    app.get(
      '/' + pageName,
      headers,
      (req, res) => {
        res.render(pageName, { title : page[pageName].title })
      }
    )
  })
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.routes = routes
module.exports.page   = page
module.exports.pages  = pages

// --------------------------------------------------------------------------------------------------------------------
