'use strict';

var express = require('express'),
	constants = require('../../app/config/constants'),
	config = require('../../app/config/config'),
	should = require('should'),
	cookieParser = require('cookie-parser'),
	routes = require('../../app/routes'),
	request = require('supertest')('http://localhost:3000'),
  nock = require('nock'),
  sinon = require('sinon');

var repository = require('../../app/util/repository');

describe('Local routing', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(constants.LOCAL_PATH, routes.local);
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

  it('should return a 400 when we have not set the access_token cookie', function(done){
    request
      .get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
      .expect(400, done);
  });

  it('should return an appropriate HTTP status if access_token cannot be found', function(done){
    request
      .get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
      .set('Cookie', 'access_token=does-not-exist')
      .expect(500, function(err){
        should.not.exist(err);
        done();
      });
  });

	it('should return local config object', function(done){
		request
			.get(constants.LOCAL_PATH + constants.CLIENT_CONFIG_PATH)
			.expect(200, function(err, res){
				should.not.exist(err);
				should(res.body).containDeep(config.clientConfig);
				done();
			});
	});

	it('should remove access_token cookie', function(done){
    nock('https://' + config.api_domains.auth.options.host)
      .post(constants.REVOKE_REFRESH_TOKEN)
      .reply(200);

		request
			.get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
      .set('Cookie', 'access_token=something-that-is-real-irl')
      .expect('set-cookie', /access_token=; Path=\/api;/)
			.expect(200, done);
	});

  it('should remove access_token from repository', function(done){
    nock('https://' + config.api_domains.auth.options.host)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(200);

    var spy = sinon.spy(repository, 'del');

    request
        .get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
        .set('Cookie', 'access_token=something-that-is-real-irl')
        .expect(200, function(){
          spy.calledOnce.should.equal(true);
          spy.calledWith('something-that-is-real-irl').should.equal(true);
          repository.del.restore();
          done();
        });
  });

  it('should revoke refresh_token on the auth server', function(done){
    var authServer = nock('https://' + config.api_domains.auth.options.host)
        .post(constants.REVOKE_REFRESH_TOKEN)
        .reply(200);

    request
        .get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
        .set('Cookie', 'access_token=something-that-is-real-irl')
        .expect(200, function(){
          authServer.done();
          done();
        });
  });

  it('should fail when we cannot revoke the refresh_token on the auth server', function(done){
    nock('https://' + config.api_domains.auth.options.host)
      .post(constants.REVOKE_REFRESH_TOKEN)
      .reply(500);

    request
      .get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
      .set('Cookie', 'access_token=something-that-would-cause-an-error')
      .expect(500, done);
  });
});