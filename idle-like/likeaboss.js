// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!


//NOTES
// 'exchange', 'upgrade', 'potions', or 'scrolls'
//----
var attack_mode=true;
var is_buying=false;
var last_buy=0;

//apparently item_quantity is not defined...
function count_pot(name) { // count item in inventory
	var total = 0;
	for (var i = 0; i < character.items.length; i++) {
		var item = character.items[i];
		if (item && item.name === name) total += item.q || 1; // q = stack size
	}
	return total;
}

//use that shit
function use_pot(){ //use a potion if h/mp < /2
	return character.hp < character.max_hp / 2 || character.mp < character.max_mp * 0.75;
}

function buy_pot(){ //if hp or mp pot inventory < 50, buy
	if (is_buying) return;
	
	var hp_count = count_pot("hpot1");
	var mp_count = count_pot("mpot1");

	if (hp_count>=50 && mp_count>=50) return;
	
	if (Date.now() - last_buy < 600000) return; // at most one trip per 10m
	if (character.gold < 2000) { set_message("Low gold"); return; } // adjust the amount
	last_buy = Date.now();

	attack_mode=false;
	is_buying=true;

	var x=character.x;
	var y=character.y;

	smart_move("potions")
		.then(function(){
			if (hp_count<50) buy("hpot1",200);
			if (mp_count<50) buy("mpot1",200);
			return smart_move({ x: x, y: y }); // go back to where you were
		})
		.then(function(){
			attack_mode=true;
			is_buying=false;
		})
		.catch(function(e){
			set_message("Buy fail ):");
			attack_mode=true;
			is_buying=false;
		});
}

setInterval(function(){ // attack checks 4x/s

	loot();

	if (use_pot()){
		use_hp_or_mp();
	}

	//if low, stop aggro, move there, buy that shit, come back
	if (count_pot("hpot1") < 50 || count_pot("mpot1") < 50) buy_pot();
	if (is_buying) return; // don't atk while on a potion run

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster({min_xp:100,max_att:120});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}

},1000/4); 

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland_mongodb/blob/main/js/runner_functions.js
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround

