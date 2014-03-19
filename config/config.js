'use strict';

/**
 * Load configuration file
 */

var merchant_arg = process.argv.indexOf('-merchantKey');
var google_arg = process.argv.indexOf('-googleAnalyticsID');
var bugsense_arg = process.argv.indexOf('-bugsenseKey');
var config = require('../config/config.json');
global.api_domains = config.domains;
global.api_timeout = config.timeout || 10;
global.databaseDomain = config.databaseDomain;
global.databasePort = config.databasePort;
global.newRelicKey = config.newRelicKey || "";

// Override the client config if defined in the command line parameters
global.clientConfig = {
	'merchantKey': merchant_arg !== -1 ? process.argv[merchant_arg + 1] : config.clientConfig.merchantKey,
	'googleAnalyticsID': google_arg !== -1 ? process.argv[google_arg + 1] : config.clientConfig.googleAnalyticsID,
	'nonSecureServicesDomain': config.clientConfig.nonSecureServicesDomain,
	'bugsenseKey': bugsense_arg !== -1 ? process.argv[bugsense_arg + 1] : config.clientConfig.bugsenseKey
};

// bugsense api key is hard-coded for live, until ops adds the command line param
global.clientConfig.bugsenseKey = !global.clientConfig.bugsenseKey && global.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com' ? '9fa7c727' : config.clientConfig.bugsenseKey;


