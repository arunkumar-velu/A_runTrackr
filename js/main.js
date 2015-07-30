//var socket = io("/a_runTrackr");
var socket = io();

(function(){
    var map;
    var map_marker;
    var lat = null;
    var lng = null;
    var lineCoordinatesArray = [];


    var person = prompt("Please enter your name", "");
    if (person != null) {
       socket.emit("addUser",person);
       $(".user").html(person);
    }

    // sets your location as default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) { 
        var locationMarker = null;
        if (locationMarker){
          // return if there is a locationMarker bug
          return;
        }

        lat = position.coords["latitude"];
        lng = position.coords["longitude"];
        console.log(lat,lng)
        // calls PubNub

        // initialize google maps
        google.maps.event.addDomListener(window, 'load', initialize());
      },
      function(error) {
        console.log("Error: ", error);
      },
      {
        enableHighAccuracy: true
      }
      );
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
       //$(".map-container").hide();
       google.maps.event.addListener(map, 'click', function(event) {
        //marker = new google.maps.Marker({position: event.latLng, map: map});
        //redraw(event.latLng);
      lat =  event.latLng.lat();
      lng =  event.latLng.lng();
      var latLng = {
        lat : lat,
        lng : lng
      }
        socket.emit('move', latLng);
      });
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
    

    socket.on("move", function(latLng){
      redraw(latLng);
    });
    socket.on("updateUser", function(user){
      console.log("user",user)
      $("#username").empty();
      $("#username").append(" <option>...</option>");
      $.each(user,function(index,val){
        $("#username").append("<option value='"+val.socketId+"'>"+val.name+"</option>")
      })
    });

    $("#username").change(function(e){
      var selectedUser = $("#username option:selected").val();
      var selectedUserName = $("#username option:selected").text();
      socket.emit("selected user",selectedUser)
      $(".user").append(" tracks "+ selectedUserName);
      $(".map-container").show();

    })

    
})();

