// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// core
var fs = require('fs')

// npm
var express = require('express')
var compress = require('compression')
var favicon = require('serve-favicon')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var errorHandler = require('errorhandler')
var log2 = require('log2')
var flake = require('connect-flake')
var CleanCss = require('clean-css')
var connectBlog = require('connect-blog')
var moment = require('moment')

// local
var pkg = require('../package.json')
var stats = require('./stats.js')

// --------------------------------------------------------------------------------------------------------------------
// helper functions

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
// application server

var isProd = process.env.NODE_ENV === 'production'
var libDir = '/var/lib/com-cssminifier/'

var app = express()

app.set('views', __dirname + '/../views')
app.set('view engine', 'jade')
app.enable('trust proxy')

app.locals.pkg = pkg
app.locals.env = process.env.NODE_ENV
app.locals.min = isProd ? '.min' : ''
app.locals.pretty = isProd

// ignore some IP Addresses
var ignoreIPs = {
  '54.221.231.248' : true,
  '174.129.246.210' : true,
  '174.129.254.182' : true,
}
app.use(function(req, res, next) {
  if ( req.headers['x-forwarded-for'] in ignoreIPs ) {
    return res.send(420, "420 - Enhance Your Calm")
  }
  next()
})

// do all static routes first
app.use(compress())
app.use(favicon(__dirname + '/../public/favicon.ico'))

if ( isProd ) {
  var oneMonth = 30 * 24 * 60 * 60 * 1000
  app.use(express.static(__dirname + '/../public/', { maxAge : oneMonth }))
}
else {
  app.use(express.static(__dirname + '/../public/'))
}

app.use(morgan(isProd ? 'combined' : 'dev'))
app.use(bodyParser.urlencoded({
  extended : false,
  limit    : '1mb',
}))

// --------------------------------------------------------------------------------------------------------------------
// middleware

var adverts = [
  {
    title : 'Digital Ocean',
    url   : 'https://www.digitalocean.com/?refcode=c151de638f83',
    src   : '/s/img/digital-ocean-728x90.jpg',
    text1 : 'We recommend ',
    text2 : ' for hosting your sites. Free $10 credit when you sign up.',
  },
  // {
  //   title : 'DNSimple',
  //   url   : 'https://dnsimple.com/r/39fddfa09f6875',
  //   src   : '/s/img/dnsimple-728x90.png',
  //   text1 : 'Domains made simple with ',
  //   text2 : '. 30 day free trial plus ONE MONTH hosted DNS free!',
  // },
  {
    title : 'Unicode Tees',
    url   : 'http://unicodetees.com/',
    src   : '/s/img/unicodetees-728x90.png',
    text1 : 'An awesome site -  ',
    text2 : ' - the true way to show your inner geek.',
  },
]

var nextAdvert = 0

app.use(function(req, res, next) {
  res.locals.title  = false
  res.locals.post   = false
  res.locals.blog   = undefined
  res.locals.moment = moment

  // adverts, go to the next and set it
  nextAdvert++
  if ( nextAdvert == adverts.length ) {
    nextAdvert = 0
  }
  res.locals.ad = adverts[nextAdvert]

  next()
})

app.use(flake('eth0'))

app.use(function(req, res, next) {
  req.log = log2({ id : req.flake, stream : process.stderr })

  req.log('x-forwarded-for=' + req.headers['x-forwarded-for'])
  req.log('remoteAddress=' + req.connection.remoteAddress)

  next()
})

function headers(req, res, next) {
  res.setHeader('X-Made-By', 'Andrew Chilton - http://chilts.org - @andychilton')
  // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
  res.setHeader('Vary', 'Accept-Encoding')
  next()
}

// --------------------------------------------------------------------------------------------------------------------
// Routes

function redirectToHome(req, res) {
  res.redirect('/')
}

app.get(
  '/',
  headers,
  function(req, res) {
    req.log('/ : entry')
    stats.home.inc()
    res.render('index', { title : 'CSS Minifier' })
  }
)

app.get(
  '/compress',
  headers,
  function(req, res) {
    req.log('/compress : entry')
    stats.compress.inc()
    res.render('compress', { title : 'CSS Compressor' })
  }
)

app.get(
  '/examples',
  headers,
  function(req, res) {
    req.log('/examples : entry')
    res.render('examples', { title: 'Language Examples for CSS Minifier' })
  }
)

app.get('/minify', redirectToHome)
app.post(
  '/minify',
  function(req, res) {
    req.log('/minify : entry')

    stats.minify.inc()

    var minimised = minify(req.body.input)
    res.render('index', { title : 'CSS Minifier', input : req.body.input, output : minimised })
  }
)

app.get('/download', redirectToHome)
app.post(
  '/download',
  function(req, res) {
    req.log('/download : entry')

    stats.download.inc()

    var minimised = minify(req.body.input)
    res.header('Content-Disposition', 'attachment; filename=styles.css')
    res.header('Content-Type', 'text/plain')
    res.end(minimised)
  }
)

app.get(  '/raw',      redirectToHome )
app.post(
  '/raw',
  function(req, res, next) {
    req.log('/raw : entry')

    // only count the stat and minimise if the length is non-zero
    var minimised
    if ( req.body && req.body.input && req.body.input.length ) {
      stats.raw.inc()
      // write this input to a file
      fs.writeFile(libDir + '/' + req.flake + '.css', req.body.input, function(err) {
        if (err) return next(err)
        minimised = minify(req.body.input)
        fs.writeFile(libDir + '/' + req.flake + '.min.css', minimised, function(err) {
          if (err) return next(err)
          res.header('Content-Type', 'text/plain')
          res.end(minimised)
        })
      })
    }
    else {
      res.header('Content-Type', 'text/plain')
      res.end('')
    }
  }
)

app.get(
  '/stats',
  function(req, res, next) {
    var finished = false
    var got = 0
    var currentStats = {}

    // get some bits
    stats.pages.forEach(function(hitName) {
      stats[hitName].values(function(err, data) {
        if ( finished ) return
        if (err) {
          finished = true
          return next(err)
        }

        got += 1

        // save this hit
        data.forEach(function(hit) {
          currentStats[hit.ts] = currentStats[hit.ts] || {}
          currentStats[hit.ts][hitName] = hit.val
        })

        // if we've got all the results, render the page
        if ( got === stats.pages.length ) {
          finished = true
          res.render('stats', { stats : currentStats, title : 'stats' })
        }
      })
    })
  }
)

// blog
var blog = connectBlog({
  title       : 'CSS Minifier Blog',
  description : 'Online CSS Minifier/Compressor. Free! Works with Media Queries. Provides an API. Simple Quick and Fast!.',
  contentDir  : __dirname + '/../blog',
  domain      : 'cssminifier.com',
  base        : '/blog',
})

app.get(
  '/blog/',
  blog
)

app.get(
  '/blog/:path',
  blog
)

app.get(
  '/blog',
  function(req, res) {
    res.redirect('/blog/')
  }
)

// create the sitemap with the blog posts too
var sitemap = [
  "http://cssminifier.com/",
  "http://cssminifier.com/examples",
  "http://cssminifier.com/compress",
]
blog.posts.forEach(function(post) {
  sitemap.push("http://cssminifier.com/blog/" + post.name)
})
var sitemapTxt = sitemap.join('\n') + '\n'

app.get(
  '/sitemap.txt',
  function(req, res) {
    res.setHeader('Content-Type', 'text/plain')
    res.send(sitemapTxt)
  }
)

app.get(
  '/uptime',
  function(req, res) {
    res.setHeader('Content-Type', 'text/plain')
    res.send('' + parseInt(process.uptime(), 10))
  }
)

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome)

// error handlers
if ( isProd ) {
  app.use(errorHandler())
}
else {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }))
}

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app

// --------------------------------------------------------------------------------------------------------------------
