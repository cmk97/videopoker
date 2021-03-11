# Video Poker

![Video Poker](/assets/images/videopoker.png)

This is an implementation of Jacks or Better video poker written in vanilla javascript. I based the design off of the classic Game King video poker slot machines. 

## How to initalize 

To initialize the game, create a DIV and pass its id to the game's start function:

```html
	<div id="videopoker">
	<script src="videopoker.js"></script>
	<script>
		POKER.Game.start({
			board:'game-container'
		});
	</script>
```

## Demo 

You can demo the game here. 