'use strict';

var express = require('express'),
	route = require('../../app/routes/services'),
	config = require('../../app/config/config'),
	request = require('supertest')('http://localhost:3000'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	nock = require('nock'),
	mock = {
		path: 'path',
		response: 'some response'
	},
	methods = ['get', 'patch', 'delete', 'post'];

	describe('Services', function(){

		var server, domains = Object.keys(config.api_domains);

		beforeEach(function(){
			var app = express();
			app.use(cookieParser());
			app.use(bodyParser());
			app.use(route);
			server = app.listen(3000);
		});

		afterEach(function(){
			server.close();
		});

		// todo add more rigurous tests, like comparing headers between the req and proxy
		for(var i = 0, l = domains.length; i < l; i++){
			(function(domain){
				var	proxy = config.api_domains[domain].options.port === 443 ? 'https' : 'http';
				proxy += '://' + config.api_domains[domain].options.host;

				describe('should make proxy requests for /' + domain + '/path', function(){
					for(var i = 0, l = methods.length; i < l; i++){
						(function(method){
							it(method.toUpperCase(), function(done){
								// mock proxy request
								nock(proxy)
									.intercept((config.api_domains[domain].root && '/' + config.api_domains[domain].root) + '/' + mock.path, method)
									.reply(200, mock.response);

								request[method]('/' + domain + '/' + mock.path)
									.expect(200, mock.response, done);
							});
						})(methods[i]);
					}
				});
			})(domains[i]);
		}
});