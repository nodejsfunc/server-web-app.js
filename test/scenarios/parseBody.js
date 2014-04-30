'use strict';

var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	config = require('../../app/config/config'),
	constants = require('../../app/config/constants'),
	reverse = require('../../app/scripts/reverse'),
	paths = [
		constants.CREDIT_CARD_PATH,
		constants.BASKET_PATH,
		constants.PURCHASE_PATH,
		constants.CLUBCARD_PATH,
		constants.CLUBCARD_VALIDATION_PATH,
		constants.LIBRARY_PATH,
		constants.ADMIN_PATH + '/1/' + constants.ADMIN_CREDIT_PATH
	],
	body = {
		test: 1
	},
	querystring = require('querystring'),
	request = require('supertest')('http://localhost:3000');

describe('Parse body', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(bodyParser());
		app.use('/:domain/*', function(req, res, next){
			req.options = {
				host: config.api_domains['secure-service'].options.host,
				path: req.params[0],
				headers: {}
			};
			next();
		});
		app.use('/:domain/*', reverse);
		app.post('/:domain/*', function(req, res){
			res.send(201, req.body);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should querystring the body by default', function(done){
		request
			.post('/domain/random_path')
			.send(body)
			.expect(201, querystring.stringify(body), done);
	});

	var _test = function(path){
		it('should JSON stringify the body for ' + path , function(done){
			request
				.post('/domain/' + path)
				.set('accept', 'application/json')
				.send(body)
				.expect(201, JSON.stringify(body), done);
		});
	};

	for(var i = 0, l = paths.length; i < l; i++){
		_test(paths[i]);
	}

});