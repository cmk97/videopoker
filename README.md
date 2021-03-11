# Video Poker

This is an implementation of Jacks or Better video poker written in vanilla javascript using the module design pattern. I based the UI off of the classic Game King video poker slot machines.

![Video Poker](/assets/images/videopoker.png)



## How to initalize 

To initialize the game, create a DIV and pass its id to the game's start function:

```html
	<div id="videopoker">
	<script src="videopoker.js"></script>
	<script>
		POKER.Game.start({
			board:'videpoker'
		});
	</script>
```

## Demo 

You can demo the game here. 