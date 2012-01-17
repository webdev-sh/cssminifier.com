// --------------------------------------------------------------------------------------------------------------------
// requires

var express = require('express'),
    routes = require('./routes')

var app = module.exports = express.createServer();

// --------------------------------------------------------------------------------------------------------------------
// configuration

// prefer non-www
app.use(function(req, res, next) {
    var host = (req.headers.host || '').replace(/^www\./, '');
    if ( host === req.headers.host ) {
        return next();
    }

    var href = 'http://' + host + req.url;

    // redirect to the non-www version
    res.statusCode = 302;
    res.setHeader('Location', href);
    res.write( '<p>Redirecting to <a href="' + href + '">' + href + '</a></p>\n' );
    res.end();
});

app.configure('development', function() {
    app.use(express.static(__dirname + '/public'));
    // so we can read the HTML better
    app.set('view options', { pretty: true })
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
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// --------------------------------------------------------------------------------------------------------------------
