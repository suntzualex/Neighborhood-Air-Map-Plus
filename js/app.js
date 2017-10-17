// the knockout.js code for the neighborhood map project.
var appViewModel = new AppViewModel(); // this app
var googleMap = new GoogleMap(); // the map..
var controlMap = new ControlMap(); // controller of map
var airFilter = new Airfilter();
var airmeasurementsMaster = [];
// airemeasurementsMaster filled via API call only renew on update or reset.

function AppViewModel() {

  var self = this;
  // keep track of the airmeasurements
  self.noStations = ko.observable(false);
  self.airmeasurements = ko.observableArray();
  self.airmeasurements.subscribe(function(){
     if(self.airmeasurements().length === 0){
     self.noStations(true);
   } else {
     self.noStations(false);
   }
  });
  self.levelMessage = ko.observable("No Filter Set");
  self.levelMessage.subscribe(function(){
     // done with jquery is it possible doing this with KO.js?
     $("#over-map").show().delay(2000).fadeOut('slow');
  });
  self.updates = ko.observable(false);
  self.updates.subscribe(function(){
    if(self.updates()){
       autoUpdates = setInterval(function () {
       collectAirData();
     }, 20000, true); // update every 20 seconds.
      } else {
     clearInterval(autoUpdates);
      }
  });
  // text to filter on a substance level coupled to the selected filter.
  self.substanceLevelFilter = ko.observable("");
  var counter = 0;
  self.changeSubstanceLevel = function(){
    var filter = self.substanceLevelFilter();
    var message = "";
    if(filter !== ""){
      message += "Showing Stations With ";
    }else{
      message += "No Filter Selected";
    }
    if(filter[1] === "L"){
      message += "Low Levels Of ";
    }
    if(filter[1] === "M"){
      message += "Medium Levels Of ";
    }
    if(filter[1] === "H"){
      message += "High Levels Of ";
    }
    if (filter[0] ===  'o'){
      controlMap.setFilter("ozone");
      message += "Ozone";
    }
    if (filter[0] === 'n'){
      controlMap.setFilter("no2");
      message += "NO2";
    }
    if (filter[0] === 'p'){
      controlMap.setFilter("pm10");
      message += "PM10";
    }
    self.levelMessage(message);
    self.updateFromMaster(airmeasurementsMaster);
    // self.singleUpdate();
  };
  /*
     function updates but does not call the API it uses the
     existing master array: airmeasurementsMaster.
  */
   self.updateFromMaster = function(){
      googleMap.centerMap();
      filterNodes(airmeasurementsMaster);
   };

   self.showStation = function(title){
     //var title = $(event.target).text();
     var marker = googleMap.getMarkerByTitle(title);
     self.closeControlPanel();
     self.levelMessage("");
     googleMap.activateMarker(marker);
   };

  // the update, really updates from API
  self.singleUpdate = function(){
    googleMap.centerMap();
    collectAirData();
  };

  /* Reset the map do an update with values from API */
  self.reset = function(){
    // clear filter.
    self.substanceLevelFilter("");
    self.levelMessage("No Filter Set");
    controlMap.setFilter("");
    googleMap.resetZoom();
    googleMap.centerMap();
    collectAirData();
  };

  /* opening or closing the control panel */
  self.controlOpen = ko.observable(false);
  self.openControlPanel = function(){
    self.controlOpen(true);
  };
  self.closeControlPanel = function(){
    self.controlOpen(false);
  };
  /* closing and opening of the help menu */
  self.helpActive = ko.observable(false);
  self.toggleHelp = function(){
    if (self.helpActive() === true){
      self.helpActive(false);
    } else {
      self.helpActive(true);
    }
  };

ko.bindingHandlers.openControls = {

  init: function(element, valueAccessor){
    var value = valueAccessor();
    $(element).toggle(ko.unwrap(value));
  },
  update: function(element, valueAccessor){
    var value = valueAccessor();
    if (ko.unwrap(value)){
      $(element).css("width", "250px");
      $(element).css("display","block");
    } else{
      $(element).css("width", "0px");
   }
  }
};

ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value));

    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        if (ko.unwrap(value)){
          $(element).slideDown();
        } else{
         $(element).slideUp();
       }
    }
};

 /* setting the filter via the buttons */
self.setFilter = function(value){
   // clear the other filters
   self.substanceLevelFilter("");
   // get the id of the element as name of the substance.
   var substance = value;
   // show levels of this substance.
   controlMap.setFilter(substance);
   // show the message
   message = "Showing All Stations " + substance +  " Levels";
   self.levelMessage(message);
   self.updateFromMaster(airmeasurementsMaster);
   // self.singleUpdate();
 };

 /* Determine filter level and adapt the collection accordingly
    Do this by setting a flag according to the filter.
 */
self.passFilter = function(measurement){

   var ozone = measurement.ozon;
   var no2 = measurement.no2;
   var pm10 = measurement.pm10;
   var filterLevel = self.substanceLevelFilter();

   switch(filterLevel){
     case "":
         return true;

     case "oLow":
       if(airFilter.getOzoneLevel(ozone) === "low"){
           return true;
         }
       else
         return false;
     break;

     case "oMed":
       if(airFilter.getOzoneLevel(ozone) === "medium")
           return true;
       else
       return false;
       break;

     case "oHigh":
       if(airFilter.getOzoneLevel(ozone) === "high")
           return true;
       else
         return false;
       break;

     case "nLow":
       if(airFilter.getNo2Level(no2) === "low")
          return true;
       else
          return false;
       break;

     case "nMed":
       if(airFilter.getNo2Level(no2) === "medium")
           return true;
       else
         return false;
           break;

     case "nHigh":
       if(airFilter.getNo2Level(no2) === "high")
           return true;
       else
         return false;
           break;

     case "pLow":
       if(airFilter.getPm10Level(pm10) === "low")
           return true;
       else
         return false;
       break;

     case "pMed":
       if(airFilter.getPm10Level(pm10) === "medium")
           return true;
       else
         return false;
       break;

     case "pHigh":
       if(airFilter.getPm10Level(pm10) === "high")
           return true;
       else
         return false;
   }
 };
    } // end of viewmodel

/*
   Filtering an existing array: airmeasurementsMaster
   and putting that into the observable array airmeasurements.
*/
function filterNodes(airmeasurementsMaster){

  appViewModel.airmeasurements([]);
  airmeasurementsMaster.forEach(function(airmeasurement){
  if(appViewModel.passFilter(airmeasurement)){
      appViewModel.airmeasurements.push(airmeasurement);
   }
 });
   // sort the objects by title.
   appViewModel.airmeasurements.sort(function(a, b) {
   var tA = parseInt(a.title.split(":")[1]);
   var tB = parseInt(b.title.split(":")[1]);
   return (tA < tB) ? - 1 : (tA > tB) ? 1 : 0;
   });

  controlMap.updateMap(googleMap, appViewModel.airmeasurements());
}
/*
  Important function for data collection via an external API.
  this is the core of the application.
*/
function collectAirData(){
  // do the data collection with or without filter.
  // make sure the master array is empty.
  airmeasurementsMaster = [];


  $.getJSON("http://data.aireas.com/api/v1/?airboxid=*")
    .done(function(data) {

      data.forEach(function(key) {
          var airObject = key;
          /* reading variables from the json */
          var ambHum = airObject.AMBHUM;
          var ambTemp = airObject.AMBTEMP;
          var no2 = airObject.NO2;
          var ozon = airObject.OZON;
          var pm1 = airObject.PM1;
          var pm10 = airObject.PM10;
          var pm25 = airObject.PM25;
          var relHum = airObject.RELHUM;
          var temp = airObject.TEMP;
          var ufp = airObject.UFP;
          var gps = airObject.gps;
          var name = airObject.name;
          var title = "Station: " + name.split(".")[0];
          var utctimestamp = airObject.utctimestamp;

   var airmeasurement = new Airmeasurement(ambHum, ambTemp, no2,
                                           ozon, pm1, pm10, pm25,
                                           relHum, temp, ufp,
                                           gps, name, utctimestamp, title);
    // add measurements to master array.
    airmeasurementsMaster.push(airmeasurement);
    });
    // display measurements through filter
    filterNodes(airmeasurementsMaster);
})
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    $("#error").append("Airmeasurement Data Could Not Be Loaded.");
    console.log( "Request Failed: " + err );
 });
}

/**
  google maps error handler
*/
function googleMapError(){

   $("error").innerHTML = "<h1>Google maps could not be loaded</h1>";

}

/**
   initialize the map with center Eindhoven and
   the blue marker in the center.
**/
function initMap(){
  googleMap.initMap('Centrum Eindhoven', 'resources/blue_MarkerC.png');
}

ko.applyBindings(appViewModel);    // Activates knockout.js
collectAirData();
