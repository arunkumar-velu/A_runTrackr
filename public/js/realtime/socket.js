import Geo from "../geo";
import User from "../user";
import RealTime from './realtime';
export default {
  init(){
    window.at.socket = io();
    window.at.socket.on('connected', this.connectionCallback.bind(this)); 
  },
  connectionCallback(){
    console.log("That was simple, you're now connected to Socket.io in realtime");
    this.subToUser();
    User.getUsers((users) => {
      this.pusToUSer(users);
    })
  },
  subToPrivateChannel(email){
    window.at.socket.emit('join_private_channel', email);
    window.at.socket.on('messageToUser', User.onMessage.bind(this));
  },
  pubToPrivateChannel(email, payload){
    window.at.socket.emit('messageToUser', email, payload);
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
    window.at.socket.emit('join_user_channel', email);
    window.at.socket.on('move', this.onMove);
  }
};