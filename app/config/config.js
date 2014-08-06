'use strict';

var merchant_arg = process.argv.indexOf('-merchantKey'),
	google_arg = process.argv.indexOf('-googleAnalyticsID'),
	bugsense_arg = process.argv.indexOf('-bugsenseKey'),
  affiliate_window_arg = process.argv.indexOf('-affiliateWindowID'),
	config = require('./config.json'),
	result = {
		api_domains: config.domains,
		api_timeout: config.timeout || 10,
		databaseDomain: config.databaseDomain,
		databasePort: config.databasePort,
		newRelicKey: config.newRelicKey || '',
		bugsenseKey: config.bugsenseKey || '',
		// Override the client config if defined in the command line parameters
		clientConfig: {
			'merchantKey': merchant_arg !== -1 ? process.argv[merchant_arg + 1] : config.clientConfig.merchantKey,
			'googleAnalyticsID': google_arg !== -1 ? process.argv[google_arg + 1] : config.clientConfig.googleAnalyticsID,
			'nonSecureServicesDomain': config.clientConfig.nonSecureServicesDomain,
			'bugsenseKey': bugsense_arg !== -1 ? process.argv[bugsense_arg + 1] : config.clientConfig.bugsenseKey,
      'affiliateWindow': affiliate_window_arg !== -1 ? process.argv[affiliate_window_arg + 1] : config.clientConfig.affiliateWindow
		}
	};

// bugsense api key is hard-coded for live, until ops adds the command line param
// disabled, see CWA-1659 result.clientConfig.bugsenseKey = !result.clientConfig.bugsenseKey && result.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com' ? '9fa7c727' : result.clientConfig.bugsenseKey;
result.bugsenseKey = !result.bugsenseKey && result.clientConfig.nonSecureServicesDomain === 'api.blinkboxbooks.com'? '649f61e5': '';

module.exports = result;

