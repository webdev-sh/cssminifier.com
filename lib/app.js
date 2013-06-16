// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the server for cssminifier.com
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://www.appsattic.com/
//
// --------------------------------------------------------------------------------------------------------------------

var express = require('express'),
    routes = require('./routes.js')

var log = require('./log.js');

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
    if ( process.env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

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

app.get(
    '/',
    headers,
    routes.index
);

app.get(  '/minify',   routes.redirectToHome );
app.post( '/minify',   routes.minify   );

app.get(  '/download', routes.redirectToHome );
app.post( '/download', routes.download );

app.get(  '/raw',      routes.redirectToHome );
app.post( '/raw',      routes.raw      );

app.get(  '/sitemap.txt',  routes.sitemap );

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get(  '/,',        routes.redirectToHome );

app.use(app.router);

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------