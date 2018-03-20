// --------------------------------------------------------------------------------------------------------------------

function headers(req, res, next) {
  res.setHeader('X-Made-By', 'Andrew Chilton - https://chilts.org - @andychilton')
  // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
  res.setHeader('Vary', 'Accept-Encoding')
  next()
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = headers

// --------------------------------------------------------------------------------------------------------------------
