/*
Javascript Video Poker
Written by Colby King
*/

var POKER = POKER || {};
alert('here we go...');


POKER.gameContainer = (function() {

	var counter = 0;

	return {

	    incrementCounter: function () {
	      return counter++;
	    },

	    resetCounter: function () {
	      console.log( "counter value prior to reset: " + counter );
	      counter = 0;
	    }
	};


})();

POKER.testClass = POKER.testClass || (function() {
	var mel = this;
	return {

		me: mel,

		testCounter: function () {
			return me.gameContainer.incrementCounter();
		}
	};


})();


POKER.test = POKER.test || (function() {
	var x = 4;
	return function(conf){
		me = this;

		me.testFunction1 = function(){
			return 5;
		};

		me.testFunction2 = function(){
			return x++;
		};

	}


})();