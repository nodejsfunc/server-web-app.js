'use strict';

var graylog2 = require('graylog2'),
		config = require('../config/config'),
		logger;

// Only add the graylog config if we have valid server settings:
if (config.graylog.host && config.graylog.port) {
	logger = new graylog2.graylog({servers: [config.graylog]});
	logger.on('error', function (err) {
		console.error('Error while trying to write to graylog2:', err);
	});
} else {
	// Log to console if not logging to Graylog2:
	logger = {
		emergency: function () {
			console.error.apply(console, arguments);
		},
		critical: function () {
			console.error.apply(console, arguments);
		},
		error: function () {
			console.error.apply(console, arguments);
		},
		warn: function () {
			console.warn.apply(console, arguments);
		},
		notice: function () {
			console.log.apply(console, arguments);
		},
		info: function () {
			console.info.apply(console, arguments);
		}
	};
}

module.exports = logger;
