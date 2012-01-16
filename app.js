
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
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

    // finally, our router
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

app.get(  '/',         routes.index    );
app.post( '/minify',   routes.minify   );
app.post( '/download', routes.download );
app.post( '/raw',      routes.raw      );

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
