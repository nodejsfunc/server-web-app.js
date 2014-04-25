'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/reverse'),
	config = require('../../app/config/config'),
	constants = require('../../app/config/constants'),
	should = require('should'),
	request = require('supertest')('http://localhost:3000');

describe('Reverse', function(){

	var server, paths = [
		constants.CREDIT_CARD_PATH,
		constants.BASKET_PATH,
		constants.PURCHASE_PATH,
		constants.CLUBCARD_PATH,
		constants.CLUBCARD_VALIDATION_PATH,
		constants.LIBRARY_PATH,
		constants.ADMIN_PATH + '/1/' + constants.ADMIN_CREDIT_PATH
	], headers = {
		accept: 'accept',
		type: 'type'
	};

	beforeEach(function(){
		var app = express();
		app.use('/:domain/*', function(req, res, next){
			req.options = {
				host: config.api_domains['secure-service'].options.host,
				path: req.params[0],
				headers: {}
			};
			next();
		});
		app.use('/:domain/*', middleware);
		app.post('/:domain/*', function(req, res){
			res.send(201, req.options);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should not reverse headers for all paths', function(done){
		request
			.post('/domain/random_path')
			.set('accept', headers.accept)
			.set('content-type', headers.type)
			.expect(201, function(err, res){
				should(res.body.headers['content-type']).not.be.exactly(headers.accept);
				done();
			});
	});

	for(var i = 0, l = paths.length; i < l; i++){
		(function(path){
			it('should reverse accept and content type header for ' + path, function(done){
				request
					.post('/domain/' + path)
					.set('accept', headers.accept)
					.set('content-type', headers.type)
					.expect(201, function(err, res){
						should(res.body.headers['content-type']).be.exactly(headers.accept);
						done();
					});
			});
		})(paths[i]);
	}

});