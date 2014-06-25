'use strict';

var constants = require('../../app/config/constants'),
    config = require('../../app/config/config'),
    should = require('should'),
    nock = require('nock');

var auth = require('../../app/services/auth');

describe('Auth service module', function(){
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
    var authServer = nock('https://' + config.api_domains.auth.options.host)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(500);

    auth.revokeRefreshToken('some-token-which-is-nonsense').then(null, done);
  });
});