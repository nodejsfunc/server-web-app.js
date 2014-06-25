'use strict';

var config = require('./../config/config');
var constants = require('../../app/config/constants');
var Q = require('q');
var request = require('request');

function revokeRefreshTokenURL(){
  return 'https://' + config.api_domains.auth.options.host + constants.REVOKE_REFRESH_TOKEN;
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

        return deferred.reject(JSON.parse(res.body));
      });

    return deferred.promise;
  }
};