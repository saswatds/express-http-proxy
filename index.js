'use strict';

// ROADMAP: Major refactoring April 2017
// It would be easier to follow if we extract to simpler functions, and used
// a standard, step-wise set of filters with clearer edges and borders.  It
// would be more useful if authors could use Promises for all over-rideable
// steps.

// complete: Break workflow into composable steps without changing them much
// complete: extract workflow methods from main file
// complete: cleanup options interface
// complete: change hook names to be different than the workflow steps.
// *: cleanup host is processed twice
// *: cleanup workflow methods so they all present as over-rideable thennables
// *: Update/add tests to unit test workflow steps independently
// complete: update docs and release

const ScopeContainer = require('./lib/scopeContainer');
const assert = require('assert');
const debug = require('debug')('express-http-proxy');

const buildProxyReq = require('./app/steps/buildProxyReq');
const copyProxyResHeadersToUserRes = require('./app/steps/copyProxyResHeadersToUserRes');
const decorateProxyReqBody = require('./app/steps/decorateProxyReqBody');
const decorateProxyReqOpts = require('./app/steps/decorateProxyReqOpts');
const decorateUserRes = require('./app/steps/decorateUserRes');
const maybeSkipToNextHandler = require('./app/steps/maybeSkipToNextHandler');
const prepareProxyReq = require('./app/steps/prepareProxyReq');
const resolveProxyHost = require('./app/steps/resolveProxyHost');
const resolveProxyReqPath = require('./app/steps/resolveProxyReqPath');
const sendProxyRequest = require('./app/steps/sendProxyRequest');
const sendUserRes = require('./app/steps/sendUserRes');

module.exports = function proxy(host, userOptions) {
  assert(host, 'Host should not be empty');

  return function handleProxy(req, res, next) {
    debug('handleProxy called on ' + req.path);
    const container = new ScopeContainer(req, res, next, host, userOptions);

    // Skip proxy if filter is falsey.  Loose equality so filters can return
    // false, null, undefined, etc.
    if (!container.options.filter(req, res)) { return next(); }

    buildProxyReq(container)
      .then(resolveProxyHost)
      .then(decorateProxyReqOpts)
      .then(resolveProxyReqPath)
      .then(decorateProxyReqBody)
      .then(prepareProxyReq)
      .then(sendProxyRequest)
      .then(maybeSkipToNextHandler)
      .then(copyProxyResHeadersToUserRes)
      .then(decorateUserRes)
      .then(sendUserRes)
      .catch(next);
  };
};
