'use strict';

var express = require('express'),
	config = require('../../app/config/config'),
	middleware = require('../../app/scripts/options'),
	cookieParser = require('cookie-parser'),
	path = '/:domain/*',
	extend = require('extend'),
	should = require('should'),
	cookie = 'some cookie',
	request = require('supertest')('http://localhost:3000');

describe('Options ', function(){

	var server, domains = Object.keys(config.api_domains);

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(path, function(req, res, next){
			req.cookies.access_token = cookie;
			next();
		});
		app.use(path, middleware);
		app.get(path, function(req, res){
			res.send(200, req.options);
		});
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	var _test = function (domain) {
		it('should create options obj for /' + domain, function (done) {

			// build expected options
			// should derive from the original static options
			var options = extend(true, {}, config.api_domains[domain].options);

			// should have original request headers (default and custom)
			options.headers = {
				'x-custom-header': 1
			};

			// should include request method
			options.method = 'GET';

			// should include path
			options.path = (config.api_domains[domain].root && '/' + config.api_domains[domain].root) + '/path';

			// should transform cookie into auth header
			if (options.port !== 80) {
				options.headers.Authorization = 'Bearer ' + cookie;
			}

			request
				.get('/' + domain + '/path')
				.set('x-custom-header', 1)
				.expect(200, function (err, res) {
					// check every property in options and verifies it against the response body
					should(res.body).containDeep(options);
					done();
				});
		});
	};
	for(var i = 0, l = domains.length; i < l; i++){
		_test(domains[i]);
	}

});