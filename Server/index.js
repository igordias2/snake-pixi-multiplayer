var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(3000, () => {
  console.log('listening on *:3000');
});

var connecteds = 0;

setInterval(gameUpdate, 500);

function gameUpdate(){
  updatePlayers();
};

let users = [];
var food = [];




function playerSnake(){

  let playerSnake = {};

  var x = 0;
  var y = 0;
  playerSnake.pos = {
    x,y
  };

  playerSnake.pos.x = 32;
  playerSnake.pos.y = 0;
  playerSnake.moveDirection = 3;


  return playerSnake;
}

io.on('connection', function(socket){
  
  playerConnection(socket);
  socket.on('disconnect', () => {
    removePlayer(GetPlayerByID(socket.id));
  });
  socket.on('playerChangeDirection', (dir) => { 
    let player = GetPlayerByID(socket.id);
    player.snake.moveDirection = dir;
  });
  
});
function removePlayer(player){
  
  users.splice(users.indexOf(player),1);
  io.emit(playerRemove, player.playerid);
}
function GetPlayerByID(id){
  for (let index = 0; index < users.length; index++)
    if(users[index].playerid == id)
      return users[index];
    
  return null;
}

function updatePlayers() {
  console.log(users.length);
  for (let index = 0; index < users.length; index++) {
    var user = users[index];
    moveHead(user);
  }
}

function moveHead(user){
  if(connecteds > 0)
  {
    switch (user.snake.moveDirection) {
      case 0:
        user.snake.pos.y -= 32;
        break;
      case 1:
        user.snake.pos.x -= 32;
        break;
      case 2:
        user.snake.pos.y += 32;
        break;
      case 3:
        user.snake.pos.x += 32;
        break;
    }

    io.emit(playerMove, user.playerid, user.snake.pos, user.snake.moveDirection);

  }
}

function playerConnection(socket) {
  var playerid = socket.id;
  var snake = playerSnake();
  let user = new Player(playerid, snake, socket);

  users.push(user);
  socket.emit(playerConnected, socket.id, [user.snake.pos.x, user.snake.pos.y], true);
  socket.broadcast.emit(playerConnected, socket.id, [user.snake.pos.x, user.snake.pos.y],false);
  
  
  for (let index = 0; index < users.length; index++) {
    const p = users[index];
    socket.emit(playerConnected, p.playerid, [p.snake.pos.x,p.snake.pos.y], false);
  }
  
  connecteds++;
}

function Player(playerid, snake, socket){
  this.playerid = playerid;
  this.snake = snake;
  this.playerSocket = socket;
  this.playerScore = 0;

  function updateScore(score){
    this.playerScore += score;
    io.emit(playerScoreChange, this.playerid, );
  }
}
function Food(foodScore, foodPos){
  this.foodScore = foodScore;
  var x,y;
  this.pos = {x,y};
  this.pos.x = foodPos[0];
  this.pos.y = foodPos[1];
}

const playerScoreChange = 'scorechange';
const playerConnected = 'assign player id';
const playerConnectedBroadcast = 'assign network player id';
const playerChangeDirection = 'playerChangeDirection';
const playerMove = 'moveplayer';
const playerRemove = 'destroyplayer';
const foodSpawn = 'spawnfood';
const foodDestroy = 'destroyfood';