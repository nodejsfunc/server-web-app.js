'use strict';

var mockery = require('mockery'),
	mocks = require('./');

mockery.enable({
	warnOnReplace: false,
	warnOnUnregistered: false
});


/*
* This will mock the redis module globally and return the specified object
* */
var redis = {
	createClient: function(){
		return {
			on: function(){},
			get: function(key, cb){
				setTimeout(function(){
					cb(null, JSON.stringify(mocks.USER));
				}, 0)
			},
			set: function(){},
			del: function(){}
		}
	}
}

mockery.registerMock('redis', redis);