var socketIo = function(io,user){
  var db = require('../db/db')
  io.on('connection', function (socket) {
    socket.emit("connected");
    socket.join('gps:users');
    socket.on('updateUser', function(users){
      io.to('gps:users').emit('updateUser', users);
    });
    socket.on('move', function(email, payload){
      io.to('gps:'+email).emit('move', payload);
    });
    socket.on('join channel', function(email){
      socket.join('gps:'+email);
    })
  });
}
module.exports = socketIo;