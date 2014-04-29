'use strict';

var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	config = require('../../app/config/config'),
	constants = require('../../app/config/constants'),
	routes = require('../../app/routes'),
	mocks = require('../mocks'),
	nock = require('nock'),
	path = 'path',
	querystring = require('querystring'),
	should = require('should'),
	request = require('supertest')('http://localhost:3000');

describe('Auth', function(){

	var server, auth = config.api_domains.auth;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(bodyParser());
		app.use(function(req, res, next){
			req.cookies.access_token = 'some token';
			next();
		});
		app.use(routes.services);
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should remove tokens from response', function(done){

		nock('https://' + auth.options.host)
			.post(constants.REFRESH_TOKEN_PATH)
			.matchHeader('Authorization', 'Bearer some token')
			.reply(200, mocks.TOKEN_RESPONSE);

		request
			.post('/auth' + constants.REFRESH_TOKEN_PATH)
			.expect(200, function(err, res){
				should.not.exist(err);
				should(mocks.TOKEN_RESPONSE).containDeep(res.body);
				should(res.body).not.have.property('access_token');
				should(res.body).not.have.property('refresh_token');
				done();
			});
	});

	it('should set access token as cookie', function(done){
		nock('https://' + auth.options.host)
			.post(constants.REFRESH_TOKEN_PATH)
			.matchHeader('Authorization', 'Bearer some token')
			.reply(200, mocks.TOKEN_RESPONSE);

		request
			.post('/auth' + constants.REFRESH_TOKEN_PATH)
			.expect('set-cookie', new RegExp(querystring.stringify({access_token: mocks.TOKEN_RESPONSE.access_token})+'; Path=\/api;'))
			.expect(200, done);
	});

	it('should set expiry date based on remember me option', function(){

	});

});