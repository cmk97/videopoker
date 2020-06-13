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

		function pairCount(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 2){
					pairCount++;
				}
			}
			return pairCount;
		}

		function highestRank(){
			var ranks = Object.keys(_this.rankCount);
			return Math.max(...ranks);
		}

		function lowestRank(){
			var ranks = Object.keys(_this.rankCount);
			return Math.min(...ranks);
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
			return pairCount() === 2;
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
			var index = lowestRank();

			if(lowestRank() === POKER.RANKS.TWO &&
			   highestRank() === POKER.RANKS.ACE){
				index--;
			}

			// Count adjacent cards
			var adjCards = 0;
			while(straight[index] !== undefined && adjCards < 5){
				adjCards++;
				index++;
			}
			return adjCards === 5;
		}

		function evalFlush(){
			var suit = _this.cards[0].suit;
			for(var i = 1; i < _this.cards.length; i++){
				if(_this.cards[i].suit !== suit) return false;
			}
			return true;
		}

		function evalFullHouse(){
			return evalThreeOfAKind() && pairCount() === 1;
		}

		function evalFourOfAKind(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 4) return true;
			}
			return false;
		}

		function evalStraightFlush(){
			return evalStraight() && evalFlush();
		}

		function evalRoyalFlush(){
			return (evalStraight() && evalFlush() && lowestRank() === POKER.RANKS.TEN);
		}

		this.evaluate = function(){
			var handEval = {
				"PAIR": evalJacksOrBetter(),
				"TWO PAIR": evalTwoPair(),
				"THREE OF A KIND": evalThreeOfAKind(),
				"STRAIGHT": evalStraight(),
				"FLUSH": evalFlush(),
				"FULL HOUSE": evalFullHouse(),
				"FOUR OF A KIND": evalFourOfAKind(),
				"STRAIGHT FLUSH": evalStraightFlush(),
				"ROYAL FLUSH": evalRoyalFlush()
			};
	
			for(const handMade in handEval){
				if(handEval[handMade]){
					return {
						[handMade]: POKER.Payout.JACKS_OR_BETTER[handMade]
					};
				}
			}
			return {
				"GAME OVER": 0
			};
		}
	}

})();

POKER.Hand = POKER.Hand || (function(){

	return function(cards){
		var _this = this;
		_this.cards = cards;
		_this.holdIndexes = [];

		this.draw = async function(handsize, deck){
			//Return promise with this function. 
			var heldCards = [];
			for(var i = 0; i < _this.holdIndexes.length; i++){
				heldCards.push(_this.cards[_this.holdIndexes[i]]);
			}
			var cards = deck.deal(handsize - heldCards.length);
			
			//Updated all cards not held 
			for(var i = 0, j = 0; i < _this.cards.length; i++){
				if(!_this.holdIndexes.includes(i)){
					_this.cards[i] = cards[j];
					j++;
				}
			}

			await _this.updateCardContainer();
			clearHoldLabels();
		}

		function dealCard(index){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					updateCardImg(index, _this.cards[index]);
					resolve(index);
				}, 75);
			});
		}

		function updateCardImgWithDelay(index){
			return new Promise(function(resolve){
				while(_this.holdIndexes.includes(index)) index++;
			setTimeout(function(){
				if(!_this.holdIndexes.includes(index)){
					var c = updateCardImg(index, _this.cards[index]);
					c.onclick = handleCardHold(index);
				}
				index++;
				if(index < 5){
					updateCardImgWithDelay(index);
				} else {
					resolve("Done!");
				}
			}, 500);
			});
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
			cardDivs[index].onclick = handleCardHold(index);
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

		this.updateCardContainer = async function(){

			for(let i = 0; i < _this.cards.length; i++){
				while(_this.holdIndexes.includes(i) && i < _this.cards.length-1) i++;
				await dealCard(i);
			}
		}
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

POKER.Payout = POKER.Payout || (function(){
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

POKER.PayTable = POKER.PayTable || (function(){
	 MAX_COLUMN = 6;

	return function(config, container){
		var _this = this;
		_this.container = container;
		function createPayTable(){
			// Initialize table
			var payTable = document.createElement("table");
			payTable.className = "pay-table";
			var payTableBody = document.createElement("tbody")
			payTableBody.id = "pay-table-body"
			payTable.appendChild(payTableBody);
			//component.appendChild(payTable)
			return payTable;
		}

		function initialize(){
			var paytable = createPayTable();
			var paytableBody = paytable.firstElementChild;
			var MAX_BET = 5
			for(const payout in POKER.Payout.JACKS_OR_BETTER){
				var row = document.createElement("tr");
				var handMadeCol = document.createElement("td");
				handMadeCol.innerText = payout;
				handMadeCol.className = "left-align";
				row.appendChild(handMadeCol);

				for(var i = 1; i <= MAX_BET; i++){
					var payCol = document.createElement("td");
					payCol.className = "payout-value";
					payCol.innerText = (POKER.Payout.JACKS_OR_BETTER[payout] * i);
					row.appendChild(payCol);
				}
				paytableBody.appendChild(row);
			}
			var component = document.createElement("div")
			component.className = "game-component";
			component.appendChild(paytable)
			_this.container.appendChild(component);
		}

		this.displayBet = async function(bet){
			// Clear last column from last hand
			colorPaytableColumn(MAX_COLUMN, 'rgb(20,42,79)');

			var startCol = 2;
			for(var i = startCol; i < startCol + bet; i++){
				await animatePaytableClimb(i);
			}

		}

		function colorPaytableColumn(col, color){
			var columnCells = document.querySelectorAll(`#pay-table-body tr > td:nth-child(${col})`);
			for(var i = 0; i < columnCells.length; i++){
				columnCells[i].style.backgroundColor = color;
			}

		}

		function animatePaytableClimb(col){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					var columnCells = document.querySelectorAll(`#pay-table-body tr > td:nth-child(${col})`);
					if(col > 2){
						colorPaytableColumn(col - 1, 'rgb(20,42,79)')
					}
					colorPaytableColumn(col, 'red');
					resolve(columnCells);
				}, 100);
			});
		}


		initialize();

	}

})();

POKER.Player = POKER.Player || (function(){

	DEFAULT_CREDITS = 100;

	return function(config, container){
		var _this = this;
		_this.container = container;
		_this.creditsLabel;

		function createButtonBar(){
			var component = document.createElement("div")
			component.className = "game-component";

			var playInfo = document.createElement("div");
			playInfo.className = "play-info";
			var betLabel = document.createElement("div");
			betLabel.className = "game-text";
			betLabel.id = "bet-label";
			var creditsLabel = document.createElement("div");
			creditsLabel.className = "game-text float-right";
			creditsLabel.id = "credit-label";
			_this.creditsLabel = creditsLabel;
			playInfo.appendChild(betLabel);
			playInfo.appendChild(creditsLabel);
			component.appendChild(playInfo);

			var buttonBar = document.createElement("div");
			buttonBar.className = "button-bar";
			buttonBar.id = "button-bar";
			for(var i = 0; i < POKER.UI.BUTTONS.length; i++){
				var button = document.createElement("button");
				button.innerText = POKER.UI.BUTTONS[i];
				buttonBar.appendChild(button);
			}
			component.appendChild(buttonBar);
			var buttonBar = document.getElementById('button-bar')
			_this.container.appendChild(component);
		}

		async function initialize(){
			createButtonBar();
			_this.creditsLabel.innerHTML = DEFAULT_CREDITS;
			console.log('hello');
			for(var i = 0; i < 5; i++){
				await incrementCreditLabel();
				console.log(i);
			}
		}

		function incrementCreditLabel(){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					var currentCredit = _this.creditsLabel.innerHTML;
					_this.creditsLabel.innerHTML = parseInt(currentCredit) + 1;
				}, 100);
			});
		}

		initialize();
	}
})();

POKER.Game = POKER.GAME || (function(){

	var FIVE_CARD_DRAW = 5;
	var onDraw = false;
	var _this = this;
	_this.hand, _this.deck, _this.paytable;

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
		component.appendChild(createGameOverLabel());
		component.appendChild(cardContainer);

		for(var i = 0; i < FIVE_CARD_DRAW; i++){
				var c = createFlippedCardElement();
				var index = i;
			cardContainer.appendChild(c);
		}

		return component;

	}

	function resetCardDisplay(){
		var cardContainer = document.getElementsByClassName('cards')[0];
		var cardImages = cardContainer.getElementsByTagName('img');
		for(var i = 0; i < cardImages.length; i++){
			cardImages[i].src = ("assets/cards/back.png");
		}
	}

	function resetHoldLabels(){
		var cardContainer = document.getElementsByClassName('cards')[0];
		var holdLabels = cardContainer.getElementsByClassName('hold');
		for(var i = 0; i < holdLabels.length; i++) {
			holdLabels[i].style.visibility = 'hidden';
		}

	}
	function resetWinningHandLabel(){
		var winLabel = document.getElementById('winning-hand-label');
		winLabel.innerHTML = "";
	}

	function resetGame(){
		resetCardDisplay();
		resetHoldLabels();
		resetWinningHandLabel();

	}

	function createGameOverLabel(){
		var winningHandLabel = document.createElement("div");
		winningHandLabel.className = "game-text text-center";
		winningHandLabel.id = "winning-hand-label";
		winningHandLabel.style.minHeight = "30px";
		winningHandLabel.style.marginBottom = "10px";
		return winningHandLabel;

	}

	function handleGameOver(handResults, dealButton, gameOver){
		var handLabel = document.getElementById("winning-hand-label");
		if(gameOver){
			console.log("in game over...");
			handLabel.classList.remove("info");
			handLabel.innerHTML = Object.keys(handResults)[0];
		} else {
			handLabel.classList.add("info");
			console.log(Object.keys(handResults));
			console.log(Object.keys(handResults)[0] === "GAME OVER");
			if(Object.keys(handResults)[0] !== "GAME OVER"){
				handLabel.innerHTML = Object.keys(handResults);

			}
		}
		dealButton.disabled = false;
	}

	function addDealEventListener(dealButton){
		
		dealButton.onclick = function(){
			if(onDraw){
				dealButton.disabled = true;
				_this.hand.draw(FIVE_CARD_DRAW, _this.deck, dealButton).then(function(cards){
					var ha = new POKER.HandAnalyzer(_this.hand.cards);
					var handData = ha.evaluate();
					handleGameOver(handData, dealButton, onDraw);
					onDraw = false;
				});
			} else {
				dealButton.disabled = true;
				resetGame();
				_this.deck = new POKER.Deck();
				_this.hand = new POKER.Hand(_this.deck.deal(FIVE_CARD_DRAW));
				_this.paytable.displayBet(5)
				.then(function(){
					_this.hand.updateCardContainer();
				})
				.then(function(){
					var ha = new POKER.HandAnalyzer(_this.hand.cards);
					var handmade = ha.evaluate();
					handleGameOver(handmade, dealButton, onDraw);
					onDraw = true;
					dealButton.disabled = false;
				});
			}

		}
	}



	function setupGameContainer(config){
		var gameContainer = document.getElementById(config['board']);
		var componentContainer = createComponentContainer();

		var cardContainer = createCardDisplay();

		gameContainer.appendChild(componentContainer);
		_this.paytable = new POKER.PayTable(config, componentContainer);
		componentContainer.appendChild(cardContainer);
		_this.player = new POKER.Player(config, componentContainer);

		POKER.UI['cardContainer'] = cardContainer;
		var buttonBar = document.getElementById('button-bar');
		var dealButton = buttonBar.lastElementChild;
		addDealEventListener(dealButton);
	}

	return {
		start: start
	}

})();


