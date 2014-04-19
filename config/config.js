'use strict';

var merchant_arg = process.argv.indexOf('-merchantKey'),
	google_arg = process.argv.indexOf('-googleAnalyticsID'),
	bugsense_arg = process.argv.indexOf('-bugsenseKey'),
	config = require('./config.json'),
	result = {
	api_domains: config.domains,
	api_timeout: config.timeout || 10,
	databaseDomain: config.databaseDomain,
	databasePort: config.databasePort,
	newRelicKey: config.newRelicKey || '',
	// Override the client config if defined in the command line parameters
	clientConfig: {
		'merchantKey': merchant_arg !== -1 ? process.argv[merchant_arg + 1] : config.clientConfig.merchantKey,
		'googleAnalyticsID': google_arg !== -1 ? process.argv[google_arg + 1] : config.clientConfig.googleAnalyticsID,
		'nonSecureServicesDomain': config.clientConfig.nonSecureServicesDomain,
		'bugsenseKey': bugsense_arg !== -1 ? process.argv[bugsense_arg + 1] : config.clientConfig.bugsenseKey
	}
};

// bugsense api key is hard-coded for live, until ops adds the command line param
global.clientConfig.bugsenseKey = !global.clientConfig.bugsenseKey && global.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com' ? '9fa7c727' : config.clientConfig.bugsenseKey;
global.bugsenseKey =  global.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com'? '649f61e5': '';result.clientConfig.bugsenseKey = !result.clientConfig.bugsenseKey && result.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com' ? '9fa7c727' : result.clientConfig.bugsenseKey;

module.exports = result;