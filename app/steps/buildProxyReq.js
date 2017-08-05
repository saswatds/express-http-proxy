'use strict';

const debug = require('debug')('express-http-proxy');
const requestOptions = require('../../lib/requestOptions');

function buildProxyReq(Container) {
  const req = Container.user.req;
  const res = Container.user.res;
  const options = Container.options;

  const parseBody = (!options.parseReqBody) ? Promise.resolve(null) : requestOptions.bodyContent(req, res, options);
  const createReqOptions = requestOptions.create(req, res, options);

  return new Promise(function (resolve) {
    Promise
      .all([parseBody, createReqOptions])
      .then(function (responseArray) {
        Container.proxy.bodyContent = responseArray[0];
        Container.proxy.reqBuilder = responseArray[1];
        debug('proxy request options:\n', Container.proxy.reqBuilder);
        resolve(Container);
      });
  });
}

module.exports = buildProxyReq;
