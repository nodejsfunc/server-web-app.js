'use strict';

var constants = require('./../config/constants'),
	config = require('./../config/config'),
	redis = require('redis').createClient(config.databasePort, config.databaseDomain),
	bugsense = require('./../util/bugsense'),
	Q = require('q');

redis.on('error', function redisError(error){
	console.log('\u001b[31m', 'Redis error --> ', error, '\u001b[0m');
	bugsense.logError(error);
});

module.exports = {
	set: function(key, value){
		if(key && value){
			// all redis entries are deleted after a certain time
			redis.set(key, value, 'PX', constants.AUTH_MAX_AGE);
		} else {
			console.log('Error options for redis SET', key, '-', value);
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