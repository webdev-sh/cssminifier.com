// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the main server for cssminifier.com
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://www.appsattic.com/
//
// --------------------------------------------------------------------------------------------------------------------

var http = require('http');

var express = require('express'),
    routes = require('./lib/routes.js')

var log = require('./lib/log.js');

// --------------------------------------------------------------------------------------------------------------------
// application server

var env = process.env;

var app = express();
var port = parseInt(process.argv[2], 10) || 3000;
process.title = 'cssminifier.com:' + port;

// --------------------------------------------------------------------------------------------------------------------

// some app settings
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(function(req, res, next) {
    if ( env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

    next();
});

// do all static routes first
app.use(express.favicon(__dirname + '/htdocs/favicon.ico'));

if ( process.env.NODE_ENV === 'production' ) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/public/'), { maxAge : oneMonth });
}
else {
    app.use(express.static(__dirname + '/public/'));
}

app.use(express.logger());

// middleware
app.use(express.bodyParser());

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

app.use(app.router);

// --------------------------------------------------------------------------------------------------------------------
// start the server

var server = http.createServer(app);

server.listen(port, function() {
    log.line();
    log('Started, listening on port ' + port);
});

// --------------------------------------------------------------------------------------------------------------------
