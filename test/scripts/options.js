'use strict';

var express = require('express'),
	config = require('../../app/config/config'),
	middleware = require('../../app/scripts/options'),
	cookieParser = require('cookie-parser'),
	path = '/:domain/*',
	request = require('supertest')('http://localhost:3000');

describe('Options ', function(){

	var server, domains = Object.keys(config.api_domains);

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(path, middleware);
		app.get(path, function(req, res){
			res.send(200);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});


	for(var i = 0, l = domains.length; i < l; i++){
		(function(domain){
			it('should create options obj for /' + domain, function(done){
				request
					.get('/'+domain + '/path')
					.expect(200, done);
			});
		})(domains[i]);
	}

});