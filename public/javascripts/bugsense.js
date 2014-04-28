'use strict';

var request = require('request'), pjson = require('../../package.json');

var errObject = {
  client: {
    name: pjson.name || 'node', // Obligatory
    version: pjson.version || 'version'
  },
  exception: {
    message: '', // Obligatory
    where: '', // Obligatory
    klass: '', // Type of exception
    backtrace: '' // Obligatory
  },
  application_environment: {
    phone: 'node', // Device model (could be PC or Max) Obligatory
    appver: process.version, // Obligatory
    appname: 'node', // Obligatory
    osver: process.platform // Obligatory
  }
};

var Bugsense = {

  apiKey     : 'FOOBAR',
  url        : 'https://www.bugsense.com/api/errors',
  appversion : null,
  callback   : null,
  headers    : {'X-BugSense-Api-Key': 'FOOBAR', 'Content-Type': 'application/x-www-form-urlencoded'},

  setAPIKey: function(apiKey) {

    this.apiKey = apiKey;
    this.headers = {'X-BugSense-Api-Key': this.apiKey};
    return this;

  },
  logError: function(error) {

    errObject.exception.message = error.message;
    errObject.exception.where = error.stack.split('at')[1];
    errObject.exception.klass = error.type;
    errObject.exception.backtrace = error.stack;
    console.log(errObject);

    request.post({url:this.url, headers:this.headers, json:errObject}, function (err, res, body) {
      console.log(body);
    });

  }

};


module.exports = Bugsense;

