/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 var socket = io.connect("http://a-runtrackr.herokuapp.com");
var map;
    var map_marker;
    var lat = null;
    var lng = null;
    var lineCoordinatesArray = []; 
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();

    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var person = prompt("Please enter your name", "");
        if (person != null) {
            socket.emit("addUser",person);
            $(".user").html(person);
        }

        // sets your location as default
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position){
                                      var locationMarker = null;
                                      if (locationMarker){
                                          // return if there is a locationMarker bug
                                          return;
                                      }

                                      lat = position.coords["latitude"];
                                      lng = position.coords["longitude"];
                                      google.maps.event.addDomListener(window, 'load', initialize());
                  },function(errMsg){
                         navigator.geolocation.getCurrentPosition(function(position){
                                           var locationMarker = null;
                                           if (locationMarker){
                                               // return if there is a locationMarker bug
                                               return;
                                           }

                                           lat = position.coords["latitude"];
                                           lng = position.coords["longitude"];
                                           google.maps.event.addDomListener(window, 'load', initialize());
                         },function(errMsg){
                           alert(JSON.stringify(errMsg))
                         }, {
                         enableHighAccuracy: true,
                         timeout: 60*1000*2,
                         maximumAge: 1000*60*10
                         });
                    }, {
          enableHighAccuracy: false,
          timeout: 5*1000,
          maximumAge: 1000*60*10
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

        //google.maps.event.addDomListener(window, 'load', initialize);

    }
};

app.initialize();