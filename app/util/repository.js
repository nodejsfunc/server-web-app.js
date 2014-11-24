'use strict';

var constants = require('./../config/constants'),
	config = require('./../config/config'),
	redis = require('redis').createClient(config.databasePort, config.databaseDomain),
	logger = require('./../util/logger'),
	Q = require('q'),
	crypto = require('crypto');

var start = process.hrtime();
var end;

function hash(obj){
	if(typeof obj === 'string'){
		var shasum = crypto.createHash('sha1');
		shasum.update(obj, 'utf8');
		return shasum.digest('hex');
	}
}


/*
 client will emit ready a connection is established to the Redis server and the server reports that it is ready to
 receive commands. Commands issued before the ready event are queued, then replayed just before this event is emitted.
 */
redis.on('ready', function () {
	logger.notice('Redis: ready');
	var diff = process.hrtime(start),
		ms = diff[0] * 1e3 + diff[1] * 1e-6;
	logger.info('Redis: Took ' + Math.round(ms) + 'ms to (re)connect');
});

/*
 client will emit connect at the same time as it emits ready unless client.options.no_ready_check is set. If this
 options is set, connect will be emitted when the stream is connected, and then you are free to try to send commands.
 */
redis.on('connect', function () {
	logger.notice('Redis: connect - connection established');
});


redis.on('reconnecting', function () {
	start = process.hrtime();
	logger.notice('Redis: reconnecting');
});

/*
 client will emit error when encountering an error connecting to the Redis server.
 */
redis.on('error', function (error) {
	var message = String(error),
			logType = /connection/.test(message) ? 'emergency' : 'critical';
	logger[logType]('Redis: error - ' + message, error);
});

/*
 client will emit end when an established Redis server connection has closed.
 */
redis.on('end', function () {
	logger.notice('Redis: end - connection closed');
});

/*
 client will emit drain when the TCP connection to the Redis server has been buffering, but is now writable
 */
redis.on('drain', function(){
	logger.notice('Redis: drain - TCP connection writeable');
});

/*
 client will emit idle when there are no outstanding commands that are awaiting a response.
 */
redis.on('idle', function(){
	logger.notice('Redis: idle - no outstanding requests');
});

module.exports = {
	set: function(key, value){
		if (key && value) {
			var keyHash = hash(key),
				valueHash = hash(value);

			// all redis entries are deleted after a certain time
			logger.info('Redis: calling set - sha1(key): ' + keyHash + ', sha1(value): ' + valueHash + ', PX ' + constants.AUTH_MAX_AGE);
			redis.set(key, value, 'PX', constants.AUTH_MAX_AGE, function(result){
				logger.info('Redis: set - sha1(key): ' + keyHash + ', sha1(value): ' + valueHash + ', PX ' + constants.AUTH_MAX_AGE + '): Returned ' + hash(result));
			});
		} else {
			logger.error('Invalid arguments for redis SET command. (key: "' + key + '", value: "' + value + '")');
		}
	},
	get: function(key){
		var defer = Q.defer();
		var keyHash = hash(key);
		logger.info('Redis: Calling get key (sha1): ' +  keyHash);
		redis.get(key, function(err, reply){
			logger.info('Redis: get ' + keyHash + ' returned ' + hash(err? err : reply));
			if(! err){
				defer.resolve(reply);
			} else {
				defer.reject(err);
			}
		});

		return defer.promise;
	},
	del: function(key){
		var keyHash = hash(key);
		logger.info('Redis: calling delete key (sha1): '+ keyHash);
		redis.del(key || null, function(){
			logger.info('Redis: delete ' + keyHash + ' returned '+ JSON.stringify(arguments) );
		});
	},
	exists: function(key){
		var defer = Q.defer();
		var keyHash = hash(key);
		logger.info('Redis: calling exists key (sha1): ' + keyHash );
		redis.exists(key, function(err, reply){
			logger.info('Redis: exists ' + keyHash + ' returned ' + (err? err : reply));
			if(!err){
				defer.resolve(reply);
			} else {
				defer.reject(err);
			}
		});

		return defer.promise;
	}
};