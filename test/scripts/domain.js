'use strict';

var express = require('express'),
	middleware = require('../../app/scripts/domain'),
	config = require('../../app/config/config'),
	request = require('supertest')('http://localhost:3000');

describe('Domain', function(){

	var server, domains = Object.keys(config.api_domains);

	beforeEach(function(){
		var app = express();
		app.use('/:domain/*', middleware);
		app.get('/:domain/*', function(req, res){
			res.send(200);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should return 404 when the domain is not registered in config.json', function(done){
		request
			.get('/')
			.expect(404);

		request
			.get('/invalidDomain')
			.expect(404, done);
	});

	for(var i = 0, l = domains.length; i < l; i++){
		(function(domain){
			it('should accept connections for /' + domain + '/path', function(done){
				request
					.get('/' + domain + '/path')
					.expect(200, done);
			});
		})(domains[i]);
	}

});