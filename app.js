var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var user = []

app.get('/', function(req, res){
   res.sendFile(__dirname + '/view/index.html');
});
app.use("/js", express.static(__dirname + '/js'));
//var nsp = io.of('/a_runTrackr');
io.on('connection', function (socket) {
		//socket.join('track room');
		socket.on("move",function(lanlt){
			console.log("room111111111",socket.id)
			//io.sockets.connected[socket.id].emit('move', lanlt);
			//socket.broadcast.to( socket.id ).emit('move', lanlt);
			io.to(socket.id ).emit('move', lanlt);
			//nsp.adapter.rooms[socket.id].emit('move', );
    //nsp.emit('move', lanlt);
    //console.log(clients)
  });
  socket.on("addUser",function(person){
    user.push({name: person, socketId : socket.id});
    socket.userName = person;
    console.log(user)
    socket.broadcast.emit('updateUser', user);
  });
  socket.on("selected user",function(socketId){
    socket.join(socketId);
    console.log("room",socketId)
  });

  
  
 //var clients = nsp.adapter.rooms["track room"];
});

http.listen(7000, function(){
  console.log('listening on *:3000');
});