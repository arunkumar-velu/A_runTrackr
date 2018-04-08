import Geo from "../geo";
import User from "../user";
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
  subToUser(){
    var usersChannel = window.at.ably.channels.get(this.getUserChannel());
    usersChannel.subscribe('updateUser', this.updateUser.bind(this));
  },
  pusToUSer(users){
    var userChannel = window.at.ably.channels.get(this.getUserChannel());
    userChannel.publish('updateUser', users);
  },
  getUserChannel(){
    return 'gps:users';
  },
  currentUserChannel(user){
    return 'gps:'+user;
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
  },
  updateUser(user) {
    let _self = this;
    console.log("user",user)
    $(".users-container ul").empty();
    $.each(user.data,function(index,val){
      console.log("user",val.name)
      $(".users-container ul").append("<li email="+val.email+"><div class='user-name'><img class='profile img-rounded' ><div><h5>"+val.name+"</h5> <span>"+val.email+"</span></div></div></li>");
      $('.users-container ul li:last img').initial({name: val.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight:400});
    })
    $(".users-container ul li").on('click', function(){
      var email = $(this).attr("email");
      $(".users-container ul li").removeClass("active");
      $(this).addClass("active");
      _self.subscribeToMove(email);
      Geo.init();
    })
  }
};