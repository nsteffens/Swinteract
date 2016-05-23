'use strict'

// Leaflet init
$(document).ready(function() {


  var mymap = L.map('map').setView([51.95, 7.55], 12);

  L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
  }).addTo(mymap);

  // disable mouse scrollWheelZoom on map
  mymap.scrollWheelZoom.disable();



  $.getJSON( 'track.json', function( data ) {
    console.log(data);
    mymap.setView([data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]]);
    $(data.features).each(function(i, e) {
      var marker = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]]).addTo(mymap);
    });
  });

});
