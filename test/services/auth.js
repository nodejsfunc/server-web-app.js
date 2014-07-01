'use strict';

var constants = require('../../app/config/constants'),
    config = require('../../app/config/config'),
    nock = require('nock');

var auth = require('../../app/services/auth');
var extend = require('extend');

describe('Auth service module', function(){
  var originalConfig;

  before(function(){
    originalConfig = extend({}, config);
  });

  afterEach(function(){
    config = originalConfig;
  });

  it('sends a HTTP request to revoke the access token', function(done){
    var authServer = nock('https://' + config.api_domains.auth.options.host)
      .post(constants.REVOKE_REFRESH_TOKEN)
      .reply(200);

    auth.revokeRefreshToken('some-token-which-is-nonsense').then(function(){
      authServer.done();
      done();
    });
  });

  it('rejects the promise if we do not get a 200', function(done){
    nock('https://' + config.api_domains.auth.options.host)
      .post(constants.REVOKE_REFRESH_TOKEN)
      .reply(500);

    auth.revokeRefreshToken('some-token-which-is-nonsense').then(null, done);
  });

  it('correctly sets the port when the port is other than standard', function(done){
    config.api_domains.auth.options.port = 8080;

    var authServer = nock('http://' + config.api_domains.auth.options.host + ':' + config.api_domains.auth.options.port)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(200);

    auth.revokeRefreshToken('a-valid-token', config).then(function(){
      authServer.done();
      done();
    });
  });
});