'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/csrfHeader'),
	request = require('supertest')('http://localhost:3000');

describe('CSFR security test', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(middleware);
		app.get('/', function(req, res){
			res.send(200);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should refuse connection', function(done){
		request
			.get('/')
			.expect(403, done);
	});

	it('should accept connection', function(done){
		request
			.get('/')
			.set('x-requested-by', 'blinkbox')
			.expect(200, done);
	});


});