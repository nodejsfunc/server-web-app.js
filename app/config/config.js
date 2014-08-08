'use strict';

var merchant_arg = process.argv.indexOf('-merchantKey'),
	google_arg = process.argv.indexOf('-googleAnalyticsID'),
	graylog_arg = process.argv.indexOf('-graylogHost'),
	graylog_config = graylog_arg !== -1 ? process.argv[graylog_arg + 1].split(':') : [],
	config = require('./config.json'),
	result = {
		api_domains: config.domains,
		api_timeout: config.timeout || 10,
		databaseDomain: config.databaseDomain,
		databasePort: config.databasePort,
		newRelicKey: config.newRelicKey || '',
		graylog: {
			host: graylog_config[0] || config.graylog.host,
			port: graylog_config[1] || config.graylog.port
		},
		// Override the client config if defined in the command line parameters
		clientConfig: {
			'merchantKey': merchant_arg !== -1 ? process.argv[merchant_arg + 1] : config.clientConfig.merchantKey,
			'googleAnalyticsID': google_arg !== -1 ? process.argv[google_arg + 1] : config.clientConfig.googleAnalyticsID,
			'nonSecureServicesDomain': config.clientConfig.nonSecureServicesDomain
		}
	};

module.exports = result;
