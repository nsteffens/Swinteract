/*

	Custom Javascript file for swinteract.

*/

'use strict'

var swipeSpeed = 50;
var verticalSwipeSpeed = 10;
var updateInterval = 5000; // in milliseconds

var receivedTracks;
var selectedCarData;

var CO2Chartdata;
var CO2Chart;
var CO2statistics;
google.charts.load('current', {
    packages: ['corechart', 'line']
});
google.charts.setOnLoadCallback(drawCurveTypes);

var mymap;
var polyline;
var cursor = L.icon({
    iconUrl: 'img/cursor.png',
    iconSize: [35, 35], // size of the icon
    iconAnchor: [17, 17], // point of the icon which will correspond to marker's location

});
var cursorMarker;

var averageSpeed;
var averageSpeedArr = [];
var averageCO2;
var averageCO2Arr = [];
var averageCons;
var averageConsArr = [];

var slideFinished = true; // We need to monitor if the swipe animation has ended so we can start a new swipe
var locking_swipe = false;


$.getJSON("https://envirocar.org/api/stable/statistics/CO2", function(statistics) {

    CO2statistics = statistics;

})


$(document).ready(function() {
    console.log('Loading fullpage.js ...')

    $('#fullpage').fullpage({
        // 		anchors: ['firstPage', 'secondPage', '3rdPage'],		// Can be used to rewrite the URL
        sectionsColor: ['#3c3c3c', '#DE564B', '#EAE1C0'],
        slidesNavigation: true,
        afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) { // Callback function to let the next swipe through
            slideFinished = true;
        }
    });












    mymap = L.map('map').setView([51.95, 7.55], 13);

    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
    }).addTo(mymap);

    // disable mouse scrollWheelZoom on map
    mymap.scrollWheelZoom.disable();

    // Add the event listener which gets triggered when using the trackpad


    $('body')[0].addEventListener('mousewheel', function(event) {
        // We don't want to scroll below zero or above the width and height
        var maxX = this.scrollWidth - this.offsetWidth;
        var maxY = this.scrollHeight - this.offsetHeight;

        // If this event looks like it will scroll beyond the bounds of the element, prevent it and set the scroll to the boundary manually
        if (this.scrollLeft + event.deltaX < 0 ||
            this.scrollLeft + event.deltaX > maxX ||
            this.scrollTop + event.deltaY < 0 ||
            this.scrollTop + event.deltaY > maxY) {

            event.preventDefault();

            // Manually set the scroll to the boundary
            this.scrollLeft = Math.max(0, Math.min(maxX, this.scrollLeft + event.deltaX));
            this.scrollTop = Math.max(0, Math.min(maxY, this.scrollTop + event.deltaY));
        }

		// Wenn Swipe nach unten registriert wird -> 2sec Zeit Geste zu finishen
		// --> Funktion schreiben, die wartet und auf Scroll nach rechts wartet
		// In der Zeit Seitenwechsel sperren!

		if(locking_swipe = true){
			
			LockingListener(event)
		}

		if(slideFinished == true && event.deltaY < -verticalSwipeSpeed){
			
			locking_swipe = true;
			slideFinished = false;	
						
			setTimeout(function(){
				console.log('times over')
				slideFinished = true;
				locking_swipe = false;
			}, 2000)
			
		}

		
        // Integrate sliding and stuff here so we won't be bugged by back&forward gestures

        //SWIPE RIGHT
        if (slideFinished == true && event.deltaX > swipeSpeed) {
            slideFinished = false; // We will set it back to true when the afterSlideLoad callback is fired
            $.fn.fullpage.moveSlideRight();
        }

        //SWIPE LEFT
        if (slideFinished == true && event.deltaX < -swipeSpeed) {
            slideFinished = false; // We will set it back to true when the afterSlideLoad callback is fired
            $.fn.fullpage.moveSlideLeft();
        }        
    }, false);


    getTracks(function(tracks) {
        // Choose a track by random --- CURRENTLY DISABLED!!!
        // We only get 100 tracks per API-call so we chose one of those..

        receivedTracks = tracks;

        var randomTrackIndex = Math.floor(Math.random() * 100);
        // 		Use this for activating randomly chosen track again. Read commit message for reason why it's disabled.
        // 		getCarData(tracks[randomTrackIndex].id, function(carData){
        getCarData(tracks[randomTrackIndex].id, function(carData) {

            //console.log(carData);

            // 			selectedCarData = carData;

            $.getJSON("js/track.json", function(data) {

                selectedCarData = data;
                simulateDriving();
                $('#statustext').html('Dashboard');

                console.log(data);

            });


        })


    });

});


function LockingListener(givenEvent){
			
		
		if (locking_swipe == true && givenEvent.deltaX < -swipeSpeed) {
			console.log('yes!')
        }
		
			
			
}



function getTracks(done) {

    var tracks;

    jQuery.ajax({
            url: "https://envirocar.org/api/stable/tracks/",
            type: "GET",
        })
        .done(function(trackData, textStatus, jqXHR) {
            tracks = trackData.tracks;
            done(tracks);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed with status: " + textStatus);
        })
}

function getCarData(track_id, done) {

    jQuery.ajax({
            url: "https://envirocar.org/api/stable/tracks/" + track_id + "/",
            type: "GET",
        })
        .done(function(carData, textStatus, jqXHR) {
            done(carData);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
        })

}

function simulateDriving() {

    // carData is recorded every 5 seconds (calculated by timestamp difference)

    var i = 0;
    var co2log_data = [];
    var co2log_label = [];


    var drivingLoop = setInterval(function() {
        i++;

        var speedValue = Math.floor(selectedCarData.features[i].properties.phenomenons.Speed.value);
        //     	var rpmValue 	= Math.floor(selectedCarData.features[i].properties.phenomenons.Rpm.value);
        var co2Value = selectedCarData.features[i].properties.phenomenons.CO2.value.toFixed(2);

        console.log(parseFloat(co2Value));

        // Update Speed
        $('#speed').html(speedValue);
        $('#map-dashboard-speed').html(speedValue + ' ' + selectedCarData.features[i].properties.phenomenons.Speed.unit);
        $('#map-dashboard-speed-average').html('Ø ' + Math.floor(calculateAverageSpeed(speedValue)) + ' ' + selectedCarData.features[i].properties.phenomenons.Speed.unit);
        updateSpeedDisplay(speedValue);

        // Update Co2
        $('#Co2_display').html(co2Value);
        $('#map-dashboard-co2').html(co2Value + ' ' + selectedCarData.features[i].properties.phenomenons.CO2.unit);
        $('#map-dashboard-co2-average').html('Ø ' + calculateAverageCO2(co2Value).toFixed(2) + ' ' + selectedCarData.features[i].properties.phenomenons.CO2.unit);

        updateCo2Display(parseFloat(co2Value));

        // Update CO2 Chart

        updateCO2Chart(selectedCarData.features[i].properties.phenomenons.CO2.value, i);

        // Update consumption
        $('#map-dashboard-consumption').html(selectedCarData.features[i].properties.phenomenons.Consumption.value.toFixed(2) + ' ' + selectedCarData.features[i].properties.phenomenons.Consumption.unit);
        $('#map-dashboard-consumption-average').html('Ø ' + calculateAverageConsumption(selectedCarData.features[i].properties.phenomenons.Consumption.value).toFixed(2) + ' ' + selectedCarData.features[i].properties.phenomenons.Consumption.unit);

        // Update Gaspedal
        // updateGasPedal(selectedCarData.features[i].properties.phenomenons["Throttle Position"].value);
        if (i == selectedCarData.features.length - 1) {
            // Simulation is finished
            $('#statustext').html('Simulation finished.');
            clearInterval(drivingLoop);

            // create statistics JSON
            var statistics = JSON.parse('{ ' +
              '"track_id": "' + selectedCarData.properties.id + '",' +
              '"start": "' + selectedCarData.features[0].properties.time + '",' +
              '"end": "' + selectedCarData.features[selectedCarData.features.length - 1].properties.time + '",' +
              //'"stock_features": "' + JSON.stringify(selectedCarData.features) + '",' +
              //'"stock_properties": "' + JSON.stringify(selectedCarData.properties) + '",' +
              '"statistics": {' +
                '"average_speed": "' + parseFloat(calculateAverageSpeed()) + '",' +
                '"average_CO2": "' + parseFloat(calculateAverageCO2()) + '",' +
                '"average_consumption": "' + parseFloat(calculateAverageConsumption()) + '"' +
              '}' +
            '}')

            // publish statistics
            var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(statistics));
            window.open(url, 'statistic');
        }

        // Update map
        var lat = selectedCarData.features[i].geometry.coordinates[1];
        var lon = selectedCarData.features[i].geometry.coordinates[0];

        var pos = L.latLng(lat, lon)

        if (polyline === undefined) {
            polyline = L.polyline(pos, {
              color: 'red'

            }).addTo(mymap)
            cursorMarker = L.marker([lat, lon], {
                icon: cursor,
                rotationAngle: selectedCarData.features[i].properties.phenomenons["GPS Bearing"].value
            }).addTo(mymap)
        } else {
            polyline.addLatLng(pos)
            cursorMarker.options.rotationAngle = selectedCarData.features[i].properties.phenomenons["GPS Bearing"].value
            cursorMarker.setLatLng(pos)
        }

        mymap.panTo(pos);

    }, updateInterval);

    // Use this to stop the loop:
    //clearInterval(drivingLoop);

}

function updateSpeedDisplay(value) {

    var speedCircle = $('#speed_circle');

    // Let 180 km / h be the max displayable speed --> Calculate Percentage of 180
    var setValue = value / 180;
    var oldValue = speedCircle.circleProgress('value');

    speedCircle.circleProgress({
        value: setValue,
        animationStartValue: oldValue
    });


}

function updateCo2Display(value) {

    var co2Circle = $('#co2_circle');

    // Let 3x avg Co2 kg/h be the Maximum to have an indicator at the bottom
    var setValue = value / (3 * CO2statistics.avg);
    var oldValue = co2Circle.circleProgress('value');

    co2Circle.circleProgress({
        value: setValue,
        animationStartValue: oldValue
    });


}

function updateCO2Chart(value, i, averageValue) {

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'CO2 Emission (kg/h)'
        },
        series: {
            1: {
                curveType: 'function'
            }
        }
    };

    var toBeAdded = [i, CO2statistics.avg, value];
    CO2Chartdata.addRow(toBeAdded);
    CO2Chart.draw(CO2Chartdata, options)

}

function updateGasPedal(value) {

    /*
var skillBar = $('#pedalbox')
    var skillVal = skillBar.attr("data-progress");

*/
    console.log(value);

    $('#gaspedal').html(Math.floor(value) + '%');


    /*
skillBar.animate({
        height: value
    }, 1500);
*/

}

function drawCurveTypes() {

    CO2Chartdata = new google.visualization.DataTable();
    CO2Chartdata.addColumn('number', 'X');
    CO2Chartdata.addColumn('number', 'Average');
    CO2Chartdata.addColumn('number', 'Current');

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Popularity'
        },
        series: {
            1: {
                curveType: 'function'
            }
        }
    };

    CO2Chart = new google.visualization.LineChart(document.getElementById('CO2Chart'));

    CO2Chart.draw(CO2Chartdata, options);
}

function calculateAverageSpeed(speed) {
  if (speed)
    averageSpeedArr.push(speed)
  var sum = 0;
  for( var i = 0; i < averageSpeedArr.length; i++ ){
      sum += averageSpeedArr[i]
  }
  var averageSpeed = sum/averageSpeedArr.length;
  return averageSpeed
}

function calculateAverageCO2(co2) {
  if (co2)
    averageCO2Arr.push(parseFloat(co2))
  var sum = 0;
  for( var i = 0; i < averageCO2Arr.length; i++ ){
      sum += averageCO2Arr[i]
  }
  var averageCO2 = sum/averageCO2Arr.length;
  return averageCO2
}

function calculateAverageConsumption(consumption) {
  if (consumption)
    averageConsArr.push(parseFloat(consumption))
  var sum = 0;
  for( var i = 0; i < averageConsArr.length; i++ ){
      sum += averageConsArr[i]
  }
  var averageCons = sum/averageConsArr.length;
  return averageCons
}
