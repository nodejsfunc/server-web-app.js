'use strict';

var package_json = require('./../../package.json');

module.exports = {
	APP_NAME: package_json.name,
	APP_VERSION: package_json.version,
	TOKEN_STORAGE_VERSION : '3.0.0',
	AUTH_ACCESS_TOKEN_NAME : 'access_token',
	AUTH_REFRESH_TOKEN_NAME : 'refresh_token',
	AUTH_PATH_COMPONENT : 'oauth2',
	AUTH_USERS_PATH : '/auth/users',
	AUTH_PARAM_REMEMBER_ME : 'remember_me',
	BBB_CONTENT_TYPE : 'application/vnd.blinkboxbooks.data',
	AUTH_MAX_AGE : 1000*60*60*24*14, // 14 days
	REFRESH_TOKEN_PATH: '/oauth2/token',
  REVOKE_REFRESH_TOKEN: '/tokens/revoke',
	LOCAL_PATH : '/api/local',
	SIGN_OUT_PATH : '/signout',
	BASE_PATH: '/api',
	CLIENT_CONFIG_PATH: '/config',
	LOG_PATH: '/log',
	CREDIT_CARD_PATH: '/service/my/creditcards',
  VOUCHER_REDEMPTION_PATH: '/service/gifting/voucher/',
	BASKET_PATH: '/service/my/baskets',
	PURCHASE_PATH: '/service/my/payments',
	CLUBCARD_PATH: '/service/my/clubcards',
	CLUBCARD_VALIDATION_PATH: '/service/clubcards/validation',
	LIBRARY_PATH: '/service/my/library',
	ADMIN_PATH: '/service/admin/users/',
	ADMIN_CREDIT_PATH: 'credit',
	NO_TOKEN: 'Bearer'
};
