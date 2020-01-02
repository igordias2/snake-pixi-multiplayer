var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var connecteds = 0;

setInterval(gameUpdate, 3000);

function gameUpdate(){
  updatePlayers();
};

let users = [];

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


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  playerConnection(socket);


  socket.on('playerChangeDirection', (dir) => { 
    let player = GetPlayerByID(socket.id);
    player.snake.moveDirection = dir;
    console.log ("o player " + socket.id + " se moveu para " + dir);
  });
});

function GetPlayerByID(id){
  for (let index = 0; index < users.length; index++)
    if(users[index].playerid == id)
      return users[index];
    
  return null;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

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
    // if(socket == undefined)
    //   return;
    io.emit(playerMove, user.playerid, user.snake.pos, user.snake.moveDirection);
    //user.playerSocket.emit(playerMove, user.playerid, user.snake.pos);
    //user.playerSocket.broadcast.emit(playerMove, user.playerid, user.snake.pos);
    // console.log(user.snake.pos);
  }
}

function playerConnection(socket) {
  var playerid = socket.id;
  var snake = playerSnake();
  let user = new Player(playerid, snake, socket);

  users.push(user);

  io.emit(playerConnected, socket.id, [user.snake.pos.x, user.snake.pos.y]);
  for (let index = 0; index < users.length; index++) {
    const p = users[index];
    socket.emit(playerConnected, p.playerid, [p.snake.pos.x,p.snake.pos.y]);
  }
  // socket.emit(playerConnected, socket.id, [user.snake.pos.x, user.snake.pos.y]);
  // socket.broadcast.emit(playerConnectedBroadcast, socket.id, [0, 0]);


  connecteds++;
}

function Player(playerid, snake, socket){
  this.playerid = playerid;
  this.snake = snake;
  this.playerSocket = socket;
}


const playerConnected = 'assign player id';
const playerConnectedBroadcast = 'assign network player id';
const playerChangeDirection = 'playerChangeDirection';
const playerMove = 'moveplayer';