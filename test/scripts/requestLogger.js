'use strict';

var express = require('express'),
		middleware = require('../../app/scripts/requestLogger'),
		request = require('supertest')('http://localhost:3000'),
		sinon = require('sinon'),
		logger = require('../../app/util/logger');

describe('Request logging test', function () {

	var server;

	beforeEach(function () {
		sinon.spy(logger, 'info');
		sinon.spy(logger, 'warn');
		sinon.spy(logger, 'error');
		var app = express();
		app.use(middleware);
		app.get('/', function (req, res) {
			res.send(200);
		});
		app.get('/404', function (req, res) {
			res.send(404);
		});
		app.get('/500', function (req, res) {
			res.send(500);
		});
		server = app.listen(3000);
	});

	afterEach(function () {
		server.close();
		logger.error.restore();
		logger.warn.restore();
		logger.info.restore();
	});

	it('should log request meta data with info level', function (done) {
		request
			.get('/')
			.set({
				'user-agent': 'banana user agent',
				'x-requested-by': 'blinkbox'
			})
			.expect(200, function () {
				sinon.assert.calledOnce(logger.info);
				sinon.assert.calledWithMatch(logger.info, '', {
					appName: 'SWA',
					httpAcceptEncoding: 'gzip, deflate',
					httpUserAgent: 'banana user agent',
					httpXRequestedBy: 'blinkbox',
					httpStatus: 200
				});
				done();
			});
	});

	it('should log request meta data with warn level', function (done) {
		request
			.get('/404')
			.set({
				'user-agent': 'banana user agent',
				'x-requested-by': 'blinkbox'
			})
			.expect(404, function () {
				sinon.assert.calledOnce(logger.warn);
				sinon.assert.calledWithMatch(logger.warn, '', {
					appName: 'SWA',
					httpAcceptEncoding: 'gzip, deflate',
					httpUserAgent: 'banana user agent',
					httpXRequestedBy: 'blinkbox',
					httpStatus: 404
				});
				done();
			});
	});

	it('should log request meta data with error level', function (done) {
		request
			.get('/500')
			.set({
				'user-agent': 'banana user agent',
				'x-requested-by': 'blinkbox'
			})
			.expect(500, function () {
				sinon.assert.calledOnce(logger.error);
				sinon.assert.calledWithMatch(logger.error, '', {
					appName: 'SWA',
					httpAcceptEncoding: 'gzip, deflate',
					httpUserAgent: 'banana user agent',
					httpXRequestedBy: 'blinkbox',
					httpStatus: 500
				});
				done();
			});
	});

});
