'use strict';

var express = require('express'),
	cookieParser = require('cookie-parser'),
	routes = require('../../app/routes'),
	request = require('supertest')('http://localhost:3000');

describe('Automatic token refresh', function(){

	var server;

	beforeEach(function(){
		var app = express();
		app.use(cookieParser());
		app.use(routes.services);
		server = app.listen(3000);
	});

	afterEach(function(){
		server.close();
	});

	it('should automatically refresh token and set new cookie', null);

});