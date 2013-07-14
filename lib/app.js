// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the server for cssminifier.com
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://www.appsattic.com/
//
// --------------------------------------------------------------------------------------------------------------------

// core
var fs = require('fs');

// npm
var express = require('express');
var log2 = require('log2');
var flake = require('connect-flake');
var redis = require('redis');
var cleancss = require('clean-css');

// --------------------------------------------------------------------------------------------------------------------
// set up some infrastructure prior to make the app

// logger
var logStream = process.env.NODE_ENV === 'production'
    ? fs.createWriteStream('/var/log/cssminifier-com/app.log', { flags : 'a' })
    : process.stdout;
var log = log2({ stream : logStream })

// redis
var client = redis.createClient();
client.select(1, function() {
    log('Redis Database selected');
});
client.on('ready', function() {
    log('Redis Ready');
});
client.on('connect', function() {
    log('Redis Connect');
});
client.on('drain', function() {
    log('Redis Drain');
});
client.on('idle', function() {
    log('Redis Idle');
});
client.on('error', function(err) {
    log('Redis Error : ' + err);
});
client.on('end', function() {
    log('Redis End');
});

// setup a global hour, day, month, year every min or so
var hour, day, month, year;
function setTimes() {
    var time = (new Date()).toISOString();
    hour  = time.substr(0, 13);
    day   = time.substr(0, 10);
    month = time.substr(0, 7);
    year  = time.substr(0, 4);
    log(['hour=' + hour, 'day=' + day, 'month=' + month, 'year=' + year].join(', '));
}
setTimes();
setInterval(setTimes, 60 * 1000);

// --------------------------------------------------------------------------------------------------------------------
// application server

var app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

// do all static routes first
app.use(express.favicon(__dirname + '/../public/favicon.ico'));

if ( process.env.NODE_ENV === 'production' ) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/../public/'), { maxAge : oneMonth });
}
else {
    app.use(express.static(__dirname + '/../public/'));
}

app.use(express.logger());
app.use(express.bodyParser());

// --------------------------------------------------------------------------------------------------------------------
// middleware

app.use(function(req, res, next) {
    res.locals.env = process.env.NODE_ENV;
    if ( process.env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

    next();
});

app.use(flake('eth0'));

app.use(function(req, res, next) {
    req.log = log2({ id : req.flake, stream : logStream });
    next();
});

if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.errorHandler());
}
else {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

function headers(req, res, next) {
    res.setHeader('X-Made-By', 'http://appsattic.com/');
    // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
    res.setHeader('Vary', 'Accept-Encoding');
    next();
}

// --------------------------------------------------------------------------------------------------------------------
// Routes

function redirectToHome(req, res) {
    res.redirect('/');
}

app.get(
    '/',
    headers,
    function(req, res) {
        req.log('/ : entry');
        res.render('index', { title: 'CSS Minifier' })
    }
);

app.get('/minify', redirectToHome);
app.post(
    '/minify',
    function(req, res) {
        req.log('/minify : entry');
        var minimised = cleancss.process(req.body.input);
        res.render('index', { title: 'CSS Minifier', input : req.body.input, output : minimised })
    }
);

app.get('/download', redirectToHome);
app.post(
    '/download',
    function(req, res) {
        req.log('/download : entry');
        var minimised = cleancss.process(req.body.input);
        res.header('Content-Disposition', 'attachment; filename=styles.css');
        res.header('Content-Type', 'text/plain');
        res.end(minimised);
    }
);

app.get(  '/raw',      redirectToHome );
app.post(
    '/raw',
    function(req, res) {
        req.log('/raw : entry');
        var minimised;
        if ( req.body.input ) {
            minimised = cleancss.process(req.body.input);
        }
        else {
            minimised = '';
        }
        res.header('Content-Type', 'text/plain');
        res.end(minimised);
    }
);

app.get(
    '/sitemap.txt',
    function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.send("http://cssminifier.com/\n");
    }
);

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome);

app.use(app.router);

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------
