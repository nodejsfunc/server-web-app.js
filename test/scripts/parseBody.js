'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/parseBody'),
	path = '/path',
	bodyParser = require('body-parser'),
	querystring = require('querystring'),
	request = require('supertest')('http://localhost:3000');

describe('Parse body', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(bodyParser());
		app.use(middleware);
		app.post(path, function(req, res){
			res.send(200, req.body)
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should parse the body of the request sugin querystring', function(done){
		var body = {
			some_body: 1
		};

		request
			.post(path)
			.send(body)
			.expect(200, querystring.stringify(body), done);
	});
});