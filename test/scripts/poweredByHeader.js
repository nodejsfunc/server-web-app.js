'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/poweredByHeader'),
	request = require('supertest')('http://localhost:3000');

describe('Powered by header ', function(){

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

	it('should include version header', function(done){
		request
			.get('/')
			.expect(200, done);
	});

});