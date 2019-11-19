// ----------------------------------------------------------------------------

// local
const pkg = require('./pkg.js')

// ----------------------------------------------------------------------------

// env
const nodeEnv = process.env.NODE_ENV || 'production'
const isProd = nodeEnv === 'production'
const isDev = !isProd
const protocol = process.env.PROTOCOL || 'https'
const nakedDomain = process.env.NAKED_DOMAIN || pkg.name
const baseUrl = `${protocol}://${nakedDomain}`
const port = process.env.PORT || '8011'

const env = {
  nodeEnv,
  isProd,
  isDev,
  protocol,
  nakedDomain,
  baseUrl,
  port,
}

if (isDev) {
  console.log('env:', env)
}

// ----------------------------------------------------------------------------

module.exports = env

// ----------------------------------------------------------------------------
