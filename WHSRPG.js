//requires jquery

var generalmoves = {
    "text a friend" : "5:20",
    "ignore" : "5:20",
    "chew gum loudly" : "10:30",
    "kick" : "5:20",
    "punch" : "5:20",
    "threaten to sue" : "20:40",
    "teen angst" : "10:30"
}

var generalmovekeys = Object.keys(generalmoves);

var effects = ["ineffective", "somewhat effective", "effective", "very effective", "extremely effective", "super duper effective"];
currentObject = {};
currentMonster = {};
var currentMonsterHealth = 100;
currentOptions = {};

var player =
{
    "name" : "Player",
    "health" : 100,
    "inventory" :
    {
        "hydro" : 0,
        "orange" : 0
    }
};

var responses = [];
var fought = ["noone", "someone"];

function sleep( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}

respond = function(string, type) {
    responses.push({str: string, cls: type});
    if(responses.length > 6)
    {
        responses.shift();
    }
    $("#responses").empty();
    for(i = 0; i < responses.length; i++) {
        var obj = responses[i];
        $("<li class=\"" + obj.cls  + "\">" + obj.str + "</li>").appendTo("#responses");
    }
}

function shuffle(array) {       //copy pasterino Fisher-Yates "Knuth" Shuffle http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

effectString = function(name, move, effectivity, damage) {
  return(name + " used \"" + move + "\".\n It was " + effectivity + "! : " + damage + " damage");
};

damageValue = function(dmgstr) {
    var strparse = dmgstr.split(":");
    var range = parseInt(strparse[1]) - parseInt(strparse[0]);
    var effect = Math.random();
    if(range < 1) { effect = .999;}
    var effectString = effects[Math.floor(effect*6)];
    return {"damage" : Math.floor(parseInt(strparse[0]) + (effect * range)), "string" : effectString};
};

makeHeader = function(name, clss, room, descrip) {
    $("#name").html(name);
    $("#type").html(clss);
    $("#room").html(room);
    $("#description").html(descrip + " What do you do?");
};

makeOptions = function(options) {
    currentOptions = options;
    var keys = Object.keys(options);
    $("#options").empty();
    shuffle(keys);
    for(i = 0; i < keys.length; i++) {

        $("<li>" + keys[i] + "</li>").appendTo("#options");
    }
    $("#options li").click(function() {
        response($(this));
    });

    /*
    $("#options li").each(function(index, li) {   //iterate through list elements
        console.log(index);
        var item = $(this);
        item.html(keys[index]);
    });
    */
};

randomJSON = function(json) {   //selects random first layer key from json array
    var keys = Object.keys(json);
    var rand = keys[Math.floor(Math.random() * keys.length)];
    return json[rand];
};

startFight = function() {
    var monster = randomJSON(monsterJSON);

    while(fought.indexOf(monster.name) != -1) {
      monster = randomJSON(monsterJSON);
    }
    currentMonsterHealth = 100;
    makeHeader(monster.name, monster.type, monster.room, monster.description);
    var responses = monster.responses;

    var numOptions = Object.keys(responses).length;
    numOptions = 4-numOptions;  //calculate number to generate

    for(i = 0; i < numOptions; i++) {   //generate that many more
        randkey = generalmovekeys[Math.floor(Math.random() * generalmovekeys.length)];
        responses[randkey] = generalmoves[randkey];
    }
    makeOptions(responses);
    currentMonster = monster;
};

monsterAttack = function() {
    var moves = Object.keys(currentMonster.moves);
    var movekey = moves[Math.floor(Math.random() * moves.length)];
    var moveval = currentMonster.moves[movekey];
    var dmg = damageValue(moveval);
    var responseString = effectString(currentMonster.name, movekey, dmg.string, dmg.damage);
    respond(responseString, "damage");
    player.health -= dmg.damage;
    $("#playerhealth").html("Player : " + player.health);
    $("#monsterhealth").html("Monster : " + currentMonsterHealth);
    //update healthbar
    if(player.health <= 0)
    {
        respond("You were defeated by " + currentMonster.name + ". Oh no. Trying again.", "message");
        alert("You were defeated by " + currentMonster.name + ". Oh no. Trying again.");
        location.reload();
        //refresh page
    }
};

startRoam = function() {
    $("#playerhealth").html("Player: " + player.health);
    option = randomJSON(roamjects);
    currentObject = option;

    makeHeader(option.name, "----------", "----------", option.description);
    makeOptions(option.moves);
    $("#monsterhealth").html("Monster: n/a");
};


var state = "roam";
startRoam();

response = function(option) {
    if(state == "fight") {
        var dmg = damageValue(currentOptions[option.html()]);
        var responseString = effectString("You", option.html(), dmg.string, dmg.damage);
        respond(responseString, "attack");
        currentMonsterHealth -= dmg.damage;
        $("#monsterhealth").html("Monster : " + currentMonsterHealth);
        console.log(currentMonsterHealth);


        if (currentMonsterHealth > 0){
          monsterAttack();
        }
    }
    if (state == "roam") {

        var response = currentObject.moves[option.html()].split("|");
        var responseString = response[0];
        var dmg = damageValue(response[1]);
        player.health += dmg.damage;
        $("#playerhealth").html("Player: " + player.health)
        respond(responseString + " You gain " + dmg.damage + " health.", "health")
        //need to pause here somehow
        startFight();
        monsterAttack();
        state = "fight";
    }
    if(currentMonsterHealth <= 0) {
        respond("You defeated " + currentMonster.name + "! Back to exploring!", "message");
        fought.push(currentMonster.name);
        state = "roam";
        startRoam();
        currentMonsterHealth = 100;
        if(fought.length == Object.keys(monsterJSON).length) {
          respond("Wow, nice job, you WON!!!!", "message");
          respond("Created by Nathan Jewell, Charlie Hall, Simon Prosser, and Eugene Munblit!!!", "message");
          //location.reload();
        }
      }


    //process clicked option response
}
