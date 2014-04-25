'use strict';

var express = require('express'),
	proxyquire = require('proxyquire').noCallThru(),
	config = require('../../app/config/config'),
	cookieParser = require('cookie-parser'),
	userMock = proxyquire('../../app/scripts/user', {
		'./../util/repository': {
			get: function(){
				
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
		app.use(userMock);
		app.get('/', function(req, res){
			res.send(200);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should return user details by making a POST proxy request', function(done){
		request
			.get('/')
			.expect(200, done);
	});

});