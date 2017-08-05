'use strict';
const requestOptions = require('../../lib/requestOptions');
const srvResolver = require('../../lib/srvResolver')

function resolveProxyHost(container) {
  let parsedHost;
  return new Promise(function (resolve) {
    // When resolveSrv is true, host is to be treated like SRV record

    function commit() {
      container.proxy.reqBuilder.host = parsedHost.host;
      container.proxy.reqBuilder.port = container.options.port || parsedHost.port;
      container.proxy.requestModule = parsedHost.module;
      resolve(container);
    }

    if (container.options.resolveSrv) {
      srvResolver(container)
        .then((container) => {
          // This is kind of irritating that this being
          parsedHost = requestOptions.parseHost(container)
          commit()
        })
    } else {
      // If its not srv record then fall back to default resolution
      if (container.options.memoizeHost && container.options.memoizedHost) {
        parsedHost = container.options.memoizedHost;
      } else {
        parsedHost = requestOptions.parseHost(container);
      }
      commit()
    }
  })
}

module.exports = resolveProxyHost;
