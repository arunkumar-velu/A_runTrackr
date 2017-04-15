var map;
var map_marker;
var lat = null;
var lng = null;
var lineCoordinatesArray = []; 
$.ajax({
  method: "GET",
  dataType:"json",
  contentType: "application/json; charset=utf-8",
  url: "/current_user",
})
.done(function( result ) {
  var room = result.data.email;
  window.currentRoom = room;
  window.currentUser = result.data;
  $('.user-name img').initial({name: window.currentUser.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight:400});
  $(".user-name h4").html(window.currentUser.name);
  $(".user-name span").html(window.currentUser.email);
})
.fail(function(err){
  window.location = "/login"
});

var ably = new Ably.Realtime('D9-Hbw.AHCfmQ:Z4QGvUadpPueKYhP');
ably.connection.on('connected', function() {
  console.log("That was simple, you're now connected to Ably in realtime");
  var usersChannel = ably.channels.get("gps:users");
  usersChannel.subscribe('updateUser', function(user) {
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
      var channel = ably.channels.get('gps:'+email);
      channel.subscribe('move', function(message) {
        redraw(message.data.latLng);
      });
      initialize();
    })
  });
  $.ajax({
      method: "GET",
      dataType:"json",
      contentType: "application/json; charset=utf-8",
      url: "/users"
    })
      .done(function( result ) {
        var userChannel = ably.channels.get("gps:users");
        userChannel.publish('updateUser', result);
      });
}); 

// sets your location as default
//alert(navigator.geolocation)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) { 
    var locationMarker = null;
    if (locationMarker){
        return;
    }
    lat = position.coords["latitude"];
    lng = position.coords["longitude"];
    console.log(lat,lng);
    // initialize google maps
    google.maps.event.addDomListener(window, 'load', initialize());
  },
  function(error) {
      console.log("Error: ", error);
  },
  {
      enableHighAccuracy: true
  });
}
function initialize() {
  console.log("Google Maps Initialized")
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 15,
    center: {lat: lat, lng : lng, alt: 0}
  });
  lineCoordinatesArray.push(new google.maps.LatLng(lat, lng));
  map_marker_from = new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});
  map_marker_to = new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});
  map_marker_from.setMap(map);
  map_marker_to.setMap(map);
  google.maps.event.addListener(map, 'click', function(event) {
  lat =  event.latLng.lat();
  lng =  event.latLng.lng();
  var moveData = { 
    latLng : {
      lat : lat,
      lng : lng
    },
    room : window.currentRoom
  }
  console.log(window.currentRoom)
  var channel = ably.channels.get("gps:"+currentRoom);
  channel.publish('move', moveData);
  });


  // ###### Watch #####

  function onSuccess(position) {
    lat =  position.coords.latitude ;
    lng =  position.coords.longitude;
    var moveData = {
      latLng : {
        lat : lat,
        lng : lng
      },
      room : window.currentRoom
    }
    console.log(window.currentRoom)
    var channel = ably.channels.get("gps:"+currentRoom);
    channel.publish('move', moveData);
  }


  function onError(error) {
    console.log('code: '    + error.code    + '\n' +
       'message: ' + error.message + '\n');
  }

  var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
  //#### end ######
}

// moves the marker and center of map
function redraw(latLng) {
  
  lat = latLng.lat;
  lng = latLng.lng;
  console.log(lat,lng);
  
  map.setCenter({lat: lat, lng : lng, alt: 0})
  map_marker_to.setPosition({lat: lat, lng : lng, alt: 0});
  pushCoordToArray(lat, lng);

  var lineCoordinatesPath = new google.maps.Polyline({
    path: lineCoordinatesArray,
    geodesic: true,
    strokeColor: '#2E10FF',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  
  lineCoordinatesPath.setMap(map);
}


function pushCoordToArray(latIn, lngIn) {
  lineCoordinatesArray.push(new google.maps.LatLng(latIn, lngIn));
}


$("#username").change(function(e){
  var selectedUser = $("#username option:selected").val();
  var selectedUserName = $("#username option:selected").text();
    $(this).data("old", $(this).data("new") || "");
    $(this).data("new", $(this).val());
    console.log($(this).data("old"),$(this).data("new"))
  $(".tracks_name").html(" tracks "+ selectedUserName);
  var channel = ably.channels.get('gps:'+selectedUser);
  channel.subscribe('move', function(message) {
    redraw(message.data.latLng);
  });
  initialize();
});

$(".user-profile").click(function(){
  $(".user-signout").toggleClass("hide");
});
$(".user-signout").click(function(){
  $.ajax({
    method: "POST",
    dataType:"json",
    contentType: "application/json; charset=utf-8",
    url: "/sign_out",
  })
  .done(function( result ) {
    window.location = "/login"
  });
});


