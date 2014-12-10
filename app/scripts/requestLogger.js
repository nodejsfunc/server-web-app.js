'use strict';

var finished = require('finished'),
		http = require('http'),
		logger = require('./../util/logger'),
		constants = require('./../config/constants.js'),
		crypto = require('crypto');

function responseTime(start) {
	var diff = process.hrtime(start),
			ms = diff[0] * 1e3 + diff[1] * 1e-6;
	return Math.round(ms);
}

module.exports = function (req, res, next) {
	var startAt = process.hrtime(),
			timestamp = Date.now(),
			startDate = new Date(timestamp),
			url = req.originalUrl || req.url;
	finished(res, function () {
		var appTime = responseTime(startAt),
			statusCode = res.statusCode,
			responseHeaders = res._headers || {},
			log = {
				userId: req._userId,
				timestamp: timestamp,
				datetime: startDate,
				httpClientIP: req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress),
				httpMethod: req.method,
				httpVersion: req.httpVersionMajor + '.' + req.httpVersionMinor,
				httpStatus: statusCode,
				httpStatusName: http.STATUS_CODES[statusCode],
				httpPathAndQuery: url,
				httpPath: url.replace(/\?.*$/, ''),
				httpAcceptEncoding: req.headers['accept-encoding'],
				httpUserAgent: req.headers['user-agent'],
				httpVia: req.headers.via,
				httpXForwardedFor: req.headers['x-forwarded-for'],
				httpXRequestedWith: req.headers['x-requested-with'],
				httpXRequestedBy: req.headers['x-requested-by'],
				httpCacheControl: responseHeaders['cache-control'],
				httpContentLength: Number(responseHeaders['content-length']),
				httpWWWAuthenticate: responseHeaders['www-authenticate'],
				httpApplicationTime: appTime
			},
			message = [
				log.httpMethod,
				log.httpPathAndQuery,
				'returned',
				log.httpStatus,
				log.httpStatusName,
				'in',
				log.httpApplicationTime + 'ms'
			].join(' '),
			logType = 'info';

		if(req.cookies && req.cookies[constants.AUTH_ACCESS_TOKEN_NAME]){
			var shasum = crypto.createHash('sha1');
			shasum.update(req.cookies[constants.AUTH_ACCESS_TOKEN_NAME], 'utf8');
			log.tokenHash = shasum.digest('hex');
		}

		if (statusCode >= 500) {
			logType = 'error';
		} else if (statusCode >= 400 && statusCode !== 401) {
			logType = 'warning';
		}
		logger[logType](message, log);
	});
	next();
};
