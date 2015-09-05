var socketIo = function(io,user){
  var db = require('../db/db')
  io.on('connection', function (socket) {
  	socket.on("move",function(lanlt){
      console.log("$$$$$$", lanlt)
  		io.to(lanlt.room).emit('move', lanlt);
    });

    socket.on("join room", function(room){
      socket.join(room);
      var collection = db.get().collection('userslist') 
      collection.find().toArray(function(err, users) {
        io.sockets.emit('updateUser', users);
      });
      console.log("joined room ",room)
    })

    socket.on("leave room", function(room){
      socket.leave(room);
      console.log("leaved room ",room)
    })
  });
}
module.exports = socketIo;