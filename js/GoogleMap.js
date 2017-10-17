/*jshint esversion: 6 */
/* class Map to hold all google map items functions and encapsulate it
  from the "evil world"  */
  class GoogleMap {

    // the list that holds marker items that are on the map the
    // key is location so marker can be easily found.

    constructor() {
      this.markers = new Map();
      this.infowindows = [];
      this.map = null;
      this.centrum = {lat: 51.441642, lng: 5.4697225};
    }

    // initiate map with default center.
    initMap(title, icon) {

           this.map = new google.maps.Map(document.getElementById('map'),
                 { zoom: 11,
                   center: this.centrum
                 });

           var centrum_marker = new google.maps.Marker({
             position: this.centrum,
             map: this.map,
             title: title,
             icon: icon
           });
         }

    // update the map. not sure if this function is needed.
    updateMap(markers){

         for(var i=0; i<markers.length;i++){
           this.putMarkerOnMap(markers[i]);
         }

      }

    // returns all the markers situated on the map.
    getMarkers(){
      var markers = [];
      for(var value of this.markers.entries()){
        markers.push(value[1]);
      }
      return markers;
    }

    /** Put marker on the map and in the collection markers */
    putMarkerOnMap(marker){
      // put marker on the map.
      marker.setMap(this.map);
      //at same time store marker in currentMarkers.
      var key = marker.getPosition();
      // add to markers
      this.markers.set(key, marker);
    }

/* removes all markers currently on the map */
    removeAllMarkers(){

     for(var value of this.markers.entries()){
       this.removeMarkerFromMap(value[1]);
     }
      this.markers.clear();
  }

/* removes a specific marker from the map */
    removeMarkerFromMap(marker){
      // remove from map
      marker.setMap(null);
      // remove from marker array.
      var key = marker.getPosition();
      // delete from markers
      this.markers.delete(key);
    }

    // stops animation on all markers.
    quitAnimation(){

      for(var value of this.markers.entries()){
        value[1].setAnimation(null);
      }
    }

    // create marker with position and a title, and returns this marker.
    createMarker(position, title){

      var marker = new google.maps.Marker({
                                       position: position,
                                       map: this.map,
                                       title: title,
                                       icon: 'resources/brown_MarkerA.png',
                                       animation: google.maps.Animation.DROP});
      return marker;
    }

    /* function to create a marker with infowindow */
    createMarkerInfoWindow(marker, contentStr){
          var self = this;
          var infowindow = new google.maps.InfoWindow({content: contentStr});
          google.maps.event.addListener(marker, 'click', function() {
            self.markerListener(marker, infowindow);
      }, false);
    }

    /* set up a listener to listen for events on this marker
       in this case for opening an infowindow */
     markerListener(marker, infowindow){

        var markerAnimated = false;
        this.closeAllInfowindows();
        if(marker.getAnimation() !== null){
          markerAnimated = true;
        }
        this.quitAnimation(); // stop all markers animation.
        if(!markerAnimated){
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
                   marker.setAnimation(null);
                 }, 1400); // equal to two bounces
      }
        this.centerMapOn(marker.getPosition());
        infowindow.open(this.map, marker);
        this.infowindows.push(infowindow);
    }

    // set icon of a marker.
    setMarkerIcon(marker, icon){
     marker.setIcon(icon);
    }

  // is there a marker with this position in the collection of markers?
  // the key of the map with markers is its position.
  hasMarker(position){
    return this.markers.has(position);
  }

  closeAllInfowindows(){

    for (var i=0;i<this.infowindows.length;i++) {
     this.infowindows[i].close();
  }
    this.infowindows = [];
  }

  centerMap(){
     this.map.panTo(this.centrum);
  }

  centerMapOn(position){
    this.map.panTo(position);
  }

  activateMarker(marker){
    google.maps.event.trigger(marker, 'click');
  }

  getMarkerByTitle(title){

    var marker;
    for(var value of this.markers.entries()){
      if(value[1].getTitle() === title){
        marker = value[1];
      }
    }
    return marker;
   }

   resetZoom(){
     this.map.setZoom(11);
   }

  } // end class Map
