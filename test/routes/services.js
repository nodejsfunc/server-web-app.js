'use strict';

var express = require('express'),
	route = require('../../app/routes/services'),
	config = require('../../app/config/config'),
	request = require('supertest')('http://localhost:3000'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	querystring = require('querystring'),
	nock = require('nock'),
	mock = {
		path: 'path',
		response: 'some response body',
		request: {'some request body': 1}
	},
	methods = ['get', 'patch', 'delete', 'post'];

describe('Services', function(){

	var server, i, l, domains = Object.keys(config.api_domains);

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

	var _proxyTest = function(domain){
		var	proxy = config.api_domains[domain].options.port === 443 ? 'https' : 'http';
		proxy += '://' + config.api_domains[domain].options.host;

		describe('should make proxy requests for /' + domain + '/path', function(){
			var _test = function(method){
				it(method.toUpperCase(), function(done){
					// mock proxy request
					nock(proxy)
						.intercept((config.api_domains[domain].root && '/' + config.api_domains[domain].root) + '/' + mock.path, method)
						.reply(200, mock.response);

					request[method]('/' + domain + '/' + mock.path)
						.expect(200, mock.response, done);
				});
			};

			for(var i = 0, l = methods.length; i < l; i++){
				_test(methods[i]);
			}
		});
	};

	for(i = 0, l = domains.length; i < l; i++){
		_proxyTest(domains[i]);
	}


	var _headerTest = function(domain){
		var	proxy = config.api_domains[domain].options.port === 443 ? 'https' : 'http';
		proxy += '://' + config.api_domains[domain].options.host;

		describe('should copy request headers and return proxy response headers for /' + domain + '/path', function(){
			var _test = function(method){
				it(method.toUpperCase(), function(done){
					// mock proxy request
					nock(proxy)
						.intercept((config.api_domains[domain].root && '/' + config.api_domains[domain].root) + '/' + mock.path, method)
						.matchHeader('x-server-request', 'blinkbox')
						.reply(200, mock.response, {
							'x-server-response': 'blinkbox'
						});

					request[method]('/' + domain + '/' + mock.path)
						.set('x-server-request', 'blinkbox')
						.expect('x-server-response', 'blinkbox')
						.expect(200, mock.response, done);
				});
			};
			for(var i = 0, l = methods.length; i < l; i++){
				_test(methods[i]);
			}
		});
	};

	for(i = 0, l = domains.length; i < l; i++){
		_headerTest(domains[i]);
	}

	methods = ['post', 'patch']; // only testing these methods now

	var _bodyTest = function(domain){
		var	proxy = config.api_domains[domain].options.port === 443 ? 'https' : 'http';
		proxy += '://' + config.api_domains[domain].options.host;

		describe('should send the body of the request with the proxy for /' + domain + '/path', function(){
			var _test = function(method){
				it(method.toUpperCase(), function(done){
					// mock proxy request
					// the body is transformed by nodejs using the querystring
					nock(proxy)
						.intercept((config.api_domains[domain].root && '/' + config.api_domains[domain].root) + '/' + mock.path, method, querystring.stringify(mock.request))
						.reply(200, mock.response);

					request[method]('/' + domain + '/' + mock.path)
						.send(mock.request)
						.expect(200, mock.response, done);
				});
			};

			for(var i = 0, l = methods.length; i < l; i++){
				_test(methods[i]);
			}
		});
	};

	for(i = 0, l = domains.length; i < l; i++){
		_bodyTest(domains[i]);
	}
});