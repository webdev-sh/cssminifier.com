// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012.
//
// * Andrew Chilton - https://chilts.org/
// * AppsAttic Ltd  - https://appsattic.com/
// * WebDev.sh      - https://webdev.sh/
//
// --------------------------------------------------------------------------------------------------------------------

// core
const fs = require('fs')
const os = require('os')
const path = require('path')

// npm
const express = require('express')
const compress = require('compression')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const moment = require('moment')
const yid = require('yid')
const LogFmtr = require('logfmtr')
const connectContent = require('connect-content')

// local
const env = require('./env.js')
const pkg = require('./pkg.js')
const stats = require('./stats.js')
const pages = require('./pages.js')
const headers = require('./headers.js')
const minify = require('./minify.js')
const log = require('./log.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

const isProd = process.env.NODE_ENV === 'production'
const protocol = 'https'
const nakedDomain = 'cssminifier.com'
const baseUrl = protocol + '://' + nakedDomain

// articles
const articles = connectContent({
  contentDir : path.join('/', __dirname, '..', 'content', 'article'),
})
console.log(articles)

// create the sitemap
const sitemap = [
  baseUrl + '/',
  baseUrl + '/plugins',
  baseUrl + '/programs',
]
pages.pages.forEach((pageName) => {
  sitemap.push(baseUrl + '/' + pageName)
})
const sitemapTxt = sitemap.join('\n') + '\n'

// --------------------------------------------------------------------------------------------------------------------
// application server

const app = express()
app.set('case sensitive routing', true)
app.set('strict routing', true)
app.set('views', __dirname + '/../views')
app.set('view engine', 'pug')
app.enable('trust proxy')

app.locals.pkg = pkg
app.locals.env = env
app.locals.min = isProd ? '.min' : ''
app.locals.pretty = isProd
app.locals.page = pages.page // all the language examples

// do all static routes first
app.use(compress())
app.use(favicon(__dirname + '/../public/favicon.ico'))

if ( isProd ) {
  const oneMonth = 30 * 24 * 60 * 60 * 1000
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

app.use((req, res, next) => {
  // add a Request ID
  req._rid = yid()

  // create a RequestID and set it on the `req.log`
  req.log = log.withFields({ rid: req._rid })

  next()
})

app.use(LogFmtr.middleware)

app.use((req, res, next) => {
  // set a `X-Made-By` header :)
  res.setHeader('X-Made-By', 'Andrew Chilton - https://chilts.org - @andychilton')

  // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
  res.setHeader('Vary', 'Accept-Encoding')

  res.locals.title  = false
  res.locals.moment = moment

  next()
})

// --------------------------------------------------------------------------------------------------------------------
// Routes

function redirectToHome(req, res) {
  res.redirect('/')
}

app.get(
  '/',
  headers,
  (req, res) => {
    stats.home.inc()
    res.render('index', { title : 'CSS Minifier' })
  }
)

app.get('/article/:pagename', articles)

app.get(
  '/compress',
  headers,
  (req, res) => {
    stats.compress.inc()
    res.render('compress', { title : 'CSS Compressor' })
  }
)

app.get('/minify', redirectToHome)
app.post(
  '/minify',
  (req, res) => {
    stats.minify.inc()

    minify(req._rid, req.body.input, (err, styles) => {
      if (err) return next(err)
      // render the same page whether we got an error or not
      res.render('index', { title : 'CSS Minifier', input : req.body.input, output : styles })
    })
  }
)

app.get('/download', redirectToHome)
app.post(
  '/download',
  (req, res, next) => {
    stats.download.inc()

    minify(req._rid, req.body.input, (err, styles) => {
      if (err) return next(err)
      res.header('Content-Disposition', 'attachment; filename=styles.css')
      res.header('Content-Type', 'text/plain')
      res.end(styles)
    })
  }
)

app.post(
  '/raw',
  (req, res, next) => {
    // only count the stat and minimise if the length is non-zero
    var minimised
    if ( req.body && req.body.input && req.body.input.length ) {
      stats.raw.inc()

      minify(req._rid, req.body.input, (err, styles) => {
        if (err) return next(err)
        res.header('Content-Type', 'text/plain')
        res.end(styles)
      })
    }
    else {
      res.header('Content-Type', 'text/plain')
      res.end('')
    }
  }
)

pages.routes(app)

app.get(
  '/plugins',
  headers,
  (req, res) => {
    res.render('plugins', { title : 'Editor Plugins which use CSS Minifier' })
  }
)

app.get(
  '/programs',
  headers,
  (req, res) => {
    res.render('programs', { title : 'Programs which use CSS Minifier' })
  }
)

app.get(
  '/stats',
  (req, res, next) => {
    var finished = false
    var got = 0
    var currentStats = {}

    // get some bits
    stats.pages.forEach((hitName) => {
      stats[hitName].values((err, data) => {
        if ( finished ) return
        if (err) {
          finished = true
          return next(err)
        }

        got += 1

        // save this hit
        data.forEach((hit) => {
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

app.get(
  '/sitemap.txt',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send(sitemapTxt)
  }
)

app.get(
  '/uptime',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send('' + parseInt(process.uptime(), 10))
  }
)

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome)

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app

// --------------------------------------------------------------------------------------------------------------------
