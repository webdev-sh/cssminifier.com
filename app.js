// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the main server for cssminifier.com
//
// Copyright (c) 2012 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// requires

var express = require('express'),
    routes = require('./lib/routes.js')

var app = module.exports = express.createServer();
var log = require('./lib/log.js');

// --------------------------------------------------------------------------------------------------------------------
// configuration

app.configure('development', function() {
    app.use(express.static(__dirname + '/public'));
});

app.configure('production', function() {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/public'), { maxAge : oneMonth });
});

app.configure(function() {
    // set up some templates
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // do all static routes first (but making sure the CSS is generated)
    app.use(express.favicon(__dirname + '/htdocs/favicon.ico'));
    app.use(require('stylus').middleware({ src: __dirname + '/htdocs' }));
    app.use(express.static(__dirname + '/htdocs'));

    // middleware
    app.use(express.bodyParser());
    // app.use(express.methodOverride()); // don't need this one
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

app.use(app.router);

// --------------------------------------------------------------------------------------------------------------------
// Routes

app.get(  '/',         routes.index    );
app.post( '/minify',   routes.minify   );
app.post( '/download', routes.download );
app.post( '/raw',      routes.raw      );

// --------------------------------------------------------------------------------------------------------------------
// start the server

var port = process.argv[2] || 3000;
app.listen(port);
log.all('====================================================');
log.all('Started');

// --------------------------------------------------------------------------------------------------------------------
