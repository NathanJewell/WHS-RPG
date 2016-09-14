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

function sleep( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}

last = true;
respond = function(string) {
  if(last) {
    $("#response").html(string);
    last = false;
  } else {
    $("#responsem").html(string);
    last = true;
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
    shuffle(keys);
    $("#options li").each(function(index, li) {   //iterate through list elements
        console.log(index);
        var item = $(this);
        item.html(keys[index]);
    });
};

randomJSON = function(json) {   //selects random first layer key from json array
    var keys = Object.keys(json);
    var rand = keys[Math.floor(Math.random() * keys.length)];
    return json[rand];
};

startFight = function() {
    var monster = randomJSON(monsterJSON);
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
    respond(responseString);
    player.health -= dmg.damage;
    $("#playerhealth").html("Player : " + player.health);
    $("#monsterhealth").html("Monster : " + currentMonsterHealth);
    //update healthbar
    if(player.health <= 0)
    {
        alert("You were defeated by " + currentMonster.name + ". Oh no. Try again?");
        location.reload();
        //refresh page
    }
};

startRoam = function(player) {
    option = randomJSON(roamjects);
    currentObject = option;

    makeHeader(option.name, " ", " ", option.description);
    makeOptions(option.moves);
    $("#monsterhealth").html("Monster: n/a")
};

startFight();
monsterAttack();
var state = "fight";

response = function(option) {
    if(state == "fight") {
        var dmg = damageValue(currentOptions[option.html()]);
        var responseString = effectString("You", option.html(), dmg.string, dmg.damage);
        respond(responseString);
        currentMonsterHealth -= dmg.damage;
        $("#monsterhealth").html("Monster : " + currentMonsterHealth);
        console.log(currentMonsterHealth);

        if (currentMonsterHealth > 0){
          console.log("here");
          monsterAttack();
        }
    } else if (state == "roam") {

        var responses = currentObject.moves[option.html()].split("|");
        console.log(responses);
        var responseString = responses[0];
        var dmg = damageValue(responses[1]);
        player.health += dmg.damage;
        $("#playerhealth").html("phealth " + player.health)
        respond(responseString + " You gain " + dmg.damage + " health.")
        //need to pause here somehow
        startFight();
        monsterAttack();
        state = "fight";
    }
    if(currentMonsterHealth <= 0) {
        alert("You defeated " + currentMonster.name + "! Back to exploring!");
        state = "roam";
        respond("");
        respond("");
        startRoam();
        currentMonsterHealth = 100;
      }
    //process clicked option response
}

$("#options li").click(function() {
    response($(this));
});
