'use strict';

var constants = require('./../config/constants'),
	config = require('./../config/config'),
	querystring = require('querystring');

module.exports = function(req, res, next){

	// the bodyparser of express.js is unable to parse anything other than JSON or form parameters (req.body is empty)
	// to enable custom content-types, that send raw data, we must set the accept header to the desired content-type (set by the request in Accept)
	// this app will replace the content type AFTER the bodyparser received the data in req.body
	// this is only required for POST/PATCH/DELETE
	if(/^(POST|PATCH|PUT)$/.test(req.method)){
		var _isCreditCardService = function(){
			return req.options.path.indexOf(constants.CREDIT_CARD_PATH) === 0;
		};
	
		var _isBasketService = function(){
			return req.options.path.indexOf(constants.BASKET_PATH) === 0;
		};
	
		var _isPurchaseService = function(){
			return req.options.path.indexOf(constants.PURCHASE_PATH) === 0;
		};
	
		var _isClubcardService = function(){
			return req.options.path.indexOf(constants.CLUBCARD_PATH) === 0;
		};
	
		var _isClubcardValidationService = function(){
			return req.options.path.indexOf(constants.CLUBCARD_VALIDATION_PATH) === 0;
		};
	
		var _isLibraryService = function(){
			return req.options.path.indexOf(constants.LIBRARY_PATH) === 0;
		};
	
		var _isAdminCreditService = function(){
			return req.options.path.indexOf(constants.ADMIN_PATH) === 0 && req.options.path.indexOf(constants.ADMIN_CREDIT_PATH) !== -1;
		};

    var _isVoucherRedemptionService = function(){
      return req.options.path.indexOf(constants.VOUCHER_REDEMPTION_PATH) === 0;
    };

		if((_isCreditCardService() ||
			_isBasketService() ||
			_isPurchaseService() ||
			_isClubcardService() ||
			_isClubcardValidationService() ||
			_isLibraryService() ||
      _isVoucherRedemptionService() ||
			_isAdminCreditService()) &&
			req.headers['x-content-type'] && req.options.host === config.api_domains['secure-service'].options.host
		){
			// change the content type
			req.options.headers['content-type'] = req.headers['x-content-type'];
			// use json stringify instead of query stringify
			req.body = JSON.stringify(req.body);
		} else {
			req.body = querystring.stringify(req.body);
		}
		req.options.headers['content-length'] = Buffer.byteLength(req.body || '');
	}

	next();
};