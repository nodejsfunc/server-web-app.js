'use strict';

try {
  var redis = require('redis').createClient(global.databasePort, global.databaseDomain);
  redis.on('error', function redisError(error){
    console.log('\u001b[31m', 'Redis error --> ', error.toString(), '\u001b[0m');
  });

  global.repository = {
    set: function(key, value){
      if(key && value){
        // all redis entries are deleted after a certain time
        redis.set(key, value, 'PX', global.const.AUTH_MAX_AGE);
      } else {
        console.log('Error options for redis SET', key, '-', value);
      }
    },
    get: function(key){
      var _onSuccess = null,
        _onError = null,
        _promise = {
          then: function(onSuccess, onError){
            _onSuccess = typeof onSuccess === 'function' ? onSuccess : null;
            _onError = typeof onError === 'function' ? onError : null;
            return _promise;
          }
        };
      redis.get(key, function(err, reply){
        if(!err){
          if(typeof _onSuccess === 'function'){
            _onSuccess(reply);
          }
        } else {
          if(typeof _onError === 'function'){
            _onError(err);
          }
        }
      });
      return _promise;
    },
    del: function(key){
      redis.del(key || null);
    },
    exists: function(key){
      var _onSuccess = null,
        _onError = null,
        _promise = {
          then: function(onSuccess, onError){
            _onSuccess = typeof onSuccess === 'function' ? onSuccess : null;
            _onError = typeof onError === 'function' ? onError : null;
            return _promise;
          }
        };
      redis.exists(key, function(err, reply){
        if(!err){
          if(typeof _onSuccess === 'function'){
            _onSuccess(reply);
          }
        } else {
          if(typeof _onError === 'function'){
            _onError(err);
          }
        }
      });
      return _promise;
    }
  };
} catch (error) {
  if (global.bugsenseKey) {
    global.bugsense.logError(error);
  }
}