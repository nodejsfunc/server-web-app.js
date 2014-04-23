'use strict';

var bugsense = require('node-bugsense'),
	isRegistered = false;

module.exports = {
	register: function(bugsenseKey){
		if (bugsenseKey) {
			bugsense.setAPIKey(bugsenseKey);
			isRegistered = true;

			//catch all errors in the application
			process.on('uncaughtException', function (error) {
				bugsense.logError(error);
			});
		}
	},
	logError: function(error){
		if(isRegistered){
			bugsense.logError(error);
		}
	}
};