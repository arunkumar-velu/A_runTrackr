import Geo from "../geo";
import User from "../user";
import RealTime from './realtime';
export default {
  init(){
    window.at.ably = new Ably.Realtime('D9-Hbw.AHCfmQ:Z4QGvUadpPueKYhP');
    window.at.ably.connection.on('connected', this.connectionCallback.bind(this)); 
  },
  connectionCallback(){
    console.log("That was simple, you're now connected to Ably in realtime");
    this.subToUser();
    User.getUsers((users) => {
      this.pusToUSer(users);
    })
  },
  subToPrivateChannel(email){
    var priavteChannel = window.at.ably.channels.get(RealTime.getPrivateChannel(email));
    priavteChannel.subscribe('messageToUser', User.onMessage.bind(this));
  },
  pubToPrivateChannel(email, payload){
    var priavteChannel = window.at.ably.channels.get(RealTime.getPrivateChannel(email));
    priavteChannel.publish('messageToUser', payload);
  },
  subToUser(){
    var usersChannel = window.at.ably.channels.get(RealTime.getUserChannel());
    usersChannel.subscribe('updateUser', User.updateUser.bind(this));
  },
  pusToUSer(users){
    var userChannel = window.at.ably.channels.get(RealTime.getUserChannel());
    userChannel.publish('updateUser', users);
  },
  onMove(message) {
    Geo.redraw(message.data.latLng);
  },
  publishToMove(email, payload){
    var channel = window.at.ably.channels.get(RealTime.currentUserChannel(email));
    channel.publish('move', payload);
  },
  subscribeToMove(email){
    var channel = window.at.ably.channels.get(RealTime.currentUserChannel(email));
    channel.subscribe('move', this.onMove);
  }
};