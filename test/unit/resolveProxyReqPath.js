'use strict';

var assert = require('assert');
var ScopeContainer = require('../../lib/scopeContainer');
var resolveProxyReqPath = require('../../app/steps/resolveProxyReqPath');
var expect = require('chai').expect;


describe('resolveProxyReqPath', function () {
  var container;

  beforeEach(function () {
    container = new ScopeContainer();
  });

  var tests = [
    {
      resolverType: 'undefined',
      resolverFn: undefined,
      data: [
        { originalUrl: 'http://localhost:12345', parsed: '/' },
        { originalUrl: 'http://g.com/123?45=67', parsed: '/123?45=67' }
      ]
    },
    {
      resolverType: 'a syncronous function',
      resolverFn: function () { return 'the craziest thing'; },
      data: [
        { originalUrl: 'http://localhost:12345', parsed: 'the craziest thing' },
        { originalUrl: 'http://g.com/123?45=67', parsed: 'the craziest thing' }
      ]
    },
    {
      resolverType: 'a Promise',
      resolverFn: function () {
        return new Promise(function (resolve) {
          resolve('the craziest think');
        });
      },
      data: [
        { originalUrl: 'http://localhost:12345', parsed: 'the craziest think' },
        { originalUrl: 'http://g.com/123?45=67', parsed: 'the craziest think' }
      ]
    }
  ];

  describe('when proxyReqPathResolver', function () {

    tests.forEach(function (test) {
      describe('is ' + test.resolverType, function () {
        describe('it returns a promise which resolves a container with expected originalUrl', function () {
          test.data.forEach(function (data) {
            it(data.originalUrl, function (done) {
              container.user.req = { originalUrl: data.originalUrl };
              container.options.proxyReqPathResolver = test.resolverFn;
              var r = resolveProxyReqPath(container);

              assert(r instanceof Promise, 'Expect resolver to return a thennable');

              r.then(function (container) {
                var response;
                try {
                  response = container.proxy.reqBuilder.path;
                  if (!response) {
                    throw new Error('reqBuilder.originalUrl is undefined');
                  }
                } catch (e) {
                  done(e);
                }
                expect(response).to.equal(data.parsed);
                done();
              });
            });
          });
        });
      });
    });

  });
});
