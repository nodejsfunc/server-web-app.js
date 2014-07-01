'use strict';

var config = require('./../config/config');
var constants = require('../../app/config/constants');
var Q = require('q');
var request = require('request');
var extend = require('extend');

function revokeRefreshTokenURL(){
  var scheme = 'http';
  var port = config.api_domains.auth.options.port;

  (port === 443) ? scheme = 'https' : scheme = 'http';

  return scheme + '://' + config.api_domains.auth.options.host + ':' + port + constants.REVOKE_REFRESH_TOKEN;
}

module.exports = {
  revokeRefreshToken: function(refresh_token, overideConfig){
    if (typeof(overideConfig) !== 'undefined') {
      config = overideConfig;
    }

    var deferred = Q.defer();

    request.post({
      url: revokeRefreshTokenURL(),
      form: {
        refresh_token: refresh_token
      }
    },
      function(err, res){
        if (err) { return deferred.reject(err); }

        if (res.statusCode === 200) {
          return deferred.resolve();
        }

        return deferred.reject();
      });

    return deferred.promise;
  }
};