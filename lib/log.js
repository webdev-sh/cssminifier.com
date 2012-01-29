// --------------------------------------------------------------------------------------------------------------------
//
// log.js - some log helpers
//
// Copyright (c) 2012 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------

exports.log = function(msg) {
    console.log((new Date()).toISOString() + ' : ' + msg);
}

exports.warn = function(msg) {
    console.warn((new Date()).toISOString() + ' : ' + msg);
}

exports.all = function(msg) {
    exports.warn(msg);
    exports.log(msg);
}

// --------------------------------------------------------------------------------------------------------------------
