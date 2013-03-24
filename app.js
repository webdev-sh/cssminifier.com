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

// --------------------------------------------------------------------------------------------------------------------

// some app settings
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// do all static routes first
app.use(express.favicon(__dirname + '/htdocs/favicon.ico'));

if ( process.env.NODE_ENV === 'production' ) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/public/'), { maxAge : oneMonth });
}
else {
    app.use(express.static(__dirname + '/public/'));
}

// middleware
app.use(express.bodyParser());

if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.errorHandler());
}
else {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

// --------------------------------------------------------------------------------------------------------------------
// Routes

app.get(  '/',         routes.index    );
app.post( '/minify',   routes.minify   );
app.post( '/download', routes.download );
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
