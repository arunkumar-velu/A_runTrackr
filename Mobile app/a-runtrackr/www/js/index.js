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

    document.addEventListener("backbutton", function(){
        cordova.plugins.backgroundMode.enable();
    }, false);
    document.addEventListener("resume", function(){
            cordova.plugins.backgroundMode.disable();
        }, false);

    // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function () {
            setTimeout(function () {
                // Modify the currently displayed notification
                cordova.plugins.backgroundMode.configure({
                    text:'Geo Location is ON'
                });

            }, 5000);
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
                                                                 socket.emit('move', moveData);
                                       }


                                       function onError(error) {
                                           alert('code: '    + error.code    + '\n' +
                                                 'message: ' + error.message + '\n');
                                       }


                                       var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });


                                       //#### end ######
        }
        var parentElement = document.getElementById(id);
        var person = prompt("Please enter mail id", "");
                if (person != null) {
                    socket.emit("addUser",person);
                    $(".user_name").html(person);
                    var result = person.split("@")
                     var val = {name: result[0],email: person};
                    $.ajax({
                      method: "POST",
                      dataType:"json",
                      contentType: "application/json; charset=utf-8",
                      url: "http://a-runtrackr.herokuapp.com/users",
                      jsonpCallback : "callback",
                      data: JSON.stringify(val)
                    })
                      .done(function( result ) {
                        var room = result.data.email;
                        window.currentRoom = room;
                        socket.emit("join room",room);
                        console.log( "Data Saved" );
                      });
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
                                     socket.emit('move', moveData);
           }


           function onError(error) {
               alert('code: '    + error.code    + '\n' +
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
    

    socket.on("move", function(latLng){
       redraw(latLng.latLng);
    });
    socket.on("updateUser", function(user){
          console.log("user",user)
          $("#username").empty();
          $("#username").append(" <option>...</option>");
          $.each(user,function(index,val){
            console.log("user",val)
            $("#username").append("<option value='"+val.email+"'>"+val.name+"</option>")
          })
        });

        $("#username").change(function(e){
          var selectedUser = $("#username option:selected").val();
          var selectedUserName = $("#username option:selected").text();
            $(this).data("old", $(this).data("new") || "");
            $(this).data("new", $(this).val());
            console.log($(this).data("old"),$(this).data("new"))
            socket.emit("leave room",$(this).data("old"));
            socket.emit("join room",$(this).data("new"));
            $(".tracks_name").html(" tracks "+ selectedUserName);
            initialize();

        })

        //google.maps.event.addDomListener(window, 'load', initialize);

    }
};

app.initialize();