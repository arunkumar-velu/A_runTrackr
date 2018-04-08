import Ably from './realtimesocket/ably';
import User from './user';
import GeoHelper from './helpers/geoHelper'
export default {
  lineCoordinatesArray: [],
  init(){
    Ably.init();
    User.init();
    GeoHelper.currentLocation((geoInfo) => {
      if(geoInfo){
        this.initMap(geoInfo);
      }
    });
    this.addWatchToPosition();
  },
  initMap(geoInfo){
    let lat = geoInfo.lat;
    let lng = geoInfo.lng;
    this.map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 15,
      center: {lat: lat, lng : lng, alt: 0}
    });
    this.lineCoordinatesArray.push(new google.maps.LatLng(lat, lng));
    this.map_marker_from = new google.maps.Marker({position: {lat: lat, lng: lng}, map: this.map});
    this.map_marker_to = new google.maps.Marker({position: {lat: lat, lng: lng}, map: this.map});
    this.map_marker_from.setMap(this.map);
    this.map_marker_to.setMap(this.map);



    // Just added here for testing purpose
    google.maps.event.addListener(this.map, 'click', (event)=> {
      let lat =  event.latLng.lat();
      let lng =  event.latLng.lng();
      let moveData = { 
        latLng : {
          lat : lat,
          lng : lng
        },
        room : window.at.currentRoom
      }
      console.log(window.at.currentRoom)
      this.map.setCenter({lat: lat, lng : lng, alt: 0});
      this.map_marker_to.setPosition({lat: lat, lng : lng, alt: 0});
      Ably.publishToMove(window.at.currentRoom, moveData)
    });
  },
  addWatchToPosition(){
    navigator.geolocation.watchPosition(function (position) {
      let lat =  position.coords.latitude ;
      let lng =  position.coords.longitude;
      var moveData = {
        latLng : {
          lat : lat,
          lng : lng
        },
        room : window.at.currentRoom
      }
      console.log(window.at.currentRoom)
      Ably.publishToMove(window.at.currentRoom, moveData)
    }, function (error) {
      console.log('code: '    + error.code    + '\n' +
         'message: ' + error.message + '\n');
    }, { timeout: 30000 });
  },
  redraw(latLng){
    let lat = latLng.lat;
    let lng = latLng.lng;
    this.map.setCenter({lat: lat, lng : lng, alt: 0})
    this.map_marker_to.setPosition({lat: lat, lng : lng, alt: 0});
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
  pushCoordToArray(latIn, lngIn) {
    this.lineCoordinatesArray.push(new google.maps.LatLng(latIn, lngIn));
  }
};


