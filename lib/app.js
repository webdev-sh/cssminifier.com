// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the server for cssminifier.com
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// core
var fs = require('fs');

// npm
var express = require('express');
var log2 = require('log2');
var flake = require('connect-flake');
var redis = require('redis');
var cleanCss = require('clean-css');
var connectBlog = require('connect-blog');
var rustle = require('rustle');
var redis = require('redis');
var moment = require('moment');

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

var hitter = {};
var hitterPages = [ 'home', 'minify', 'download', 'raw' ];
hitterPages.forEach(function(name) {
    hitter[name] = rustle({
        client       : client,
        domain       : 'cssminifier', // \
        category     : 'hits',        //  >- Keys: "<domain>:<category>:<name>"
        name         : name,          // /
        period       : 24 * 60 * 60,       // one day
        aggregation  : 'sum',
    });
});

// --------------------------------------------------------------------------------------------------------------------
// helper functions

var cleancss = new cleanCss({ processImport : false });
function minify(css) {
    return cleancss.minify(css);
}

// --------------------------------------------------------------------------------------------------------------------
// application server

var app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

// do all static routes first
app.use(express.compress());
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

var adverts = [
    {
        title : 'Digital Ocean',
        url   : 'https://www.digitalocean.com/?refcode=c151de638f83',
        src   : '/s/img/digital-ocean-728x90.jpg',
    },
    // {
    //     title : 'Theme Forest',
    //     url   : 'http://themeforest.net/page/top_sellers?ref=andychilton',
    //     src   : '/s/img/theme-forest-728x90.gif',
    // },
];
var nextAdvert = 0;

app.use(function(req, res, next) {
    res.locals.env = process.env.NODE_ENV;
    if ( process.env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

    res.locals.title  = false;
    res.locals.post   = false;
    res.locals.blog   = undefined;
    res.locals.moment = moment;

    // adverts, go to the next and set it
    nextAdvert++;
    if ( nextAdvert == adverts.length ) {
        nextAdvert = 0;
    }
    res.locals.ad = adverts[nextAdvert];

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
    res.setHeader('X-Made-By', 'Andrew Chilton - http://chilts.org - @andychilton');
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
        hitter.home.inc();
        res.render('index', { title : 'CSS Minifier' });
    }
);

app.get(
    '/examples',
    headers,
    function(req, res) {
        req.log('/examples : entry');
        res.render('examples', { title: 'Language Examples' });
    }
);

app.get('/minify', redirectToHome);
app.post(
    '/minify',
    function(req, res) {
        req.log('/minify : entry');

        hitter.minify.inc();

        var minimised = minify(req.body.input);
        res.render('index', { title : 'CSS Minifier', input : req.body.input, output : minimised });
    }
);

app.get('/download', redirectToHome);
app.post(
    '/download',
    function(req, res) {
        req.log('/download : entry');

        hitter.download.inc();

        var minimised = minify(req.body.input);
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

        hitter.raw.inc();

        var minimised;
        if ( req.body.input ) {
            minimised = minify(req.body.input);
        }
        else {
            minimised = '';
        }
        res.header('Content-Type', 'text/plain');
        res.end(minimised);
    }
);

app.get(
    '/stats',
    function(req, res, next) {
        var finished = false;
        var got = 0;
        var stats = {};
        // get some bits
        hitterPages.forEach(function(hitName) {
            hitter[hitName].values(function(err, data) {
                if ( finished ) return;
                if (err) {
                    finished = true;
                    return next(err);
                }

                got += 1;

                // save this hit
                data.forEach(function(hit) {
                    stats[hit.ts] = stats[hit.ts] || {};
                    stats[hit.ts][hitName] = hit.val;
                });

                // if we've got all the results, render the page
                if ( got === hitterPages.length ) {
                    finished = true;
                    res.render('stats', { stats : stats, title : 'stats' });
                }
            });
        });
    }
);

var blog = connectBlog({
    title       : 'CSS Minifier Blog',
    description : 'The CSS Minifier Blog, for All Your Minifying Needs!',
    contentDir  : __dirname + '/../blog',
    domain      : 'cssminifier.com',
    base        : '/blog',
});

app.get(
    '/blog/',
    blog
);

app.get(
    '/blog/:path',
    blog
);

app.get(
    '/blog',
    function(req, res) {
        res.redirect('/blog/');
    }
);

// create the sitemap with the blog posts too
var sitemap = [
    "http://cssminifier.com/",
    "http://cssminifier.com/examples",
];
blog.posts.forEach(function(post) {
    sitemap.push("http://cssminifier.com/blog/" + post.name);
});

app.get(
    '/sitemap.txt',
    function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(sitemap.join("\n") + "\n");
    }
);

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome);

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------
