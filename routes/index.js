// --------------------------------------------------------------------------------------------------------------------
// requires
var yahoo = require('../lib/cssmin.js');

// --------------------------------------------------------------------------------------------------------------------
// pages

exports.index = function(req, res) {
    res.render('index', { title: 'Express' })
};

exports.minify = function(req, res) {
    var minimised = yahoo.compressor.cssmin(req.body.input);
    res.render('index', { title: 'Express', input : req.body.input, output : minimised })
};

// from a post, outputs the text and the text only (with a download header)
exports.download = function(req, res) {
    var minimised = yahoo.compressor.cssmin(req.body.input);
    res.header('Content-Disposition', 'attachment; filename=styles.css');
    res.header('Content-Type', 'text/plain');
    res.end(minimised);
};

// from a post, outputs the text and the text only
exports.raw = function(req, res) {
    var minimised;
    if ( req.body.input ) {
        minimised = yahoo.compressor.cssmin(req.body.input);
    }
    else {
        minimised = '';
    }
    res.header('Content-Type', 'text/plain');
    res.end(minimised);
};

// --------------------------------------------------------------------------------------------------------------------
