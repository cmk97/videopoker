/*
Video Poker
By Colby King
*/


var POKER = POKER || {};


POKER.Deck = POKER.Deck || (function() {

	// ---- static variables ----- //

	var DECK_SIZE = 52;
	var NUM_VALUES = 13;
	var NUM_SUITES = 4;


	return function(config){
		// ---- public variables ---- //
		var _this = this;
		_this.suits = ['diamonds', 'hearts', 'clubs', 'spades'];
		_this.values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
		_this.deck = [];


		// ---- Private methods ---- //
		function initializeDeck(){
			for(var i = 0; i < NUM_SUITES; i++){
				for(var j = 0; j < NUM_VALUES; j++){
					_this.deck.push({
						suit: _this.suits[i],
						value: _this.values[j]
					});
				}
			}
		}

	    /**
		 * Shuffles an array in place. Adaptation of the 
		 * Fisher-Yates algorithm 
		 */
		function shuffle(){
			var i = _this.deck.length - 1;
			var tmp, j;
			for(;i > 0; i--){
				j = Math.floor(Math.random() * (i+1));
				tmp = _this.deck[i];
				_this.deck[i] = _this.deck[j];
				_this.deck[j] = tmp;
			}
		}

		function display(){
			for(var i = 0; i < _this.deck.length; i++){
				console.log(_this.deck[i].suit + ' ' + _this.deck[i].value)
			}
		}

		// ***** pubic methods ****** //

		_this.deal = function(howMany){
			var dealt = 0,
				cards = [];
			while(dealt < howMany){
				cards.push(_this.deck.pop())
				dealt++;
			}
			return cards;
		}

		initializeDeck();
		shuffle();
	}

})();

POKER.Hand = POKER.Hand || (function(){

	return function(cards){
		var _this = this;
		_this.cards = cards;


		function createCardElement(value, suit){
			var cardElem = document.createElement("div");
			cardElem.className = "card"
			var cardImg = document.createElement("img");
			cardImg.src = ("assets/cards/" + value + "_of_" + suit + ".png");
			cardElem.appendChild(cardImg);
			return cardElem;
		}

		var c = createCardElement(cards[0].value, cards[0].suit);
		console.log(POKER.UI);
		POKER.UI['cardContainer'].appendChild(c);
		c.onclick = function(e){
			alert('Hello!');
		}

	}

})();

POKER.UI = {};

POKER.Game = POKER.GAME || (function(){

	var FIVE_CARD_DRAW = 5;

	function start(config){
		POKER.Config = config;
		setupGameContainer(config);
		var deck = new POKER.Deck();
		var hand = new POKER.Hand(deck.deal(FIVE_CARD_DRAW));

	}

	function setupGameContainer(config){
		var gameContainer = document.getElementById(config['board']);
		var cardContainer = document.createElement("div")
		cardContainer.className = "cards";
		gameContainer.appendChild(cardContainer);

		POKER.UI['cardContainer'] = cardContainer;
		
	}

	return {
		start: start
	}

})();


