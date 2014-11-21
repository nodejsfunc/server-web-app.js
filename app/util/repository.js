'use strict';

var constants = require('./../config/constants'),
	// Redis config will not be refreshed on require cache invalidation:
	config = require('./../config/config'),
	redis = require('redis').createClient(config.databasePort, config.databaseDomain),
	logger = require('./../util/logger'),
	Q = require('q');

redis.on('connect', function () {
	logger.notice('Redis connection established');
});
redis.on('reconnecting', function () {
	logger.notice('Reconnecting to Redis...');
});
redis.on('error', function redisError (error) {
	var message = String(error),
			logType = /connection/.test(message) ? 'emergency' : 'critical';
	logger[logType](message);
});
redis.on('end', function () {
	logger.notice('Redis connection closed');
});

module.exports = {
	set: function(key, value){
		if (key && value) {
			// all redis entries are deleted after a certain time
			redis.set(key, value, 'PX', constants.AUTH_MAX_AGE);
		} else {
			logger.error('Invalid arguments for redis SET command. (key: "' + key + '", value: "' + value + '")');
		}
	},
	get: function(key){
		var defer = Q.defer();

		redis.get(key, function(err, reply){
			if(! err){
				defer.resolve(reply);
			} else {
				defer.reject(err);
			}
		});

		return defer.promise;
	},
	del: function(key){
		redis.del(key || null);
	},
	exists: function(key){
		var defer = Q.defer();

		redis.exists(key, function(err, reply){
			if(!err){
				defer.resolve(reply);
			} else {
				defer.reject(err);
			}
		});

		return defer.promise;
	}
};