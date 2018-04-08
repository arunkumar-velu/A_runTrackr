(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ably = require('./realtimesocket/ably');

var _ably2 = _interopRequireDefault(_ably);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _geoHelper = require('./helpers/geoHelper');

var _geoHelper2 = _interopRequireDefault(_geoHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  lineCoordinatesArray: [],
  init: function init() {
    var _this = this;

    _ably2.default.init();
    _user2.default.init();
    _geoHelper2.default.currentLocation(function (geoInfo) {
      if (geoInfo) {
        _this.initMap(geoInfo);
      }
    });
    this.addWatchToPosition();
  },
  initMap: function initMap(geoInfo) {
    var _this2 = this;

    var lat = geoInfo.lat;
    var lng = geoInfo.lng;
    this.map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 15,
      center: { lat: lat, lng: lng, alt: 0 }
    });
    this.lineCoordinatesArray.push(new google.maps.LatLng(lat, lng));
    this.map_marker_from = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.map });
    this.map_marker_to = new google.maps.Marker({ position: { lat: lat, lng: lng }, map: this.map });
    this.map_marker_from.setMap(this.map);
    this.map_marker_to.setMap(this.map);

    // Just added here for testing purpose
    google.maps.event.addListener(this.map, 'click', function (event) {
      var lat = event.latLng.lat();
      var lng = event.latLng.lng();
      var moveData = {
        latLng: {
          lat: lat,
          lng: lng
        },
        room: window.at.currentRoom
      };
      console.log(window.at.currentRoom);
      _this2.map.setCenter({ lat: lat, lng: lng, alt: 0 });
      _this2.map_marker_to.setPosition({ lat: lat, lng: lng, alt: 0 });
      _ably2.default.publishToMove(window.at.currentRoom, moveData);
    });
  },
  addWatchToPosition: function addWatchToPosition() {
    navigator.geolocation.watchPosition(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var moveData = {
        latLng: {
          lat: lat,
          lng: lng
        },
        room: window.at.currentRoom
      };
      console.log(window.at.currentRoom);
      _ably2.default.publishToMove(window.at.currentRoom, moveData);
    }, function (error) {
      console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }, { timeout: 30000 });
  },
  redraw: function redraw(latLng) {
    var lat = latLng.lat;
    var lng = latLng.lng;
    this.map.setCenter({ lat: lat, lng: lng, alt: 0 });
    this.map_marker_to.setPosition({ lat: lat, lng: lng, alt: 0 });
    this.pushCoordToArray(lat, lng);

    var lineCoordinatesPath = new google.maps.Polyline({
      path: this.lineCoordinatesArray,
      geodesic: true,
      strokeColor: '#2E10FF',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    lineCoordinatesPath.setMap(this.map);
  },
  pushCoordToArray: function pushCoordToArray(latIn, lngIn) {
    this.lineCoordinatesArray.push(new google.maps.LatLng(latIn, lngIn));
  }
};

},{"./helpers/geoHelper":2,"./realtimesocket/ably":4,"./user":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  currentLocation: function currentLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        cb({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, function (error) {
        switch (error.code) {
          case error.TIMEOUT:
            console.log("Browser geolocation error !\n\nTimeout.");
            break;
          case error.PERMISSION_DENIED:
            if (error.message.indexOf("Only secure origins are allowed") == 0) {
              jQuery.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDCa1LUe1vOczX1hO_iGYgyo8p_jYuGOPU", function (success) {
                cb({ lat: success.location.lat, lng: success.location.lng });
              }).fail(function (err) {
                console.log("API Geolocation error! \n\n" + err);
                cb(null);
              });
            }
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Browser geolocation error !\n\nPosition unavailable.");
            break;
        }
      }, { maximumAge: 50000, timeout: 20000, enableHighAccuracy: true });
    } else {
      console.log("Browser doesn't support GEO LOCATION");
    }
  }
};

},{}],3:[function(require,module,exports){
"use strict";

var _geo = require("./geo");

var _geo2 = _interopRequireDefault(_geo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.at = {};
_geo2.default.init();

},{"./geo":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _geo = require("../geo");

var _geo2 = _interopRequireDefault(_geo);

var _user = require("../user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  init: function init() {
    window.at.ably = new Ably.Realtime('D9-Hbw.AHCfmQ:Z4QGvUadpPueKYhP');
    window.at.ably.connection.on('connected', this.connectionCallback.bind(this));
  },
  connectionCallback: function connectionCallback() {
    var _this = this;

    console.log("That was simple, you're now connected to Ably in realtime");
    this.subToUser();
    _user2.default.getUsers(function (users) {
      _this.pusToUSer(users);
    });
  },
  subToUser: function subToUser() {
    var usersChannel = window.at.ably.channels.get(this.getUserChannel());
    usersChannel.subscribe('updateUser', this.updateUser.bind(this));
  },
  pusToUSer: function pusToUSer(users) {
    var userChannel = window.at.ably.channels.get(this.getUserChannel());
    userChannel.publish('updateUser', users);
  },
  getUserChannel: function getUserChannel() {
    return 'gps:users';
  },
  currentUserChannel: function currentUserChannel(user) {
    return 'gps:' + user;
  },
  onMove: function onMove(message) {
    _geo2.default.redraw(message.data.latLng);
  },
  publishToMove: function publishToMove(email, payload) {
    var channel = window.at.ably.channels.get(this.currentUserChannel(email));
    channel.publish('move', payload);
  },
  subscribeToMove: function subscribeToMove(email) {
    var channel = window.at.ably.channels.get(this.currentUserChannel(email));
    channel.subscribe('move', this.onMove);
  },
  updateUser: function updateUser(user) {
    var _self = this;
    console.log("user", user);
    $(".users-container ul").empty();
    $.each(user.data, function (index, val) {
      console.log("user", val.name);
      $(".users-container ul").append("<li email=" + val.email + "><div class='user-name'><img class='profile img-rounded' ><div><h5>" + val.name + "</h5> <span>" + val.email + "</span></div></div></li>");
      $('.users-container ul li:last img').initial({ name: val.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight: 400 });
    });
    $(".users-container ul li").on('click', function () {
      var email = $(this).attr("email");
      $(".users-container ul li").removeClass("active");
      $(this).addClass("active");
      _self.subscribeToMove(email);
      _geo2.default.init();
    });
  }
};

},{"../geo":1,"../user":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ably = require("./realtimesocket/ably");

var _ably2 = _interopRequireDefault(_ably);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  init: function init() {
    this.getCurrentUser();
    this.addListeners();
  },
  getUsers: function getUsers(cb) {
    $.ajax({
      method: "GET",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "/users"
    }).done(function (users) {
      cb(users);
    });
  },
  getCurrentUser: function getCurrentUser() {
    $.ajax({
      method: "GET",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "/current_user"
    }).done(function (result) {
      var room = result.data.email;
      window.at.currentRoom = room;
      window.at.currentUser = result.data;
      $('.user-name img').initial({ name: window.at.currentUser.name, height: 40, width: 40, charCount: 1, fontSize: 18, fontWeight: 400 });
      $(".user-name h4").html(window.at.currentUser.name);
      $(".user-name span").html(window.at.currentUser.email);
    }).fail(function (err) {
      window.location = "/login";
    });
  },
  addListeners: function addListeners() {
    $("#username").change(this.onUserSelect);
    $(".user-profile").click(this.showProfileOptions);
    $(".user-signout").click(this.onSignOut);
  },
  onUserSelect: function onUserSelect(event) {
    var selectedUser = $("#username option:selected").val();
    var selectedUserName = $("#username option:selected").text();
    $(this).data("old", $(this).data("new") || "");
    $(this).data("new", $(this).val());
    console.log($(this).data("old"), $(this).data("new"));
    $(".tracks_name").html(" tracks " + selectedUserName);
    var channel = ably.channels.get('gps:' + selectedUser);
    _ably2.default.subscribeToMove(selectedUser);
    // initialize();
  },
  showProfileOptions: function showProfileOptions() {
    $(".user-signout").toggleClass("hide");
  },
  onSignOut: function onSignOut() {
    $.ajax({
      method: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "/sign_out"
    }).done(function (result) {
      window.location = "/login";
    });
  }
};

},{"./realtimesocket/ably":4}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvanMvZ2VvLmpzIiwicHVibGljL2pzL2hlbHBlcnMvZ2VvSGVscGVyLmpzIiwicHVibGljL2pzL21haW4uanMiLCJwdWJsaWMvanMvcmVhbHRpbWVzb2NrZXQvYWJseS5qcyIsInB1YmxpYy9qcy91c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7a0JBQ2U7QUFDYix3QkFBc0IsRUFEVDtBQUViLE1BRmEsa0JBRVA7QUFBQTs7QUFDSixtQkFBSyxJQUFMO0FBQ0EsbUJBQUssSUFBTDtBQUNBLHdCQUFVLGVBQVYsQ0FBMEIsVUFBQyxPQUFELEVBQWE7QUFDckMsVUFBRyxPQUFILEVBQVc7QUFDVCxjQUFLLE9BQUwsQ0FBYSxPQUFiO0FBQ0Q7QUFDRixLQUpEO0FBS0EsU0FBSyxrQkFBTDtBQUNELEdBWFk7QUFZYixTQVphLG1CQVlMLE9BWkssRUFZRztBQUFBOztBQUNkLFFBQUksTUFBTSxRQUFRLEdBQWxCO0FBQ0EsUUFBSSxNQUFNLFFBQVEsR0FBbEI7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLE9BQU8sSUFBUCxDQUFZLEdBQWhCLENBQW9CLFNBQVMsY0FBVCxDQUF3QixZQUF4QixDQUFwQixFQUEyRDtBQUNwRSxZQUFNLEVBRDhEO0FBRXBFLGNBQVEsRUFBQyxLQUFLLEdBQU4sRUFBVyxLQUFNLEdBQWpCLEVBQXNCLEtBQUssQ0FBM0I7QUFGNEQsS0FBM0QsQ0FBWDtBQUlBLFNBQUssb0JBQUwsQ0FBMEIsSUFBMUIsQ0FBK0IsSUFBSSxPQUFPLElBQVAsQ0FBWSxNQUFoQixDQUF1QixHQUF2QixFQUE0QixHQUE1QixDQUEvQjtBQUNBLFNBQUssZUFBTCxHQUF1QixJQUFJLE9BQU8sSUFBUCxDQUFZLE1BQWhCLENBQXVCLEVBQUMsVUFBVSxFQUFDLEtBQUssR0FBTixFQUFXLEtBQUssR0FBaEIs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SUFBUixDQUFhLEtBQWIsQ0FBaEM7QUFDRixNQUFFLGNBQUYsRUFBa0IsSUFBbEIsQ0FBdUIsYUFBWSxnQkFBbkM7QUFDQSxRQUFJLFVBQVUsS0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixTQUFPLFlBQXpCLENBQWQ7QUFDQSxtQkFBSyxlQUFMLENBQXFCLFlBQXJCO0FBQ0E7QUFDRCxHQWxEWTtBQW1EYixvQkFuRGEsZ0NBbURPO0FBQ2xCLE1BQUUsZUFBRixFQUFtQixXQUFuQixDQUErQixNQUEvQjtBQUNELEdBckRZO0FBc0RiLFdBdERhLHVCQXNERjtBQUNULE1BQUUsSUFBRixDQUFPO0FBQ0wsY0FBUSxNQURIO0FBRUwsZ0JBQVMsTUFGSjtBQUdMLG1CQUFhLGlDQUhSO0FBSUwsV0FBSztBQUpBLEtBQVAsRUFNQyxJQU5ELENBTU0sVUFBVSxNQUFWLEVBQW1CO0FBQ3ZCLGFBQU8sUUFBUCxHQUFrQixRQUFsQjtBQUNELEtBUkQ7QUFTRDtBQWhFWSxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IEFibHkgZnJvbSAnLi9yZWFsdGltZXNvY2tldC9hYmx5JztcbmltcG9ydCBVc2VyIGZyb20gJy4vdXNlcic7XG5pbXBvcnQgR2VvSGVscGVyIGZyb20gJy4vaGVscGVycy9nZW9IZWxwZXInXG5leHBvcnQgZGVmYXVsdCB7XG4gIGxpbmVDb29yZGluYXRlc0FycmF5OiBbXSxcbiAgaW5pdCgpe1xuICAgIEFibHkuaW5pdCgpO1xuICAgIFVzZXIuaW5pdCgpO1xuICAgIEdlb0hlbHBlci5jdXJyZW50TG9jYXRpb24oKGdlb0luZm8pID0+IHtcbiAgICAgIGlmKGdlb0luZm8pe1xuICAgICAgICB0aGlzLmluaXRNYXAoZ2VvSW5mbyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5hZGRXYXRjaFRvUG9zaXRpb24oKTtcbiAgfSxcbiAgaW5pdE1hcChnZW9JbmZvKXtcbiAgICBsZXQgbGF0ID0gZ2VvSW5mby5sYXQ7XG4gICAgbGV0IGxuZyA9IGdlb0luZm8ubG5nO1xuICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNhbnZhcycpLCB7XG4gICAgICB6b29tOiAxNSxcbiAgICAgIGNlbnRlcjoge2xhdDogbGF0LCBsbmcgOiBsbmcsIGFsdDogMH1cbiAgICB9KTtcbiAgICB0aGlzLmxpbmVDb29yZGluYXRlc0FycmF5LnB1c2gobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXQsIGxuZykpO1xuICAgIHRoaXMubWFwX21hcmtlcl9mcm9tID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7cG9zaXRpb246IHtsYXQ6IGxhdCwgbG5nOiBsbmd9LCBtYXA6IHRoaXMubWFwfSk7XG4gICAgdGhpcy5tYXBfbWFya2VyX3RvID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7cG9zaXRpb246IHtsYXQ6IGxhdCwgbG5nOiBsbmd9LCBtYXA6IHRoaXMubWFwfSk7XG4gICAgdGhpcy5tYXBfbWFya2VyX2Zyb20uc2V0TWFwKHRoaXMubWFwKTtcbiAgICB0aGlzLm1hcF9tYXJrZXJfdG8uc2V0TWFwKHRoaXMubWFwKTtcblxuXG5cbiAgICAvLyBKdXN0IGFkZGVkIGhlcmUgZm9yIHRlc3RpbmcgcHVycG9zZVxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMubWFwLCAnY2xpY2snLCAoZXZlbnQpPT4ge1xuICAgICAgbGV0IGxhdCA9ICBldmVudC5sYXRMbmcubGF0KCk7XG4gICAgICBsZXQgbG5nID0gIGV2ZW50LmxhdExuZy5sbmcoKTtcbiAgICAgIGxldCBtb3ZlRGF0YSA9IHsgXG4gICAgICAgIGxhdExuZyA6IHtcbiAgICAgICAgICBsYXQgOiBsYXQsXG4gICAgICAgICAgbG5nIDogbG5nXG4gICAgICAgIH0sXG4gICAgICAgIHJvb20gOiB3aW5kb3cuYXQuY3VycmVudFJvb21cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKHdpbmRvdy5hdC5jdXJyZW50Um9vbSlcbiAgICAgIHRoaXMubWFwLnNldENlbnRlcih7bGF0OiBsYXQsIGxuZyA6IGxuZywgYWx0OiAwfSk7XG4gICAgICB0aGlzLm1hcF9tYXJrZXJfdG8uc2V0UG9zaXRpb24oe2xhdDogbGF0LCBsbmcgOiBsbmcsIGFsdDogMH0pO1xuICAgICAgQWJseS5wdWJsaXNoVG9Nb3ZlKHdpbmRvdy5hdC5jdXJyZW50Um9vbSwgbW92ZURhdGEpXG4gICAgfSk7XG4gIH0sXG4gIGFkZFdhdGNoVG9Qb3NpdGlvbigpe1xuICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi53YXRjaFBvc2l0aW9uKGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgbGV0IGxhdCA9ICBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUgO1xuICAgICAgbGV0IGxuZyA9ICBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlO1xuICAgICAgdmFyIG1vdmVEYXRhID0ge1xuICAgICAgICBsYXRMbmcgOiB7XG4gICAgICAgICAgbGF0IDogbGF0LFxuICAgICAgICAgIGxuZyA6IGxuZ1xuICAgICAgICB9LFxuICAgICAgICByb29tIDogd2luZG93LmF0LmN1cnJlbnRSb29tXG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyh3aW5kb3cuYXQuY3VycmVudFJvb20pXG4gICAgICBBYmx5LnB1Ymxpc2hUb01vdmUod2luZG93LmF0LmN1cnJlbnRSb29tLCBtb3ZlRGF0YSlcbiAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjb2RlOiAnICAgICsgZXJyb3IuY29kZSAgICArICdcXG4nICtcbiAgICAgICAgICdtZXNzYWdlOiAnICsgZXJyb3IubWVzc2FnZSArICdcXG4nKTtcbiAgICB9LCB7IHRpbWVvdXQ6IDMwMDAwIH0pO1xuICB9LFxuICByZWRyYXcobGF0TG5nKXtcbiAgICBsZXQgbGF0ID0gbGF0TG5nLmxhdDtcbiAgICBsZXQgbG5nID0gbGF0TG5nLmxuZztcbiAgICB0aGlzLm1hcC5zZXRDZW50ZXIoe2xhdDogbGF0LCBsbmcgOiBsbmcsIGFsdDogMH0pXG4gICAgdGhpcy5tYXBfbWFya2VyX3RvLnNldFBvc2l0aW9uKHtsYXQ6IGxhdCwgbG5nIDogbG5nLCBhbHQ6IDB9KTtcbiAgICB0aGlzLnB1c2hDb29yZFRvQXJyYXkobGF0LCBsbmcpO1xuXG4gICAgdmFyIGxpbmVDb29yZGluYXRlc1BhdGggPSBuZXcgZ29vZ2xlLm1hcHMuUG9seWxpbmUoe1xuICAgICAgcGF0aDogdGhpcy5saW5lQ29vcmRpbmF0ZXNBcnJheSxcbiAgICAgIGdlb2Rlc2ljOiB0cnVlLFxuICAgICAgc3Ryb2tlQ29sb3I6ICcjMkUxMEZGJyxcbiAgICAgIHN0cm9rZU9wYWNpdHk6IDEuMCxcbiAgICAgIHN0cm9rZVdlaWdodDogMlxuICAgIH0pO1xuICAgIFxuICAgIGxpbmVDb29yZGluYXRlc1BhdGguc2V0TWFwKHRoaXMubWFwKTtcbiAgfSxcbiAgcHVzaENvb3JkVG9BcnJheShsYXRJbiwgbG5nSW4pIHtcbiAgICB0aGlzLmxpbmVDb29yZGluYXRlc0FycmF5LnB1c2gobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsYXRJbiwgbG5nSW4pKTtcbiAgfVxufTtcblxuXG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGN1cnJlbnRMb2NhdGlvbihjYil7XG4gICAgaWYgKG5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcbiAgICAgICAgKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgY2Ioe2xhdDogcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlICxsbmc6IHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgc3dpdGNoIChlcnJvci5jb2RlKSB7XG4gICAgICAgICAgICBjYXNlIGVycm9yLlRJTUVPVVQ6XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQnJvd3NlciBnZW9sb2NhdGlvbiBlcnJvciAhXFxuXFxuVGltZW91dC5cIik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBlcnJvci5QRVJNSVNTSU9OX0RFTklFRDpcbiAgICAgICAgICAgICAgaWYoZXJyb3IubWVzc2FnZS5pbmRleE9mKFwiT25seSBzZWN1cmUgb3JpZ2lucyBhcmUgYWxsb3dlZFwiKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5LnBvc3QoIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZ2VvbG9jYXRpb24vdjEvZ2VvbG9jYXRlP2tleT1BSXphU3lEQ2ExTFVlMXZPY3pYMWhPX2lHWWd5bzhwX2pZdUdPUFVcIiwgZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgY2Ioe2xhdDogc3VjY2Vzcy5sb2NhdGlvbi5sYXQsIGxuZzogc3VjY2Vzcy5sb2NhdGlvbi5sbmd9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBUEkgR2VvbG9jYXRpb24gZXJyb3IhIFxcblxcblwiK2Vycik7XG4gICAgICAgICAgICAgICAgICBjYihudWxsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZXJyb3IuUE9TSVRJT05fVU5BVkFJTEFCTEU6XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQnJvd3NlciBnZW9sb2NhdGlvbiBlcnJvciAhXFxuXFxuUG9zaXRpb24gdW5hdmFpbGFibGUuXCIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHttYXhpbXVtQWdlOiA1MDAwMCwgdGltZW91dDogMjAwMDAsIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZX0pO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5sb2coXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBHRU8gTE9DQVRJT05cIik7XG4gICAgfVxuICB9XG59OyIsImltcG9ydCBHZW8gZnJvbSBcIi4vZ2VvXCI7XG53aW5kb3cuYXQ9e307XG5HZW8uaW5pdCgpO1xuIiwiaW1wb3J0IEdlbyBmcm9tIFwiLi4vZ2VvXCI7XG5pbXBvcnQgVXNlciBmcm9tIFwiLi4vdXNlclwiO1xuZXhwb3J0IGRlZmF1bHQge1xuICBpbml0KCl7XG4gICAgd2luZG93LmF0LmFibHkgPSBuZXcgQWJseS5SZWFsdGltZSgnRDktSGJ3LkFIQ2ZtUTpaNFFHdlVhZHBQdWVLWWhQJyk7XG4gICAgd2luZG93LmF0LmFibHkuY29ubmVjdGlvbi5vbignY29ubmVjdGVkJywgdGhpcy5jb25uZWN0aW9uQ2FsbGJhY2suYmluZCh0aGlzKSk7IFxuICB9LFxuICBjb25uZWN0aW9uQ2FsbGJhY2soKXtcbiAgICBjb25zb2xlLmxvZyhcIlRoYXQgd2FzIHNpbXBsZSwgeW91J3JlIG5vdyBjb25uZWN0ZWQgdG8gQWJseSBpbiByZWFsdGltZVwiKTtcbiAgICB0aGlzLnN1YlRvVXNlcigpO1xuICAgIFVzZXIuZ2V0VXNlcnMoKHVzZXJzKSA9PiB7XG4gICAgICB0aGlzLnB1c1RvVVNlcih1c2Vycyk7XG4gICAgfSlcbiAgfSxcbiAgc3ViVG9Vc2VyKCl7XG4gICAgdmFyIHVzZXJzQ2hhbm5lbCA9IHdpbmRvdy5hdC5hYmx5LmNoYW5uZWxzLmdldCh0aGlzLmdldFVzZXJDaGFubmVsKCkpO1xuICAgIHVzZXJzQ2hhbm5lbC5zdWJzY3JpYmUoJ3VwZGF0ZVVzZXInLCB0aGlzLnVwZGF0ZVVzZXIuYmluZCh0aGlzKSk7XG4gIH0sXG4gIHB1c1RvVVNlcih1c2Vycyl7XG4gICAgdmFyIHVzZXJDaGFubmVsID0gd2luZG93LmF0LmFibHkuY2hhbm5lbHMuZ2V0KHRoaXMuZ2V0VXNlckNoYW5uZWwoKSk7XG4gICAgdXNlckNoYW5uZWwucHVibGlzaCgndXBkYXRlVXNlcicsIHVzZXJzKTtcbiAgfSxcbiAgZ2V0VXNlckNoYW5uZWwoKXtcbiAgICByZXR1cm4gJ2dwczp1c2Vycyc7XG4gIH0sXG4gIGN1cnJlbnRVc2VyQ2hhbm5lbCh1c2VyKXtcbiAgICByZXR1cm4gJ2dwczonK3VzZXI7XG4gIH0sXG4gIG9uTW92ZShtZXNzYWdlKSB7XG4gICAgR2VvLnJlZHJhdyhtZXNzYWdlLmRhdGEubGF0TG5nKTtcbiAgfSxcbiAgcHVibGlzaFRvTW92ZShlbWFpbCwgcGF5bG9hZCl7XG4gICAgdmFyIGNoYW5uZWwgPSB3aW5kb3cuYXQuYWJseS5jaGFubmVscy5nZXQodGhpcy5jdXJyZW50VXNlckNoYW5uZWwoZW1haWwpKTtcbiAgICBjaGFubmVsLnB1Ymxpc2goJ21vdmUnLCBwYXlsb2FkKTtcbiAgfSxcbiAgc3Vic2NyaWJlVG9Nb3ZlKGVtYWlsKXtcbiAgICB2YXIgY2hhbm5lbCA9IHdpbmRvdy5hdC5hYmx5LmNoYW5uZWxzLmdldCh0aGlzLmN1cnJlbnRVc2VyQ2hhbm5lbChlbWFpbCkpO1xuICAgIGNoYW5uZWwuc3Vic2NyaWJlKCdtb3ZlJywgdGhpcy5vbk1vdmUpO1xuICB9LFxuICB1cGRhdGVVc2VyKHVzZXIpIHtcbiAgICBsZXQgX3NlbGYgPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwidXNlclwiLHVzZXIpXG4gICAgJChcIi51c2Vycy1jb250YWluZXIgdWxcIikuZW1wdHkoKTtcbiAgICAkLmVhY2godXNlci5kYXRhLGZ1bmN0aW9uKGluZGV4LHZhbCl7XG4gICAgICBjb25zb2xlLmxvZyhcInVzZXJcIix2YWwubmFtZSlcbiAgICAgICQoXCIudXNlcnMtY29udGFpbmVyIHVsXCIpLmFwcGVuZChcIjxsaSBlbWFpbD1cIit2YWwuZW1haWwrXCI+PGRpdiBjbGFzcz0ndXNlci1uYW1lJz48aW1nIGNsYXNzPSdwcm9maWxlIGltZy1yb3VuZGVkJyA+PGRpdj48aDU+XCIrdmFsLm5hbWUrXCI8L2g1PiA8c3Bhbj5cIit2YWwuZW1haWwrXCI8L3NwYW4+PC9kaXY+PC9kaXY+PC9saT5cIik7XG4gICAgICAkKCcudXNlcnMtY29udGFpbmVyIHVsIGxpOmxhc3QgaW1nJykuaW5pdGlhbCh7bmFtZTogdmFsLm5hbWUsIGhlaWdodDogNDAsIHdpZHRoOiA0MCwgY2hhckNvdW50OiAxLCBmb250U2l6ZTogMTgsIGZvbnRXZWlnaHQ6NDAwfSk7XG4gICAgfSlcbiAgICAkKFwiLnVzZXJzLWNvbnRhaW5lciB1bCBsaVwiKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgdmFyIGVtYWlsID0gJCh0aGlzKS5hdHRyKFwiZW1haWxcIik7XG4gICAgICAkKFwiLnVzZXJzLWNvbnRhaW5lciB1bCBsaVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICBfc2VsZi5zdWJzY3JpYmVUb01vdmUoZW1haWwpO1xuICAgICAgR2VvLmluaXQoKTtcbiAgICB9KVxuICB9XG59OyIsImltcG9ydCBBYmx5IGZyb20gJy4vcmVhbHRpbWVzb2NrZXQvYWJseSc7XG5leHBvcnQgZGVmYXVsdCB7XG4gIGluaXQoKXtcbiAgICB0aGlzLmdldEN1cnJlbnRVc2VyKCk7XG4gICAgdGhpcy5hZGRMaXN0ZW5lcnMoKTtcbiAgfSxcbiAgZ2V0VXNlcnMoY2Ipe1xuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICBkYXRhVHlwZTpcImpzb25cIixcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIixcbiAgICAgIHVybDogXCIvdXNlcnNcIlxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oIHVzZXJzICkge1xuICAgICAgY2IodXNlcnMpO1xuICAgIH0pO1xuICB9LFxuICBnZXRDdXJyZW50VXNlcigpe1xuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICBkYXRhVHlwZTpcImpzb25cIixcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIixcbiAgICAgIHVybDogXCIvY3VycmVudF91c2VyXCIsXG4gICAgfSlcbiAgICAuZG9uZShmdW5jdGlvbiggcmVzdWx0ICkge1xuICAgICAgdmFyIHJvb20gPSByZXN1bHQuZGF0YS5lbWFpbDtcbiAgICAgIHdpbmRvdy5hdC5jdXJyZW50Um9vbSA9IHJvb207XG4gICAgICB3aW5kb3cuYXQuY3VycmVudFVzZXIgPSByZXN1bHQuZGF0YTtcbiAgICAgICQoJy51c2VyLW5hbWUgaW1nJykuaW5pdGlhbCh7bmFtZTogd2luZG93LmF0LmN1cnJlbnRVc2VyLm5hbWUsIGhlaWdodDogNDAsIHdpZHRoOiA0MCwgY2hhckNvdW50OiAxLCBmb250U2l6ZTogMTgsIGZvbnRXZWlnaHQ6NDAwfSk7XG4gICAgICAkKFwiLnVzZXItbmFtZSBoNFwiKS5odG1sKHdpbmRvdy5hdC5jdXJyZW50VXNlci5uYW1lKTtcbiAgICAgICQoXCIudXNlci1uYW1lIHNwYW5cIikuaHRtbCh3aW5kb3cuYXQuY3VycmVudFVzZXIuZW1haWwpO1xuICAgIH0pXG4gICAgLmZhaWwoZnVuY3Rpb24oZXJyKXtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IFwiL2xvZ2luXCJcbiAgICB9KTtcbiAgfSxcbiAgYWRkTGlzdGVuZXJzKCl7XG4gICAgJChcIiN1c2VybmFtZVwiKS5jaGFuZ2UodGhpcy5vblVzZXJTZWxlY3QpO1xuICAgICQoXCIudXNlci1wcm9maWxlXCIpLmNsaWNrKHRoaXMuc2hvd1Byb2ZpbGVPcHRpb25zKTtcbiAgICAkKFwiLnVzZXItc2lnbm91dFwiKS5jbGljayh0aGlzLm9uU2lnbk91dCk7XG4gIH0sXG4gIG9uVXNlclNlbGVjdChldmVudCl7XG4gICAgdmFyIHNlbGVjdGVkVXNlciA9ICQoXCIjdXNlcm5hbWUgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpO1xuICAgIHZhciBzZWxlY3RlZFVzZXJOYW1lID0gJChcIiN1c2VybmFtZSBvcHRpb246c2VsZWN0ZWRcIikudGV4dCgpO1xuICAgICAgJCh0aGlzKS5kYXRhKFwib2xkXCIsICQodGhpcykuZGF0YShcIm5ld1wiKSB8fCBcIlwiKTtcbiAgICAgICQodGhpcykuZGF0YShcIm5ld1wiLCAkKHRoaXMpLnZhbCgpKTtcbiAgICAgIGNvbnNvbGUubG9nKCQodGhpcykuZGF0YShcIm9sZFwiKSwkKHRoaXMpLmRhdGEoXCJuZXdcIikpXG4gICAgJChcIi50cmFja3NfbmFtZVwiKS5odG1sKFwiIHRyYWNrcyBcIisgc2VsZWN0ZWRVc2VyTmFtZSk7XG4gICAgdmFyIGNoYW5uZWwgPSBhYmx5LmNoYW5uZWxzLmdldCgnZ3BzOicrc2VsZWN0ZWRVc2VyKTtcbiAgICBBYmx5LnN1YnNjcmliZVRvTW92ZShzZWxlY3RlZFVzZXIpO1xuICAgIC8vIGluaXRpYWxpemUoKTtcbiAgfSxcbiAgc2hvd1Byb2ZpbGVPcHRpb25zKCl7XG4gICAgJChcIi51c2VyLXNpZ25vdXRcIikudG9nZ2xlQ2xhc3MoXCJoaWRlXCIpO1xuICB9LFxuICBvblNpZ25PdXQoKXtcbiAgICAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGRhdGFUeXBlOlwianNvblwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgdXJsOiBcIi9zaWduX291dFwiLFxuICAgIH0pXG4gICAgLmRvbmUoZnVuY3Rpb24oIHJlc3VsdCApIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IFwiL2xvZ2luXCJcbiAgICB9KTtcbiAgfVxufSJdfQ==
