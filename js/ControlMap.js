/*jshint esversion: 6 */
/**
* These functions work on the Map setting specific icons and markers.
**/
class ControlMap{
  /*
     update function checks if there are filters
     should be placed in the Knockout part.
  */
  updateMap(map, airmeasurements){

      self = this;
      var markers = [];
      // see if there is a filter.
      var filter = self.getFilter();
      // need class airfilter for this
      var airfilter = new Airfilter();
      // remove all markers first.
      map.removeAllMarkers();
      // create new markers according to airmeasurements.
      airmeasurements.forEach(function(measurement){
         var position = measurement.getLatLng(); // get the position
         var title = "Station: " + measurement.getName().split(".")[0]; // title
         var marker = map.createMarker(position, title);
         // create the infoWindow for the marker.
         self.setInfoWindow(map, measurement, marker);
         // add marker to map.
         map.putMarkerOnMap(marker);

         if(filter !== ""){
           var level  = airfilter.getLevel(measurement, filter);
           self.setMarkerIcon(marker, level);
         }
      });
  }

/* calls airfilter to only display a certain substance */
setFilter(filter){
  this.filter = filter;
}

getFilter(){
  return this.filter;
}

setMarkerIcon(marker, level){

    var iconLow = "resources/green_MarkerA.png"; // green is low level
    var iconMedium = "resources/yellow_MarkerA.png"; // yellow is medium
    var iconHigh = "resources/red_MarkerA.png"; // red is high

    if (level === "low") {
      marker.setIcon(iconLow);
    }
    else if (level === "medium"){
      marker.setIcon(iconMedium);
    }
    else if (level === "high") {
      marker.setIcon(iconHigh);
    }
  }

setInfoWindow(map, airmeasurement, marker){

      var time = airmeasurement.getUtcTimestamp();
      var temp = airmeasurement.getAmbTemp();
      var humidity = airmeasurement.getAmbHum();
      var ozon = airmeasurement.getOzon();
      var no2 = airmeasurement.getNo2();
      var pm1 = airmeasurement.getPm1();
      var pm10 = airmeasurement.getPm10();
      var ufp = airmeasurement.getUfp();
      var station = airmeasurement.getName().split(".")[0];

var content =       "<div id='infowindow'>" +
                    "<h5>Measurements Eindhoven at time: " +
                    time.split(" ")[1] + "</h5>" +
                    "<h6>Date: " + time.split(" ")[0] + "</h6>" +
                    "<h6>Station: " + station + "</h6>" +
                    "<ul>" +
                    "<li>Temperature: " + temp + "</li>" +
                    "<li>Relative Humidity: " + humidity + "%</li>" +
                    "<li>Ozon: " + ozon + "</li>" +
                    "<li>NO2: " + no2 + "</li>" +
                    "<li>PM1: " + pm1 + "</li>" +
                    "<li>PM10: " + pm10 + "</li>" +
                    "<li>UFP: " + ufp + "</li>" +
                    "</li></ul></div>";
      map.createMarkerInfoWindow(marker, content);
}
 }
