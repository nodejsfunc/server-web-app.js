'use strict';

var merchant_arg = process.argv.indexOf('-merchantKey'),
	google_arg = process.argv.indexOf('-googleAnalyticsID'),
	graylog_host_arg = process.argv.indexOf('-graylogHost'),
	graylog_host = graylog_host_arg !== -1 && process.argv[graylog_host_arg + 1],
	graylog_port_arg = process.argv.indexOf('-graylogPort'),
	graylog_port = graylog_host_arg !== -1 && Number(process.argv[graylog_port_arg + 1]),
	config = require('./config.json'),
	result = {
		api_domains: config.domains,
		api_timeout: config.timeout || 10,
		databaseDomain: config.databaseDomain,
		databasePort: config.databasePort,
		newRelicKey: config.newRelicKey || '',
		// Only add the graylog config if we have valid server environment arguments:
		graylog: graylog_host && graylog_port && {
			servers:[
				{host: graylog_host, port: graylog_port}
			]
		},
		// Override the client config if defined in the command line parameters
		clientConfig: {
			'merchantKey': merchant_arg !== -1 ? process.argv[merchant_arg + 1] : config.clientConfig.merchantKey,
			'googleAnalyticsID': google_arg !== -1 ? process.argv[google_arg + 1] : config.clientConfig.googleAnalyticsID,
			'nonSecureServicesDomain': config.clientConfig.nonSecureServicesDomain
		}
	};

module.exports = result;
