'use strict';

var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	config = require('../../app/config/config'),
	constants = require('../../app/config/constants'),
	routes = require('../../app/routes'),
	mocks = require('../mocks'),
	nock = require('nock'),
	path = 'path',
	request = require('supertest')('http://localhost:3000');

describe('Handle 401', function(){

	var server, domains = Object.keys(config.api_domains);

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(bodyParser());
		app.use(function(req, res, next){
			req.cookies['access_token'] = 'some token';
			next();
		});
		app.use(routes.services);
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	for(var i = 0, l = domains.length; i < l; i++){
		(function(domain){
			if(config.api_domains[domain].options.port === 443){
				it('should automatically refresh token and set new cookie for /' + domain + '/path', function(done){
					var api = config.api_domains[domain],
						test = (api.root && '/' + api.root) + '/' + path;

					// original request mocked with 401 response and invalid token header
					nock('https://' + api.options.host)
						.get(test)
						.matchHeader('Authorization', 'Bearer some token')
						.reply(401, {}, {
							'www-authenticate': constants.INVALID_TOKEN
						});

					// when attempting to refresh the token, return a new token
					nock('https://' + config.api_domains.auth.options.host)
						.post(constants.REFRESH_TOKEN_PATH)
						.reply(200, mocks.REFRESH);

					// second request with new access token gets a 200
					nock('https://' + api.options.host)
						.get(test)
						.matchHeader('Authorization', 'Bearer ' + mocks.REFRESH.access_token)
						.reply(200);

					// all this happens in one request
					request
						.get('/' + domain + '/' + path)
						.expect(200, done);

				});
			}
		})(domains[i]);
	}

});