'use strict';

var config = require('./../config/config');
var constants = require('../../app/config/constants');
var Q = require('q');
var request = require('request');

function revokeRefreshTokenURL(){
  var port = config.domains.auth.options.port;
  var scheme = (port === 443) ? 'https' : 'http';

  return scheme + '://' + config.domains.auth.options.host + ':' + port + constants.REVOKE_REFRESH_TOKEN;
}

module.exports = {
  revokeRefreshToken: function(refresh_token){
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