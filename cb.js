Array.prototype.findIndex = function(value){
		var ctr = -1;
		for (var i=0; i < this.length; i++) {
				// use === to check for Matches. ie., identical (===), ;
				if (this[i] == value) {
						return i;
				}
		}
		return ctr;
};

function Pawn () {
	this.home = 1;
	this.player = 1;
	this.currentBox = this.home;
	this.inc_id = 1;
	this.is_gatti = 0;
	this.is_pollu = 0;
	this.partner_pawn_id = 0;
}

function Box() {
	this.occupied = 0;
	this.occupied_player = new Array();
	this.has_two = 0;
	this.has_three = 0;
	this.c_kodu = 0;
}

function Gatti() {

	this.pawn1 = undefined;
	this.pawn2 = undefined;
	this.id = 0;
	this.line = undefined;
//	this.move(x, y) {
		//change pawn1 and pawn2 attrs simultaneously 
//	};

}

function Player() {
	this.id = 0;
	this.path = [];
	this.startBox = null;
	this.has_killed = 0;
	
	this.getPath = function() {
		return this.path;
	}

	this.getId = function() {
		return this.id;
	}

}

function getPlayerId(pawn_id) {
	var player_id = 0;
	var val = Math.floor(pawn_id/100);
	switch(val) {
	case 1:
		player_id = 4;
		break;
	case 2:
		player_id = 1;
		break;
	case 3:
		player_id = 3;
		break;
	case 4:
		player_id = 2;
		break;
	default: player_id = 0;
	}
	return player_id;	
	
}

function getPawnById(pawn_id) {
	for(i = 0; i< pawns.length; i++)
	{
		if(pawns[i].fig.id == pawn_id)
		{
			return pawns[i];	
		}
	}
	
}

function getBoxId(x, y) {
	x = x + left_width;	
	_i = Math.floor(x / box_width);
	_j = Math.floor(y / box_width);
	_id = _i * 10 + _j;
	return _id;
}

function getBoxDim(id) {
	y = Math.floor(id%10)*box_width + Math.floor(((id%10) - 1)*2);
	x = Math.floor(id/10)*box_width + Math.floor(((id/10) - 1)*2) + left_width;

	dim = {};
	dim.x = x;
	dim.y = y;

	return dim;

}

function create_players(num) {
//hard coding all the values
	var player_1 = new Player();
	player_1.id = 1;
	player_1.startBox = 31;
	player_1.path = [31, 21, 11, 12, 13, 14, 15, 25, 35, 45, 55, 54, 53, 52, 51, 41, 42, 43, 44, 34, 24, 23, 22, 32, 33];
	players[0] = player_1;

	var player_2 = new Player();
	player_2.id = 2;
	player_2.startBox = 53;
	player_2.path = [53, 52, 51, 41, 31, 21, 11, 12, 13, 14, 15, 25, 35, 45, 55, 54, 44, 34, 24, 23, 22, 32, 42, 43, 33];
	players[1] = player_2;

	var player_3 = new Player();
	player_3.id = 3;
	player_3.startBox = 35;
	player_3.path = [35, 45, 55, 54, 53, 52, 51, 41, 31, 21, 11, 12, 13, 14, 15, 25, 24, 23, 22, 32, 42, 43, 44, 34, 33];
	players[2] = player_3;

	var player_4 = new Player();
	player_4.id = 4;
	player_4.startBox = 13;
	player_4.path = [13, 14, 15, 25, 35, 45, 55, 54, 53, 52, 51, 41, 31, 21, 11, 12, 22, 32, 42, 43, 44, 34, 24, 23, 33];
	players[3] = player_4;


}

function returnHome(pawn_id){
	home_dim = getBoxDim(pawn_id.home);
	x = home_dim.x + (pawn_id.inc_id%10)*25;
	y = home_dim.y + (pawn_id.inc_id/10)*25;
	var att = pawn_id.type == "rect" ? {x: x, y: y} : {cx: x , cy: y};
	pawn_id.fig.attr(att);
}

function clear_from_box(from_box) {
	if(safe_houses.findIndex(from_box)>=0) {
                //console.log("_do_nothing for safe houses");
                return true;
        }

	if(window.boxes[from_box].occupied_player.length >= 1) {
console.log("clearing " + from_box );
		window.boxes[from_box].occupied = 0;
		window.boxes[from_box].occupied_player.splice(0,1);
		window.boxes[from_box].has_two = 0;
	}
	//try again for gatti 
	if(window.boxes[from_box].occupied_player.length == 1) {
		window.boxes[from_box].occupied_player.splice(0,1);
	}

}

function isPairing(pawn_moved, from_box, to_box) {
	var pawn1 = getPawnById(pawn_moved);
	var pawn2 = getPawnById(boxes[to_box].occupied_player[0]);
	//console.log("inside isPairing");
	//console.log(boxes[to_box]);
	if(pawn1.home == pawn2.home)
	{
//		boxes[to_box].occupied_player.push(pawn_moved);
	
		//create bond
		var x1 = pawn1.fig.attrs.cx;
		var x2 = pawn2.fig.attrs.cx;
		var y1 = pawn1.fig.attrs.cy;
		var y2 = pawn2.fig.attrs.cy;
		var gatti_path_str = "M"+x1+" "+y1+"L"+x2+ " "+y2;
		var gatti_fig = window.r.path(gatti_path_str);
console.log(gatti_fig);

		boxes[to_box].has_two = 1;
		boxes[to_box].occupied_player[1] = pawn1.fig.id;

		//update properties
		//pawn1.is_gatti = 1;
		//pawn2.is_gatti = 1;
		pawn1.is_pollu = 1;
		pawn2.is_pollu = 1; 

		pawn1.partner_pawn_id = pawn2.fig.id;
		pawn2.partner_pawn_id = pawn1.fig.id;

		pawn1.gatti_line = gatti_fig;
		pawn2.gatti_line = gatti_fig;

		return true;
	}
	else
	{
		return false;
	}
}

//controvercial rule - need clarification
function pair_break (pawn_moved, from_box, to_box) {

	return false;
}

function c_kododu(pawn_moved, to_box) {

	return false;
}

function gatti_attack(pawn_moved, from_box, to_box) {
	//returnHome( getPawnById(boxes[to_box].occupied_player[0] );
	//returnHome( getPawnById(boxes[to_box].occupied_player[1] );
	pawn_attacked = getPawnById(boxes[to_box].occupied_player[0]);

	if((pawn_attacked.is_gatti ==1) || (pawn_attacked.is_pollu == 1)) {
		returnHome(pawn_attacked);
		pawn_attacked.is_gatti = 0;
		pawn_attacked.is_pollu = 0;
		pawn_attacked.gatti_line.attr({stroke: "white"});
		pawn_attacked.gatti_line = undefined;
		pawn_attacked_2 = getPawnById(pawn_attacked.partner_pawn_id);
		returnHome(pawn_attacked_2);
		pawn_attacked_2.is_gatti = 0;
		pawn_attacked_2.is_pollu = 0;
		pawn_attacked_2.gatti_line.attr({stroke: "white"});
		pawn_attacked_2.gatti_line = undefined;	

		boxes[to_box].occupied_player[0] = pawn_moved;
		boxes[to_box].occupied_player[1] = pawn_moved.partner_pawn_id;	

		return true;
	}
	else {
		return false;
	}

}

function isAttackSuccessful(pawn_moved, from_box, to_box) {

	var pawn1 = getPawnById(pawn_moved);
	var pawn2 = getPawnById(boxes[to_box].occupied_player[0]);
	if(pawn1.home == pawn2.home) {
		return false;
	}

	if((boxes[from_box].has_two == 1 || safe_houses.findIndex(from_box)>=0) && boxes[to_box].has_two == 1) {

	
		return gatti_attack(pawn_moved, from_box, to_box);
	}

	if(boxes[to_box].has_two == 1)
	{
		//C-kododu - special case
		return c_kododu(pawn_moved, to_box);
		//return false;
	}
	else
	{	
		//change the occupied_player 
		pawn_attacked = getPawnById(boxes[to_box].occupied_player[0]);
		//console.log("pawn attacked");
		//console.log(pawn_attacked);
		returnHome(pawn_attacked);
		boxes[to_box].occupied_player[0] = pawn_moved;
		if(boxes[from_box].has_two == 1) {
			boxes[to_box].has_two = 1;
			boxes[to_box].occupied_player[1] = boxes[from_box].occupied_player[1];
		}
		free_hit =1;
		return true;
	}
}

//clear from_box wherever its returning true
function isLegal(pawn_moved, from_id, to_id, value) {

console.log("inside isLegal");

	gatti = typeof gatti !== 'undefined' ? gatti : 0;
	var player_id = getPlayerId(pawn_moved);
	var from_indx = players[player_id-1].path.findIndex(from_id);
	var to_indx = players[player_id-1].path.findIndex(to_id);
//gatti in the way - illegal - TODO

	var pawn = getPawnById(pawn_moved);
//value should be proper for normal pawn movement 
	if(((to_indx - from_indx) != value) && (!(pawn.is_pollu ==1 || pawn.is_gatti == 1))){
		return false;
	}

//only multiples of 2 allowed for gatti movement
	if(((pawn.is_gatti == 1) || (pawn.is_pollu ==1)) && (value % 2 !=0)) {
		return false;
	} 
	if(((pawn.is_gatti == 1)  || (pawn.is_pollu ==1)) && ((to_indx < from_indx) || (((to_indx - from_indx)*2) != value))) {
		return false;
	}

//if its not players turn
	if(player_id != (now.turn + 1)) {
console.log("got u");
                return false;
        }

//2 gattis cannot live together in the same box
	if(((pawn.is_gatti == 1) || (pawn.is_pollu ==1) ) && (boxes[to_id].has_two == 1)) {
		var gatti_pawn2 = getPawnById(boxes[to_id].occupied_player[0]);
		if(gatti_pawn2.home == pawn.home) {
			return false;
		}
	}	

//3 in a box not allowed for now : TODO : C- kododu is banned now
	if((!((pawn.is_gatti == 1) || (pawn.is_pollu ==1))) && (boxes[to_id].has_two == 1)) {
		var gatti_pawn2 = getPawnById(boxes[to_id].occupied_player[0]);
		if(gatti_pawn2.home == pawn.home) {
			// mu-pollu
			// boxes[to_id].has_three = 1;
			return false;
		}
		else {
			// C - kododu
			// boxes[to_id].c_kodu = 1; 
			return false;
		}	
	}

//no attack and no pairing in safe house
	if(safe_houses.findIndex(to_id)>=0) {
                //console.log("_do_nothing");
		//clear_from_box(from_box);
                return true;
        }

//if player has not killed anyone - he is not allowed in the inner square
	var inner_square = [42, 43, 44, 34, 24, 23, 22, 32, 33];
	if((inner_square.findIndex(to_id) >= 0 ) && (players[player_id-1].has_killed == 0)) {
		return false;
	}

//convert pollu to gatti - add the dotted line for pollu and convert it here
	if(pawn.is_pollu == 1 && value == 2) {
		pawn.is_pollu = 0;
		pawn.is_gatti = 1;
		var ppawn = getPawnById(pawn.partner_pawn_id);
		ppawn.is_pollu = 0;
		ppawn.is_gatti = 1;
	}


//if the to_box is occupied - check for pairing and attack else its a legal move
	if(window.boxes[to_id].occupied != 0) {	
console.log("attack or pair");
		//check if its a gatti
		//gatti is valid only in the inner circle
		if(inner_square.findIndex(to_id) >= 0 ) {	
			if(isPairing(pawn_moved, from_id, to_id))
			{
				//clear_from_box(from_box);
				return true;
			}
		}
	
		//if its not pairing - then it should be an attack
		if(isAttackSuccessful(pawn_moved, from_id, to_id))
		{
			//clear_from_box(from_box);
			players[player_id-1].has_killed = 1;
			return true;
		}
		else //in this case - attack was not successful for gatti in to_box - special case 
		{
			return false;
		}
	}
	else
	{
		//console.log("here - not good");

		//clear the from_box - important!
		//clear_from_box(from_box);

		//instead of push - change the first element in occupied_player
		window.boxes[to_id].occupied = 1;
		window.boxes[to_id].occupied_player[0] = pawn_moved;

		if(pawn.is_gatti) {
			window.boxes[to_id].has_two = 1;
		}
				
		//console.log(window.boxes[to_id]);

		return true;
	}
}

now.updatePawn = function(pawn_id, att, from_id, to_id, value) {
//only if pawn not moved already
	if(!is_pawn_moved)
	{

console.log("inside update");

		var pawn = getPawnById(pawn_id);
		if(value == 0) {
			pawn.fig.attr(att);
			if((pawn.is_gatti == 1 )|| (pawn.is_pollu == 1)) {

                                                var partner_pawn = getPawnById(Number(pawn.partner_pawn_id));
                                                var partner_att = {cx: (pawn.fig.attrs.cx) + 30, cy: pawn.fig.attrs.cy}
                                                partner_pawn.fig.attr(partner_att);

                                                var x2 = pawn.fig.attrs.cx + 30;
                                                var gatti_path_str = "M"+pawn.fig.attrs.cx+" "+pawn.fig.attrs.cy+"L"+x2+ " "+pawn.fig.attrs.cy;

                                                pawn.gatti_line.attr({path : gatti_path_str});
                                                partner_pawn.gatti_line.attr({path: gatti_path_str});

//				var att2 = this.type == "rect" ? {x: pawn.ox + dx, y: pawn.oy + dy} : {cx: pawn.fig.attrs.cx, cy: pawn.fig.attrs.cy};
//				att2 = ;
//				var ppawn = getPawnById(pawn.partner_pawn_id);
//				ppawn.fig.attr(att2);
			}		
		return true;
		}


		var old_att = pawn.fig.attr;
		pawn.fig.attr(att);

		if(isLegal(pawn_id, from_id, to_id, value)) {
console.log("coming here");
			pawn.currentBox = to_id;
			pawn.fig.attr(att);
			clear_from_box(from_id);
			if(pawn.is_gatti == 1 || pawn.is_pollu == 1) {
console.log("coming here");

				var box_dim = getBoxDim(to_id);

				var gatti_att = {cx: (box_dim.x + 35) - 15, cy: box_dim.y + 35}
				pawn.fig.attr(gatti_att);

				var partner_pawn = getPawnById(Number(pawn.partner_pawn_id));
				var partner_att = {cx: (box_dim.x + 35) + 15, cy: box_dim.y + 35}
				partner_pawn.fig.attr(partner_att);

				var x2 = pawn.fig.attrs.cx + 30;
				var gatti_path_str = "M"+pawn.fig.attrs.cx+" "+pawn.fig.attrs.cy+"L"+x2+ " "+pawn.fig.attrs.cy;
				//var gatti_fig = window.r.path(gatti_path_str);
				pawn.gatti_line.attr({path : gatti_path_str});	
				partner_pawn.gatti_line.attr({path: gatti_path_str});	

			}
		}
		else {
			pawn.fig.attr(old_att);	
		}
	}
	is_pawn_moved = 0;
}

function spliceMe(pawn_moved, from_id, to_id){
	var player_id = getPlayerId(pawn_moved);
	var this_pawn = getPawnById(pawn_moved);
	var move = (players[player_id-1].path.findIndex(to_id) - players[player_id-1].path.findIndex(from_id));

	if(this_pawn.is_pollu == 1 || this_pawn.is_gatti == 1 ) {
		move = move*2;
	}

	var spliced_val = [];
	for (v in values){
		if(move == values[v]){
			spliced_val = values.splice(v, 1);
			window.value = spliced_val[0];
			break;
		}
	}
}

function take_snapshot() {
	//window.old_pawns = window.pawns;
	window.old_pawns = [];
	for(var i = 0, ii = window.pawns.length; i < ii; i++) {
		window.old_pawns[i] = new Pawn();
		window.old_pawns[i].home = window.pawns[i].home;
		window.old_pawns[i].player = pawns[i].player;
		window.old_pawns[i].currentBox = pawns[i].currentBox;
		window.old_pawns[i].inc_id = pawns[i].inc_id;
		window.old_pawns[i].is_gatti = pawns[i].is_gatti;
		window.old_pawns[i].is_pollu = pawns[i].is_pollu;
		window.old_pawns[i].partner_pawn_id = pawns[i].partner_pawn_id;
		window.old_pawns[i].old_att = {cx: pawns[i].fig.attrs.cx, cy: pawns[i].fig.attrs.cy};
	
	}
	//console.log(old_pawns[4]);
}

function restore_old_state() {
	for(var i = 0, ii = window.pawns.length; i < ii; i++) {
		window.pawns[i].home = old_pawns[i].home;
		window.pawns[i].player = old_pawns[i].player;
		window.pawns[i].currentBox = old_pawns[i].currentBox;
		window.pawns[i].inc_id = old_pawns[i].inc_id;
		window.pawns[i].is_gatti = old_pawns[i].is_gatti;
		window.pawns[i].is_pollu = old_pawns[i].is_pollu;
		window.pawns[i].partner_pawn_id = old_pawns[i].partner_pawn_id;
		window.pawns[i].fig.attr(old_pawns[i].old_att);
	}
}


var last_state = undefined;
var is_pawn_moved = 0;
var pawns = [];
var boxes = [];
var safe_houses = [31,53, 35, 13, 33];
var paired = [];
var players = [];
var values = [];
var value = 0;
var uuid = 0;
var free_hit = 0;
var cb_hit = 0;
var left_width = 0;
var box_width = 70;
var r;
var kharab_player_id = [4, 1, 3, 2];
var kharab = 0;
var colors = ["#0D24AE","#00FFFF","#00FF00","#FFFF00"]

function autoPawnMove(pawn_id) {
    var current_player = getPlayerId(pawn_id);
    this_pawn = getPawnById(pawn_id);
  if (values.length > 0 && current_player == (now.turn + 1)) {
    var move_to = players[current_player-1].path.findIndex(this_pawn.currentBox) + values[0];
    var to_indx = players[current_player-1].path[move_to];
    var to_box = getBoxDim(to_indx);
    var att = this_pawn.fig.type == "rect" ?
      {x: to_box.x, y: to_box.y} :
      {cx: to_box.x + (this_pawn.inc_id%10)*25 , cy: to_box.y + (this_pawn.inc_id%10)*25};
    this_pawn.fig.attr(att);
  }
}

function loadCB() {
	r = Raphael("holder", 500, 500);	
	var dragger = function () {
			take_snapshot();
			this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
			this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
			this.animate({"fill-opacity": .2}, 500);
	},
		move = function (dx, dy) {
				var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
				this.attr(att);
				this_pawn = getPawnById(this.id);
				if(this_pawn.is_gatti == 1 || this_pawn.is_pollu == 1) {
					var gatti_att = {cx: this.attrs.cx - 30, cy: this.attrs.cy}
					this.attr(gatti_att);
					var partner_pawn = getPawnById(Number(this_pawn.partner_pawn_id));
					var partner_att = {cx: this.attrs.cx + 30, cy: this.attrs.cy}
					partner_pawn.fig.attr(partner_att);

					var x2 = this.attrs.cx + 30;
					var gatti_path_str = "M"+this.attrs.cx+" "+this.attrs.cy+"L"+x2+ " "+this.attrs.cy;
			                //var gatti_fig = window.r.path(gatti_path_str);
					this_pawn.gatti_line.attr({path : gatti_path_str});	
					partner_pawn.gatti_line.attr({path: gatti_path_str});	

				}
				r.safari();
		},
		up = function () {
				this.animate({"fill-opacity": 1}, 500);
                autoPawnMove(this.id);
                from_id = getBoxId(this.ox, this.oy);
				to_id = getBoxId(this.attrs.cx , this.attrs.cy);
				this_pawn = getPawnById(this.id);
				if(from_id == to_id) {
					var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.attrs.cx, cy: this.attrs.cy};
                                        this_pawn.currentBox = to_id;
					console.log("wtf!!");
					now.update(this.id, att, from_id, to_id, 0);
					return;
				}
				spliceMe(this.id, from_id, to_id);
				if(!isLegal(this.id, from_id, to_id, value))
				{
					var att = this.type == "rect" ? {x: this.ox, y: this.oy} : {cx: this.ox , cy: this.oy};
					this.attr(att);
					r.safari();
					this_pawn = getPawnById(this.id);
					this_pawn.currentBox = from_id;
					console.log("illegal!!");

					if(this_pawn.is_gatti  == 1 || this_pawn.is_pollu == 1 ) {

						var box_dim = getBoxDim(from_id);
						var gatti_att = {cx: (box_dim.x + 35) - 15, cy: box_dim.y + 35}
						this.attr(gatti_att);

						var partner_pawn = getPawnById(Number(this_pawn.partner_pawn_id));
						var partner_att = {cx: (box_dim.x + 35) + 15, cy: box_dim.y + 35}
						partner_pawn.fig.attr(partner_att);

						var x2 = this.attrs.cx + 30;
						var gatti_path_str = "M"+this.attrs.cx+" "+this.attrs.cy+"L"+x2+ " "+this.attrs.cy;
						this_pawn.gatti_line.attr({path : gatti_path_str});	
						partner_pawn.gatti_line.attr({path: gatti_path_str});	

					}
				}
				else
				{
					var att =  this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.attrs.cx, cy: this.attrs.cy};
					this.attr(att);
					//this_pawn.fig.attr(att); //not needed i guess
					this_pawn = getPawnById(this.id);
					if(this_pawn.is_gatti == 1 || this_pawn.is_pollu == 1) {

						var box_dim = getBoxDim(to_id);
						var gatti_att = {cx: (box_dim.x + 35) - 15, cy: box_dim.y + 35}
						this.attr(gatti_att);

						var partner_pawn = getPawnById(Number(this_pawn.partner_pawn_id));
						var partner_att = {cx: (box_dim.x + 35) + 15, cy: box_dim.y + 35}
						partner_pawn.fig.attr(partner_att);

						var x2 = this.attrs.cx + 30;
						var gatti_path_str = "M"+this.attrs.cx+" "+this.attrs.cy+"L"+x2+ " "+this.attrs.cy;
						//var gatti_fig = window.r.path(gatti_path_str);
						this_pawn.gatti_line.attr({path : gatti_path_str});	
						partner_pawn.gatti_line.attr({path: gatti_path_str});	

					}

					this_pawn.currentBox = to_id;
					clear_from_box(from_id);
					//make the pawn moved to true so that it wont get moved again
					is_pawn_moved = 1;
					now.update(this.id, att, from_id, to_id, value);
					console.log(value);
					if(values.length <= 0 && free_hit != 1) {
						clear_values();
						now.turn_change();
					}else if(free_hit ==1){
						var myDice = document.getElementById('role_dice');
						var myScore = document.getElementById('score');
						myScore.innerHTML = "Please Roll";
                      $("#role_dice").css("display", "block");
						myDice.disabled = "";
						updateDiceStackUI();
					}else {	
						updateDiceStackUI();
					}
				}
			
		};

	count = 0;
	//create the basic layout
	for(i = 1 ; i <= 5 ; i++)
	{
		for(j = 1; j <= 5; j++)
		{
			var box = new Box(); 
			var rect = r.rect(left_width + i * box_width + i * 2, j * box_width + j * 2, box_width, box_width, 2);
			box.id = i*10 + j;
			box.rect = rect;
			
			boxes[i*10 + j] = box;

			if( ((i == 1 || i == 5 || i == 3) && (j == 3) || (j == 1 || j == 5 || j == 3) && (i == 3)))
			{
				var x1 = left_width + i*box_width + i * 2;
				var y1 = j * box_width + j *2;
				var x2 = left_width + i*box_width + i * 2 + box_width;
				var y2 = j * box_width + j *2 + box_width;
				var path_str = "M"+x1+" "+y1+"L"+x2+ " "+y2;
				r.path(path_str);
				
				x1 = x1+box_width;
				x2 = x2-box_width;
				path_str = "M"+x1+" "+y1+"L"+x2+ " "+y2;
				r.path(path_str);
				//for a 2 player game.. it shud be different			
				if(!(i==3 && j==3))
				{
					count = count +1;
					//create pawns
					x1 = x1 - box_width;

					var pawn_no = 0;					
					for(k = 1; k<= 2; k++)
					{
						for(p = 1; p <= 2; p++)
						{
							pawn_no = k*10 + p;
							pawn = new Pawn();
							var fig = r.circle(x1 + k*25, y1+ p*25, 10);
							pawn.fig = fig;
							fig.id = count*100+pawn_no;
							pawn.inc_id = pawn_no;
							pawn.home = i*10 + j;
							pawn.currentBox = i*10 + j;
							pawn.player = kharab_player_id[kharab];
							pawns.push(pawn);
						}
					}					
					kharab += 1;
				}
			}
		}
	}
	var count = 0, legend_index = 0, legend_radius = 12;
	for (var i = 0, ii = pawns.length; i < ii; i++) {
			var color;
			if(!(count%4))
			{
				color = Raphael.getColor();
				count = 0;

				// create pawns legend
				if(legend_index == 0) {
					r.circle(left_width + 50, 263, legend_radius).attr("fill", colors[0]);
					l_text_l = r.text(left_width + 25, 295, "")
          	.attr({"fill": "#000", "font-size": legend_font, "font-family": "Arial"});				
				}
				if(legend_index == 1){
					r.circle(left_width + 255, 50, legend_radius).attr("fill", colors[1]);
					l_text_t = r.text(left_width + 298, 50, "")
          	.attr({"fill": "#000", "font-size": legend_font, "font-family": "Arial"});
				}
				if(legend_index == 2){
					r.circle(left_width + 255, 470, legend_radius).attr("fill", colors[2]);
					l_text_b = r.text(left_width + 298, 470, "")
          	.attr({"fill": "#000", "font-size": legend_font, "font-family": "Arial"});				
				} 
				if(legend_index == 3){
					r.circle(left_width + 475, 263, legend_radius).attr("fill", colors[3]);
					l_text_r = r.text(left_width + 480, 295, "")
          	.attr({"fill": "#000", "font-size": legend_font, "font-family": "Arial"});
				}
				legend_index += 1;
			}
			count = count + 1;
			pawns[i].fig.attr({fill: colors[Math.floor(i/4)], stroke: color, "fill-opacity": 2, "stroke-width": 2, cursor: "move"});
			pawns[i].fig.drag(move, dragger, up);
	}
	create_players(4);
	getuuid();
}

function clear_values(){
	values = [];
	value = 0;											
}

function getuuid() {
	setTimeout(function() {
		uuid = now.uuid;
		now.distributeGamePlay("Thanks for your patience... " + now.name +
			" is ready, Moderator starts first</br></br>");
		setTimeout(function() {
			now.addPlayer(uuid);
			set_legends();
		}, 2000);
	}, 1000);
}

var user_x = 0;
var l_text_t, l_text_b, l_text_l, l_text_r;
var legend_name = 8, legend_font = 12;
var set_legend_attempts = 10;
function set_legend_name(element, name){
	element.attr("text", name);
	user_x += 1;
}

function set_legends(){
  now.getGroupUsers(function(group_users){
  	var users = group_users;
  	if(users != undefined){
			if(users.length > 0){
				now.getUserNameById(users[user_x], function(user_name){
			  	var name = user_name.substring(0, legend_name).toLowerCase();			  	
			  	if(user_x < users.length)
			  		switch (user_x){
					    case 0: set_legend_name(l_text_t, name);	  				
					      			break;
					    case 1: set_legend_name(l_text_r, name);
					      			break;
					    case 2: set_legend_name(l_text_b, name);
					      			break;
					    case 3: set_legend_name(l_text_l, name);
					      			break;
					    default: break;
					  }
			  });
			}
			if(set_legend_attempts >= 0){
				set_legend_attempts -= 1;
				setTimeout(function(){
		  		set_legends();
		  	}, 5000);
			}
		}else{
			setTimeout(function(){
	  		set_legends();
	  	}, 3000);
		}
  });
}

var prev_hit = 0;
function play_game(){
	window.value = 0;
	if(values.length > 0 && free_hit != 1){
		console.log("nothing free here");
		return;
	}	
	now.get_val(values);
	var myScore = document.getElementById('score');
	myScore.innerHTML = "Dice rolling ...";
	var myDice = document.getElementById('role_dice');
	myDice.disabled = "true";
    $("#role_dice").css("display", "none");
	var myDiceStack = document.getElementById('dice_stack');
	setTimeout(function() {
			free_hit = 0;
			var server_val = now.vali;
			values.push(server_val);
		        myScore.innerHTML = "You rolled " + server_val + "</br>Now move coins";
			if(server_val == 4 || server_val == 8) {
				free_hit = 1;
			}

			if(free_hit == 1) {
              $("#role_dice").css("display", "block");
				myDice.disabled = "";
				now.distributeGamePlay(this.now.name + " gets a free hit - rolled " + server_val);
			}

			if(values.length > 0 && free_hit == 1){
				var ds = myDiceStack.innerHTML + "<div class='dice_stack'>" + server_val + "</div>"
				myDiceStack.innerHTML = ds;
			}else{
				if(prev_hit == 0)
					myDiceStack.innerHTML = "";
				else{
					var ds = myDiceStack.innerHTML + "<div class='dice_stack'>" + server_val + "</div>"
					myDiceStack.innerHTML = ds;
				}
			}
			prev_hit = free_hit;
			
	}, 3000);
}

function updateDiceStackUI(){
	var myDiceStack = document.getElementById('dice_stack');
	var ds = "";
	var ds_index = values.length;
	while(ds_index > 0){
		ds += "<div class='dice_stack'>" + values[ds_index - 1] + "</div>"
		ds_index -= 1;
	}
	myDiceStack.innerHTML = ds;
}

function reset_player(pa_index){	
	for(var i = 0; i < pawns.length; i++){
		if(pawns[i].player == parseInt(pa_index) + 1){
			returnHome(getPawnById(pawns[i].fig.id));
		}
	}
}
