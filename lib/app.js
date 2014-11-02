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
var cleanCss = require('clean-css');
var connectBlog = require('connect-blog');
var moment = require('moment');

// local
var stats = require('./stats.js');

// --------------------------------------------------------------------------------------------------------------------
// set up some infrastructure prior to make the app

// logger
var log = log2();

// --------------------------------------------------------------------------------------------------------------------
// helper functions

var cleancss = new cleanCss({ processImport : false });
function minify(css) {
    var min = '';
    try {
      min = cleancss.minify(css);
    }
    catch (e) {
      log.error('Error minifying css: ' + e)
      min = '/* There is an error in your CSS. */'
    }
    return min;
}

// --------------------------------------------------------------------------------------------------------------------
// application server

var app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');
app.enable('trust proxy');

// ignore some IP Addresses
var ignoreIPs = {
    '54.221.231.248' : true,
    '174.129.246.210' : true,
    '174.129.254.182' : true,
};
app.use(function(req, res, next) {
    if ( req.headers['x-forwarded-for'] in ignoreIPs ) {
        return res.send(420, "420 - Enhance Your Calm");
    }
    next();
});

// do all static routes first
app.use(express.compress());
app.use(express.favicon(__dirname + '/../public/favicon.ico'));

if ( process.env.NODE_ENV === 'production' ) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/../public/', { maxAge : oneMonth }));
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
    {
        title : 'DNSimple',
        url   : 'https://dnsimple.com/r/39fddfa09f6875',
        src   : '/s/img/dnsimple-728x90.jpg',
    },
    // {
    //     title : 'Unicode Tees',
    //     url   : 'http://teespring.com/UnicodeTees-03C0-Pi',
    //     src   : '/s/img/unicode-tees-728x90.jpg',
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
    req.log = log2({ id : req.flake });
    next();
});

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
        stats.home.inc();
        res.render('index', { title : 'CSS Minifier' });
    }
);

app.get(
    '/compress',
    headers,
    function(req, res) {
        req.log('/compress : entry');
        stats.compress.inc();
        res.render('compress', { title : 'CSS Compressor' });
    }
);

app.get(
    '/examples',
    headers,
    function(req, res) {
        req.log('/examples : entry');
        res.render('examples', { title: 'Language Examples for CSS Minifier' });
    }
);

app.get('/minify', redirectToHome);
app.post(
    '/minify',
    function(req, res) {
        req.log('/minify : entry');

        stats.minify.inc();

        var minimised = minify(req.body.input);
        res.render('index', { title : 'CSS Minifier', input : req.body.input, output : minimised });
    }
);

app.get('/download', redirectToHome);
app.post(
    '/download',
    function(req, res) {
        req.log('/download : entry');

        stats.download.inc();

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

        // only count the stat and minimise if the length is non-zero
        var minimised;
        if ( req.body && req.body.input && req.body.input.length ) {
            stats.raw.inc();
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
        var currentStats = {};

        // get some bits
        stats.pages.forEach(function(hitName) {
            stats[hitName].values(function(err, data) {
                if ( finished ) return;
                if (err) {
                    finished = true;
                    return next(err);
                }

                got += 1;

                // save this hit
                data.forEach(function(hit) {
                    currentStats[hit.ts] = currentStats[hit.ts] || {};
                    currentStats[hit.ts][hitName] = hit.val;
                });

                // if we've got all the results, render the page
                if ( got === stats.pages.length ) {
                    finished = true;
                    res.render('stats', { stats : currentStats, title : 'stats' });
                }
            });
        });
    }
);

// blog
var blog = connectBlog({
    title       : 'CSS Minifier Blog',
    description : 'Online CSS Minifier/Compressor. Free! Works with Media Queries. Provides an API. Simple Quick and Fast!.',
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
    "http://cssminifier.com/compress",
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

app.get(
    '/uptime',
    function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.send('' + parseInt(process.uptime(), 10));
    }
);

// these links were shown as being linked to in Google Webmasters, but are 404's, so redirect to the homepage
app.get('/,', redirectToHome);

// error handlers
if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.errorHandler());
}
else {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------
