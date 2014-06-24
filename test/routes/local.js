'use strict';

var express = require('express'),
	constants = require('../../app/config/constants'),
	config = require('../../app/config/config'),
	should = require('should'),
	cookieParser = require('cookie-parser'),
	routes = require('../../app/routes'),
	request = require('supertest')('http://localhost:3000');

describe('Local routing', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(constants.LOCAL_PATH, routes.local);
		server = app.listen(3005);
	});

	afterEach(function(){
		server.close();
	});

	it('should return local config object', function(done){
		request
			.get(constants.LOCAL_PATH + constants.CLIENT_CONFIG_PATH)
			.expect(200, function(err, res){
				should.not.exist(err);
				should(res.body).containDeep(config.clientConfig);
				done();
			});
	});

	it('should remove acces_token cookie', function(done){
		request
			.get(constants.LOCAL_PATH + constants.SIGN_OUT_PATH)
			.expect('set-cookie', /access_token=; Path=\/api;/)
			.expect(200, done);
	});

});