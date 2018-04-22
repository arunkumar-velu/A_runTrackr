import Geo from "./geo";
import RealTime from './realtime/realtime';

export default {
  init(){
    this.getCurrentUser();
    this.addListeners();
    window.at.currentUser = {};
  },
  getUsers(cb){
    $.ajax({
      method: "GET",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/users"
    })
    .done(function( users ) {
      cb(users);
    });
  },
  getCurrentUser(){
    $.ajax({
      method: "GET",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/current_user",
    })
    .done(function( result ) {
      var room = result.data.email;
      window.at.currentRoom = room;
      window.at.currentUser.info = result.data;
      $('.user-name img').initial({name: window.at.currentUser.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight:400});
      $(".user-name h4").html(window.at.currentUser.info.name);
      $(".user-name span").html(window.at.currentUser.info.email);
      RealTime.platForm.subToPrivateChannel(result.data.email);
    })
    .fail(function(err){
      window.location = "/login"
    });
  },
  addListeners(){
    $("#username").change(this.onUserSelect);
    $(".user-profile").click(this.showProfileOptions);
    $(".user-signout").click(this.onSignOut);
  },
  updateUser(user) {
    console.log("user",user);
    let currentUser = window.at.currentUser;
    $(".users-container ul").empty();
    let users = user.data ? user.data : user;
    $.each(users, function(index,val){
      console.log("user",val.name)
      $(".users-container ul").append("<li email="+val.email+"><div class='user-name'><img class='profile img-rounded' ><div><h5>"+val.name+"</h5> <span>"+val.email+"</span></div></div></li>");
      $('.users-container ul li:last img').initial({name: val.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight:400});
    })
    $(".users-container ul li").on('click', function(){
      var email = $(this).attr("email");
      $(".users-container ul li").removeClass("active");
      $(this).addClass("active");
      RealTime.platForm.subscribeToMove(email);
      RealTime.platForm.pubToPrivateChannel(email, {event: 'getSelectedUserInfo', from: currentUser.info.email});
      // TODO need to reset the map on user selection
    })
  },

  setLatLng(latLng){
    window.at.currentUser.latLng = latLng;
  },

  onMessage(payload){
    let actualPayload = payload.data ? payload.data : payload;
    if(actualPayload){
      let event = actualPayload.event;
      let to = actualPayload.from;
      switch(event){
        case 'getSelectedUserInfo':
          RealTime.platForm.pubToPrivateChannel(to, 
          {
            event: 'selectedUserInfo', 
            from: window.at.currentUser.info.email, 
            user: window.at.currentUser
          });
          break;
        case 'selectedUserInfo':
          Geo.updateLatlng(actualPayload.user);
          break;
      }
    }
  },
  onUserSelect(event){
    var selectedUser = $("#username option:selected").val();
    var selectedUserName = $("#username option:selected").text();
    $(this).data("old", $(this).data("new") || "");
    $(this).data("new", $(this).val());
    console.log($(this).data("old"),$(this).data("new"))
    $(".tracks_name").html(" tracks "+ selectedUserName);
    RealTime.platForm.subscribeToMove(selectedUser);
  },
  showProfileOptions(){
    $(".user-signout").toggleClass("hide");
  },
  onSignOut(){
    $.ajax({
      method: "POST",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/sign_out",
    })
    .done(function( result ) {
      window.location = "/login"
    });
  }
}