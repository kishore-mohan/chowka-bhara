var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.index;
handle["/cb.js"] = requestHandlers.cbjs;
handle["/raphael.js"] = requestHandlers.raphaeljs;
handle["/jquery.url.js"] = requestHandlers.jqueryurljs;
handle["/jquery.min.js"] = requestHandlers.jqueryminjs;
handle["/jquery_popup.js"] = requestHandlers.jquerypopupjs;
handle["/emoticons.js"] = requestHandlers.emoticons;
handle["/main.css"] = requestHandlers.css;
handle["/emoticons.css"] = requestHandlers.emoticss;
handle["/game"] = requestHandlers.game;
handle["/favicon.ico"] = requestHandlers.favicon;
handle["/cb_help_pic.png"] = requestHandlers.loading_image;
handle["/emoticons.png"] = requestHandlers.load_image;
handle["/close_btn.png"] = requestHandlers.close_image;
handle["/README"] = requestHandlers.README;

var nowjs = require("now");
var everyone = nowjs.initialize(server.start(router.route, handle));
// Declare a list of server rooms
everyone.now.serverRoomsList = {
    1:'Room 1',2:'Room 2',3:'Room 3',
    4:'Room 4',5:'Room 5'
};
count = 1;
var max_group_count = 4;

function log_prefix(){
    return "cb_server:" + new Date() + ":";
}

everyone.connected(function(){
    this.now.counter = 0;
    console.log(log_prefix() + "User client id is " + this.user.clientId);
    this.now.uuid = ++count;
    this.now.moderator = false;
});

everyone.disconnected(function(){
    var group = nowjs.getGroup(this.now.serverRoom);
    var pa_index = group.now.players_arr.indexOf(this.now.uuid);
    if(pa_index != -1){
        group.now.players_arr[pa_index] = -1;
        group.now.distributeMessage('disconnected pa_index =' + pa_index);
    }

    // check turn change for absconders
    var users = group['users'];
    for(user in users){
        if(users[user]['now']['moderator']){
            users[user]['now'].turn_change();
            group.locked = false;
            group.now.distributeGamePlay(this.now.name + " disconnected from Room " + this.now.serverRoom);
            break;
        }
    }
});

nowjs.on('newgroup', function (group) {
    group.now.players_arr = [];
    group.now.turn = 0;
});

// Send message to everyone in the users group
everyone.now.distributeMessage = function(message){
    var group = nowjs.getGroup(this.now.serverRoom);
    group.now.receiveMessage(this.now.name, message);
}

// Send message to everyone in the users group
everyone.now.distributeGamePlay = function(message){
    var group = nowjs.getGroup(this.now.serverRoom);
    group.now.receiveGamePlay(message);
}

everyone.now.changeRoom = function(newRoom, callback){
    console.log(log_prefix() + this.now.name + " tried Room " + newRoom);
    var oldRoom = this.now.serverRoom;

    //if old room is not null; then leave the old room
    if(oldRoom){
        var oldGroup = nowjs.getGroup(oldRoom);
        oldGroup.removeUser(this.user.clientId);
    }

    // join the new room
    var newGroup = nowjs.getGroup(newRoom);
    if(newGroup.locked == undefined)
        newGroup.locked = false;

    // check max group count for current group
    var groupCount = 0;
    newGroup.count(function (ct) {
        groupCount = ct;
    });

    if(groupCount < max_group_count && !newGroup.locked){
        newGroup.addUser(this.user.clientId);
        this.now.serverRoom = newRoom;
        console.log(log_prefix() + this.now.name + " joined Room " + this.now.serverRoom);

        // make the first player, moderator of the current group
        if(groupCount == 0){
            newGroup.now.players_arr = []; // flushing old stuff
            newGroup.moderator = this.user.clientId;
            this.now.moderator = true;
            console.log(log_prefix() + this.now.name + " is the moderator of Room " + this.now.serverRoom);
        }else if(groupCount == (max_group_count - 1)){
            newGroup.locked = true; // last player, rooms full
        }
        callback(true);
    }else{
        console.log(log_prefix() + this.now.name + " entry denied to Room " + this.now.serverRoom + " - duh its locked!!!");
        callback(false);
    }
}

everyone.now.groupModerator = function(callback){
    callback(nowjs.getGroup(this.now.serverRoom).moderator);
}

everyone.now.userClientId = function(callback){
    callback(this.user.clientId);
}

everyone.now.getGroupUsers = function(callback){
    var group = nowjs.getGroup(this.now.serverRoom);
    group.getUsers(function (users){
        callback(users);
    });
}

everyone.now.removeUserByModerator = function(user_id, callback){
    if(this.now.moderator && user_id != this.user.clientId){
        var group = nowjs.getGroup(this.now.serverRoom);
        group.hasClient(user_id, function (bool) {
            if (bool){
                group.removeUser(user_id);
                callback(user_id);
            }
        });
    }
}

everyone.now.getUserNameById = function(user_id, callback){
    var group = nowjs.getGroup(this.now.serverRoom);
    if(group['users'][user_id] != undefined)
        callback(group['users'][user_id]['now']['name']);
}

everyone.now.leaveRoom = function(callback){
    var group = nowjs.getGroup(this.now.serverRoom)
    group.locked = false;
    group.removeUser(this.user.clientId);
    callback();
}

// lock room if the user is moderator with atleast 2 players
everyone.now.lockRoom = function(callback){
    var moderator = this.now.moderator;
    var group = nowjs.getGroup(this.now.serverRoom);
    group.count(function (count) {
        if(moderator && count > 1 && count < (max_group_count + 1)){
            group.locked = true;
        }
        callback(group.locked);
    });
}

everyone.now.groupCount = function(group_id, callback){
    nowjs.getGroup(group_id).count(function (count) {
        callback(count);
    });
}

everyone.now.getRoomStatus = function(group_id, callback){
    if(group_id != undefined)
        callback(nowjs.getGroup(group_id).locked);
    else
        callback(nowjs.getGroup(this.now.serverRoom).locked);
}

Array.prototype.findIndex = function(value){
    var ctr = -1;
    for (var i=0; i < this.length; i++) {
        if (this[i] == value) {
            return i;
        }
    }
    return ctr;
}

everyone.now.update = function(pawn_id, att, from_id, to_id, value) {
    var group = nowjs.getGroup(this.now.serverRoom);
    group.now.updatePawn(pawn_id, att, from_id, to_id, value);
}

everyone.now.turn_change = function(){
    var group = nowjs.getGroup(this.now.serverRoom);
    var current_player = this.now;
    group.count(function (count) {
        var removed_players = 0;
        for(var x in group.now.players_arr){
            if(group.now.players_arr[x] == -1)
                removed_players += 1;
        }
        var groupCount = count + removed_players;
        group.now.turn = (group.now.turn + 1) % groupCount;
        while(group.now.players_arr[group.now.turn] == -1){
            group.now.turn = (group.now.turn + 1) % groupCount;
        }
        send_turn_change_info(group, current_player);
    });
}

function send_turn_change_info(group, current_player){
    current_player.distributeGamePlay(current_player.name + "'s turn completed");
    var users = group['users'];
    for(var user in users){
        if(users[user]['now']['uuid'] == group.now.players_arr[group.now.turn]){
            current_player.distributeGamePlay(users[user]['now']['name'] + "'s turn to play");
            break;
        }
    }
}

everyone.now.addPlayer = function(pid) {
    var group = nowjs.getGroup(this.now.serverRoom);
    group.now.players_arr.push(pid);
    console.log(group.now.players_arr);
}

everyone.now.get_val = function(values) {
    //get array check here itself.
    var possible_values = [1,2,3,4,8];

    // dice restrictions for a 4 and an 8
    var count_4 = 0, count_8 = 0, v_index = values.length;
    while(v_index > 0){
        if(values[v_index] == 4)
            count_4 += 1;
        if(values[v_index] == 8)
            count_8 += 1;
        v_index -= 1;
    }
    if(count_4 >= 2){
        var rem_index = possible_values.indexOf(4);
        if(rem_index != -1)
            possible_values.splice(rem_index, 1);
    }
    if(count_8 >= 2){
        var rem_index = possible_values.indexOf(8);
        if(rem_index != -1)
            possible_values.splice(rem_index, 1);
    }

    _val = possible_values[Math.floor(Math.random() * possible_values.length)];
    everyone.now.vali = _val;
    var suffix = "";
    if(everyone.now.vali == 4 || everyone.now.vali == 8)
        suffix = " to Roll Again";
    else
        suffix = " to move";
    this.now.distributeGamePlay(this.now.name + " rolled " + everyone.now.vali +
        ", " + this.now.name + suffix);
}
