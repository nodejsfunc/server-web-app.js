'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/error'),
	request = require('supertest')('http://localhost:3000'),
	paths = {
		timeout: '/timeout',
		error: '/error'
	};

describe('Error handler', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(paths.timeout, function(req, res, next){
			next({
				timeout: 5
			});
		});
		app.use(paths.error, function(req, res, next){
			next({}); // random error
		});
		app.use(middleware);
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should return 504 when the error contains a timeout param', function(done){
		request
			.get(paths.timeout)
			.expect(504, done);
	});

	it('should return 500 when an unexpected error is generated', function(done){
		request
			.get(paths.error)
			.expect(500, done);
	});
});