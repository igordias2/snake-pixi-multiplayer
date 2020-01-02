var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = [{}];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket){
  socket.on('userlogin', (username) => {
    socket.broadcast.emit('chat message', username + ' connected');
    var id = socket.id;
    var pos = {x, y};
    users.push({id, username, pos});
    console.log(username + ' connected, id: ' + socket.id);
  });
  socket.on('changename', (nameToChange) => { 
    for (let index = 0; index < users.length; index++) {
     if(users[index].id == socket.id){
        users[index].username = nameToChange;
        socket.emit('changename', nameToChange);
      }
    }
  });
  socket.on('chat message', (msgg) => { 
    console.log(msgg); socket.broadcast.emit('chat message', msgg);
  });
  socket.on('move msg', (movePos) => { 
    console.log ("o player " + socket.id + " se moveu para " + movePos);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});