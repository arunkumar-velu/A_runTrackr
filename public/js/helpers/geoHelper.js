export default {
  currentLocation(cb){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          cb({lat: position.coords.latitude ,lng: position.coords.longitude});
        },
        (error) => {
          switch (error.code) {
            case error.TIMEOUT:
              console.log("Browser geolocation error !\n\nTimeout.");
              break;
            case error.PERMISSION_DENIED:
              if(error.message.indexOf("Only secure origins are allowed") == 0) {
                jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCrg5FODahC0GtfKavkdkpKS8pLR3I8yog", function(success) {
                  cb({lat: success.location.lat, lng: success.location.lng});
                })
                .fail(function(err) {
                  console.log("API Geolocation error! \n\n"+err);
                  cb(null);
                });
              }
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("Browser geolocation error !\n\nPosition unavailable.");
              break;
          }
        },
        {maximumAge: 50000, timeout: 20000, enableHighAccuracy: true});
    }else{
      console.log("Browser doesn't support GEO LOCATION");
    }
  }
};