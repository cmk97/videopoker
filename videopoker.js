/*
Video Poker
By Colby King
*/


var POKER = POKER || {};

POKER.RANKS = POKER.RANKS || {
	TWO: 2,
	THREE: 3,
	FOUR: 4,
	FIVE: 5,
	SIX: 6,
	SEVEN: 7,
	EIGHT: 8,
	NINE: 9,
	TEN: 10,
	JACK: 11,
	QUEEN: 12,
	KING: 13,
	ACE: 14
}


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

POKER.HandAnalyzer = POKER.HandAnalyzer || (function(){



	return function(cards){
		var _this = this;
		this.cards = cards;
		this.rankCount = {};
		
		for(var i = 0; i < cards.length; i++){
			if(this.rankCount[cards[i].value] === undefined){
				this.rankCount[cards[i].value] = 1;
			} else {
				this.rankCount[cards[i].value]++;
			}
		}

		function evalJacksOrBetter(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 2 && rank >= POKER.RANKS.JACK){
					pairCount++;
				}
			}
			if(pairCount === 1) return true;
			return false;
		}

		function evalTwoPair(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 2){
					pairCount++;
				}
			}
			if(pairCount === 2) return true;
			return false;
		}

		function evalThreeOfAKind(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 3) return true;
			}
			return false;
		}

		function evalStraight(){
			var handranks = Object.keys(_this.rankCount);
			//if(handranks.length < 5) return false;
			var straight = [];
			for(var i = 0; i < handranks.length; i++){
				straight[handranks[i]] = handranks[i]
				if(handranks[i] == POKER.RANKS.ACE){
					straight[1] = "1";
				}
			}
			// Find start of straight
			var index = 0;
			while(straight[index] === undefined) index++;
			// Count adjacent cards
			var adjCards = 0;
			while(straight[index] !== undefined && adjCards < 5){
				adjCards++;
				index++;
			}
			console.log(straight);
			console.log(adjCards);	
			return adjCards === 5;
		}

		console.log(this.rankCount);
		console.log("Jacks or better: " + evalJacksOrBetter());
		console.log("straight: " + evalStraight());


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
			
			//Updated all cards not held 
			for(var i = 0, j = 0; i < _this.cards.length; i++){
				if(!_this.holdIndexes.includes(i)){
					updateCardImg(i, cards[j]);
					_this.cards[i] = cards[j];
					j++;
				}
			}
			clearHoldLabels();
			_this.holdIndexes = [];
			// new hand
		}

		this.logHandToConsole = function(){
			for(var i = 0; i < _this.cards.length; i++){
				console.log(cardToString(_this.cards[i]));
			}
		}

		function cardToString(card){
			var rankString;
			switch(card.value){
				case 11:
					rankString = "Jack";
					break;
				case 12: 
					rankString = "Queen";
					break;
				case 13:
					rankString = "King";
					break;
				case 14:
					rankString = "Ace";
					break;
				default:
					rankString = card.value.toString();

			}
			return `${rankString} Of ${card.suit}`;
		}

		function updateCardImg(index, card){
			var cardDivs = document.getElementsByClassName("card");
			var cardToUpdate = cardDivs[index];
			var cardImg = cardToUpdate.getElementsByTagName("img")[0];
			cardImg.src = ("assets/cards/" + card.value + "_of_" + card.suit + ".png");
			return cardDivs[index];
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

		function clearHoldLabels(){
			var cardDivs = document.querySelectorAll(".card");
			for(var i = 0; i < cardDivs.length; i++){
				setHoldLabelVisibility(cardDivs[i], "hidden");
			}
			_this.holdIndexes = [];
		}

		function setHoldLabelVisibility(cardDiv, visibility){
			cardDiv.firstElementChild.style.visibility = visibility;
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

		function handleCardHold(index){
			return function(e){
				holdCard(index);
			}
		}

		function initializeCardContainer(){
			for(var i = 0; i < _this.cards.length; i++){
				var c = updateCardImg(i, _this.cards[i]);
				var index = i;
				c.onclick = handleCardHold(index);
				//document.getElementsByClassName("cards")[0].appendChild(c);
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
		"ROYAL FLUSH": 250,
		"STRAIGHT FLUSH": 50,
		"FOUR OF A KIND": 25,
		"FULL HOUSE": 9,
		"FLUSH": 6,
		"STRAIGHT": 4,
		"THREE OF A KIND": 3,
		"TWO PAIR": 2,
		"PAIR": 1
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
	
	function createFlippedCardElement(){
		var cardElem = document.createElement("div");
		cardElem.className = "card"

		var holdLabel = document.createElement("div");
		holdLabel.className = "hold";

		var cardImg = document.createElement("img");
		cardImg.src = ("assets/cards/back.png");
		cardElem.appendChild(holdLabel);
		cardElem.appendChild(cardImg);
		return cardElem;
	}

	function createCardDisplay(){
		var component = createGameComponent();
		var cardContainer = document.createElement("div")
		cardContainer.className = "cards";
		component.appendChild(cardContainer);

		for(var i = 0; i < FIVE_CARD_DRAW; i++){
				var c = createFlippedCardElement();
				var index = i;
			cardContainer.appendChild(c);
		}

		return component;

	}

	function createButtonBar(){
		var gameComponent = createGameComponent();
		var playInfo = document.createElement("div");
		playInfo.className = "play-info";
		var betLabel = document.createElement("div");
		betLabel.className = "game-text";
		betLabel.id = "bet-label";
		var creditLabel = document.createElement("div");
		creditLabel.className = "game-text float-right";
		creditLabel.id = "credit-label"
		playInfo.appendChild(betLabel);
		playInfo.appendChild(creditLabel);
		gameComponent.appendChild(playInfo);

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
				console.log("Drawing cards...");
				_this.hand.draw(FIVE_CARD_DRAW, _this.deck);
				_this.hand.logHandToConsole();
				var ha = POKER.HandAnalyzer(_this.hand.cards);
			} else {
				_this.deck = new POKER.Deck();
				_this.hand = new POKER.Hand(_this.deck.deal(FIVE_CARD_DRAW));
				console.log("Dealing hand...");
				_this.hand.logHandToConsole();
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


