function main(){
	testDeal().then(function(resolve){
		console.log("RESOLVE: " + resolve);
	});
	console.log("Main done");
}

async function testDeal(){

	var cardPaths = [
		"assets/cards/2_of_hearts.png",
		"assets/cards/3_of_hearts.png",
		"assets/cards/4_of_hearts.png",
		"assets/cards/5_of_hearts.png",
		"assets/cards/9_of_hearts.png"
	];

	
	// dealCard(cardPaths[0], 0)
	//   .then( () => dealCard(cardPaths[0], 1))
	//   .then( () => dealCard(cardPaths[0], 2))
	//   .then( () => dealCard(cardPaths[0], 3))
	//   .then( () => dealCard(cardPaths[0], 4));

	for(let i = 0; i < 5; i++){
		await dealCard(cardPaths[i], i)
	}
	console.log("DONE");
	return 'll';



}

function dealCard(src, index){
	console.log(index);
	return new Promise(function(resolve, reject){
		setTimeout(() => {
			var cardDivs = document.getElementsByClassName("card");
			var cardToUpdate = cardDivs[index];
			var cardImg = cardToUpdate.getElementsByTagName("img")[0];
			cardImg.src = src;
			resolve(index);
		}, 500);
	});
}

function dc(src, index){
	console.log(index);
	return new Promise(function(resolve, reject){
		setTimeout(() => {
			var cardDivs = document.getElementsByClassName("card");
			var cardToUpdate = cardDivs[index];
			var cardImg = cardToUpdate.getElementsByTagName("img")[0];
			cardImg.src = src;
			console.log(cardImg);
			resolve(5)

		}, 500);

	});
}