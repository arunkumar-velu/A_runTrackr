import Geo from "../geo";
import User from "../user";
export default {
  init(){
    window.at.socket = io();
    window.at.socket.on('connected', this.connectionCallback.bind(this)); 
  },
  getUserChannel(){
    return 'gps:users';
  },
  currentUserChannel(user){
    return 'gps:'+user;
  },
  connectionCallback(){
    console.log("That was simple, you're now connected to Socket.io in realtime");
    this.subToUser();
    User.getUsers((users) => {
      this.pusToUSer(users);
    })
  },
  subToUser(){
    window.at.socket.on('updateUser', User.updateUser.bind(this));
  },
  pusToUSer(users){
    window.at.socket.emit('updateUser', users);
  },
  onMove(message) {
    Geo.redraw(message.latLng);
  },
  publishToMove(email, payload){
    window.at.socket.emit('move', email, payload);
  },
  subscribeToMove(email){
    window.at.socket.emit('join channel', email);
    window.at.socket.on('move', this.onMove);
  }
};