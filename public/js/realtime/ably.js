import Geo from "../geo";
import User from "../user";
export default {
  init(){
    window.at.ably = new Ably.Realtime('D9-Hbw.AHCfmQ:Z4QGvUadpPueKYhP');
    window.at.ably.connection.on('connected', this.connectionCallback.bind(this)); 
  },
  getUserChannel(){
    return 'gps:users';
  },
  currentUserChannel(user){
    return 'gps:'+user;
  },
  connectionCallback(){
    console.log("That was simple, you're now connected to Ably in realtime");
    this.subToUser();
    User.getUsers((users) => {
      this.pusToUSer(users);
    })
  },
  subToUser(){
    var usersChannel = window.at.ably.channels.get(this.getUserChannel());
    usersChannel.subscribe('updateUser', User.updateUser.bind(this));
  },
  pusToUSer(users){
    var userChannel = window.at.ably.channels.get(this.getUserChannel());
    userChannel.publish('updateUser', users);
  },
  onMove(message) {
    Geo.redraw(message.data.latLng);
  },
  publishToMove(email, payload){
    var channel = window.at.ably.channels.get(this.currentUserChannel(email));
    channel.publish('move', payload);
  },
  subscribeToMove(email){
    var channel = window.at.ably.channels.get(this.currentUserChannel(email));
    channel.subscribe('move', this.onMove);
  }
};