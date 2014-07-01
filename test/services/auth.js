'use strict';

var constants = require('../../app/config/constants');
var nock = require('nock');

var config = require('../../app/config/config');
var auth = require('../../app/services/auth');

describe('Auth service module', function(){
  beforeEach(function(){
    config.api_domains.auth.options.port = 443;
  });

  it('sends a HTTP request to revoke the access token', function(done){
    var authServer = nock('https://' + config.api_domains.auth.options.host)
      .post(constants.REVOKE_REFRESH_TOKEN)
      .reply(200);

    auth.revokeRefreshToken('a-valid-token').then(function(){
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

    auth.revokeRefreshToken('a-valid-token').then(function(){
      authServer.done();
      done();
    });
  });

  it('set the protocol correctly when we have a non-HTTPS port', function(done){
    config.api_domains.auth.options.port = 80;

    var authServer = nock('http://' + config.api_domains.auth.options.host)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(200);

    auth.revokeRefreshToken('a-valid-token').then(function(){
      authServer.done();
      done();
    });
  });

  it('sets the protocol correctly when we have a HTTPS port', function(done){
    config.api_domains.auth.options.port = 443;

    var authServer = nock('https://' + config.api_domains.auth.options.host)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(200);

    auth.revokeRefreshToken('a-valid-token').then(function(){
      authServer.done();
      done();
    });
  });
});