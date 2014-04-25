'use strict';

var express = require('express'),
	proxyquire = require('proxyquire').noCallThru(),
	config = require('../../app/config/config'),
	cookieParser = require('cookie-parser'),
	Q = require('q'),
	should = require('should'),
	querystring = require('querystring'),
	constants = require('../../app/config/constants'),
	userMock = {
		refresh_token: 'refresh_token',
		user_id: 1
	},
	user = proxyquire('../../app/scripts/user', {
		'./../util/repository': {
			get: function(){
				var defer = Q.defer();

				defer.resolve(JSON.stringify(userMock));

				return defer.promise;
			}
		}
	}),
	request = require('supertest')('http://localhost:3000');

describe('User request', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(function(req, res, next){
			req.options = {
				host: config.api_domains.auth.options.host,
				path: '/users'
			};
			req.cookies['access_token'] = 'some token';
			next();
		});
		app.use(user);
		app.all('/', function(req, res){
			res.send(200, {
				body: req.body,
				options: req.options
			});
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should return user details by making a POST proxy request with refresh token', function(done){
		request
			.get('/')
			.expect(200, function(err, res){
				var response = res.body;

				var body = querystring.stringify({
						refresh_token: userMock.refresh_token,
						grant_type: constants.AUTH_REFRESH_TOKEN_NAME
					}),
					options = {
						host: config.api_domains.auth.options.host,
						port: 443,
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': Buffer.byteLength(body)
						},
						path: constants.REFRESH_TOKEN_PATH,
						method: 'POST'
					};

				should(response.options).containDeep(options);
				should(response.body).containDeep(body);

				done();
			});
	});

	it('should append the user ID to the user get request', function(done){
		request
			.get('/')
			.query({'no-cache': 1})
			.expect(200, function(err, res){
				should(res.body.options.path).be.exactly('/users/' + userMock.user_id);
				done();
			});
	});

});