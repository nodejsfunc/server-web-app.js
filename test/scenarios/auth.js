'use strict';

var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	config = require('../../app/config/config'),
	constants = require('../../app/config/constants'),
	routes = require('../../app/routes'),
	mocks = require('../mocks'),
	nock = require('nock'),
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
			.expect('set-cookie', new RegExp(querystring.stringify({access_token: mocks.TOKEN_RESPONSE.access_token})+'; Path=\/api; HttpOnly; Secure'))
			.expect(200, done);
	});

	it('should set expiry date as session', function(done){
		nock('https://' + auth.options.host)
			.post(constants.REFRESH_TOKEN_PATH)
			.matchHeader('Authorization', 'Bearer some token')
			.reply(200, mocks.TOKEN_RESPONSE);

		// When an expiry date or validity interval is not set at cookie creation time, a session cookie is created
		request
			.post('/auth' + constants.REFRESH_TOKEN_PATH)
			.expect('set-cookie', new RegExp(querystring.stringify({access_token: mocks.TOKEN_RESPONSE.access_token})+'; Path=\/api; HttpOnly; Secure'))
			.expect(200, done);
	});

	it('should set expiry date at MAX', function(done){
		nock('https://' + auth.options.host)
			.post(constants.REFRESH_TOKEN_PATH)
			.matchHeader('Authorization', 'Bearer some token')
			.reply(200, mocks.TOKEN_RESPONSE);

		var param = {}, date = new Date(Date.now() + constants.AUTH_MAX_AGE);
		param[constants.AUTH_PARAM_REMEMBER_ME] = true;

		// since the date is calculated at runtime, we cannot assert the date precisely since we do not know exactly when the response returns
		// since AUTH_MAX_AGE represents two weeks, we only check that the date is two weeks in the future (ignoring the time component)
		request
			.post('/auth' + constants.REFRESH_TOKEN_PATH)
			.query(param)
			.expect('set-cookie', new RegExp(querystring.stringify({access_token: mocks.TOKEN_RESPONSE.access_token})+'; Path=\/api; Expires='+date.toUTCString().replace(/\d\d:\d\d:\d\d/, '\\d\\d:\\d\\d:\\d\\d')+'; HttpOnly; Secure'))
			.expect(200, done);
	});

});