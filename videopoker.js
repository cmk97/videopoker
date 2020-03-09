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
		_this.holdIndexes = [];

		this.draw = function(handsize, deck){
			var heldCards = [];
			for(var i = 0; i < _this.holdIndexes.length; i++){
				heldCards.push(_this.cards[_this.holdIndexes[i]]);
			}
			var cards = deck.deal(handsize - heldCards.length);
			
			for(var i = 0, j = 0; i < _this.cards.length; i++){
				if(!_this.holdIndexes.includes(i)){
					updateCardImg(i, cards[j]);
					j++;
				}
			}
			_this.cards = heldCards.concat(cards);
			console.log(_this.cards);
			


		}

		function updateCardImg(index, card){
			var cardDivs = document.getElementsByClassName("card");
			var cardToUpdate = cardDivs[index];
			var cardImg = cardToUpdate.getElementsByTagName("img")[0];
			cardImg.src = ("assets/cards/" + card.value + "_of_" + card.suit + ".png");
		}

		function createCardElement(value, suit){
			var cardElem = document.createElement("div");
			cardElem.className = "card"

			var holdLabel = document.createElement("div");
			holdLabel.className = "hold";

			var cardImg = document.createElement("img");
			cardImg.src = ("assets/cards/" + value + "_of_" + suit + ".png");
			cardElem.appendChild(holdLabel);
			cardElem.appendChild(cardImg);
			return cardElem;
		}

		function holdCard(index){
			var cards = document.querySelectorAll(".card");
			if(_this.holdIndexes.includes(index)){
				var i = _this.holdIndexes.indexOf(index);
				_this.holdIndexes.splice(i, 1);
				cards[index].firstElementChild.style.visibility = "hidden";
			} else {
				_this.holdIndexes.push(index);
				cards[index].firstElementChild.style.visibility = "visible";
			}
		}

		function initializeCardContainer(){
			for(var i = 0; i < _this.cards.length; i++){
				var c = createCardElement(cards[i].value, cards[i].suit);
				var index = i;
				c.onclick = (function(index){
					return function(e){
						holdCard(index);
					};
				})(index)
				document.getElementsByClassName("cards")[0].appendChild(c);
			}
		}

		initializeCardContainer();
	}

})();

POKER.UI = POKER.UI || (function(){

	var BUTTONS = [
		"OFF",
		"MORE GAMES",
		"OPTIONS",
		"BET ONE",
		"BET MAX",
		"DEAL"
	]

	return {
		BUTTONS: BUTTONS
	}
})();

POKER.Ranks = POKER.Ranks || (function(){
	var JACKS_OR_BETTER = {
		PAIR: 1,
		TWO_PAIR: 2,
		THREE_OF_A_KIND: 3,
		STRAIGHT: 4,
		FLUSH: 6,
		FULL_HOUSE: 9,
		FOUR_OF_A_KIND: 25,
		STRAIGHT_FLUSH: 50,
		ROYAL_FLUSH: 250
	};

	return {
		JACKS_OR_BETTER: JACKS_OR_BETTER
	}

})();

POKER.Game = POKER.GAME || (function(){

	var FIVE_CARD_DRAW = 5;
	var onDraw = false;
	var _this = this;
	_this.hand, _this.deck;

	function start(config){
		POKER.Config = config;
		setupGameContainer(config);

	}

	function createComponentContainer(){
		var componentContainer = document.createElement("div")
		componentContainer.className = "component-container";
		return componentContainer;
	}

	function createGameComponent(){
		var componentContainer = document.createElement("div")
		componentContainer.className = "game-component";
		return componentContainer;
	}

	function createPayTable(config){
		var component = createGameComponent();
		// Initialize table
		var payTable = document.createElement("table");
		payTable.className = "pay-table";
		var payTableBody = document.createElement("tbody")
		payTable.appendChild(payTableBody);
		
		var MAX_BET = 5
		for(const rank in POKER.Ranks.JACKS_OR_BETTER){
			var row = document.createElement("tr");
			var rankCol = document.createElement("td");
			rankCol.innerText = rank;
			rankCol.className = "left-align";
			row.appendChild(rankCol);

			for(var i = 1; i <= MAX_BET; i++){
				var payCol = document.createElement("td");
				payCol.className = "payout-value";
				payCol.innerText = (POKER.Ranks.JACKS_OR_BETTER[rank] * i);
				row.appendChild(payCol);
			}
			payTableBody.appendChild(row);
		}

		component.appendChild(payTable)
		return component;
	}

	function createCardDisplay(){
		var component = createGameComponent();
		var cardContainer = document.createElement("div")
		cardContainer.className = "cards";
		component.appendChild(cardContainer);
		return component;

	}

	function createButtonBar(){
		var gameComponent = createGameComponent();
		var buttonBar = document.createElement("div");
		buttonBar.className = "button-bar";
		for(var i = 0; i < POKER.UI.BUTTONS.length; i++){
			var button = document.createElement("button");
			button.innerText = POKER.UI.BUTTONS[i];
			buttonBar.appendChild(button);
		}
		gameComponent.appendChild(buttonBar);
		return gameComponent;

	}

	function addDealEventListener(buttonBar){
		var dealButton = buttonBar.getElementsByTagName("button")[5];
		dealButton.onclick = function(){
			if(onDraw){
				_this.hand.draw(FIVE_CARD_DRAW,_this.deck);
			} else {
				_this.deck = new POKER.Deck();
				_this.hand = new POKER.Hand(_this.deck.deal(FIVE_CARD_DRAW));
				onDraw = true;
			}

		}
	}

	function setupGameContainer(config){
		var gameContainer = document.getElementById(config['board']);
		var componentContainer = createComponentContainer();

		var cardContainer = createCardDisplay();
		var buttonBar = createButtonBar();

		gameContainer.appendChild(componentContainer);
		componentContainer.appendChild(createPayTable());
		componentContainer.appendChild(cardContainer);
		componentContainer.appendChild(buttonBar);

		POKER.UI['cardContainer'] = cardContainer;
		POKER.UI['buttonBar'] = buttonBar;
		addDealEventListener(buttonBar);
	}

	return {
		start: start
	}

})();


