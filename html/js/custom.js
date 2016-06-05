/*

	Custom Javascript file for swinteract.

*/

'use strict'

var swipeSpeed = 50;
var updateInterval = 5000; // in milliseconds

var receivedTracks;
var selectedCarData;

var CO2Chartdata;
var CO2Chart;
var CO2statistics;
google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawCurveTypes);


$.getJSON("https://envirocar.org/api/stable/statistics/CO2", function( statistics ){ 
		
	CO2statistics = statistics;	

})


$(document).ready(function() {
	console.log('Loading fullpage.js ...')
	
	var slideFinished = true;	// We need to monitor if the swipe animation has ended so we can start a new swipe	
		
	$('#fullpage').fullpage({
// 		anchors: ['firstPage', 'secondPage', '3rdPage'],		// Can be used to rewrite the URL
		sectionsColor: ['#3c3c3c', '#DE564B', '#EAE1C0'],
		slidesNavigation: true,
		afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){	// Callback function to let the next swipe through
			slideFinished = true;
		}
	});

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


	  // Integrate sliding and stuff here so we won't be bugged by back&forward gestures

	  //SWIPE RIGHT
	  if(slideFinished && event.deltaX > swipeSpeed){		
		  slideFinished = false;					// We will set it back to true when the afterSlideLoad callback is fired
		  $.fn.fullpage.moveSlideRight();
	  }

	  //SWIPE LEFT
	  if(slideFinished && event.deltaX < -swipeSpeed){
		  slideFinished = false;					// We will set it back to true when the afterSlideLoad callback is fired
		  $.fn.fullpage.moveSlideLeft();
	  }
	}, false);
	
	getTracks(function(tracks){		
		// Choose a track by random --- CURRENTLY DISABLED!!! 
		// We only get 100 tracks per API-call so we chose one of those..
		
		receivedTracks = tracks;
		
		var randomTrackIndex = Math.floor(Math.random()*100);
// 		Use this for activating randomly chosen track again. Read commit message for reason why it's disabled.						
// 		getCarData(tracks[randomTrackIndex].id, function(carData){
		getCarData(tracks[randomTrackIndex].id, function(carData){
	
			//console.log(carData);
			
// 			selectedCarData = carData;
			
			$.getJSON( "js/track.json", function( data ) {
					
				selectedCarData = data;
				simulateDriving();
				$('#statustext').html('Dashboard');
				
				console.log(data);
				
			});

	
		})
		
		
	});
	
});

function getTracks(done){
	
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
    	console.log("HTTP Request Failed with status: "+textStatus);
	})
}

function getCarData(track_id, done){		
	
	jQuery.ajax({
    	url: "https://envirocar.org/api/stable/tracks/"+track_id+"/",
		type: "GET",
	})
	.done(function(carData, textStatus, jqXHR) {
		done(carData);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
    	console.log("HTTP Request Failed");
	})
	
}

function simulateDriving(){
	
	// carData is recorded every 5 seconds (calculated by timestamp difference)
	
	var i = 0;
	var co2log_data = [];
	var co2log_label = [];
	
	
	var drivingLoop = setInterval(function(){    	
    	i++;
    	
    	var speedValue 	= Math.floor(selectedCarData.features[i].properties.phenomenons.Speed.value);
    	var rpmValue 	= Math.floor(selectedCarData.features[i].properties.phenomenons.Rpm.value); 
    	
    	// Update Speed
    	$('#speed').html(speedValue);
    	updateSpeedDisplay(speedValue);
    	
    	// Update RPM
		$('#rpm').html(rpmValue);		
		updateRpmDisplay(rpmValue);
    	
    	// For CO2:
    	//console.log(selectedCarData.features[i].properties.phenomenons.CO2.value);
		
		// CO2 Screen
		
		
		updateCO2Chart(selectedCarData.features[i].properties.phenomenons.CO2.value, i);
		
		
		
		//Slide1Chart.data.datasets[1].data[i] = selectedCarData.features[i].properties.phenomenons.CO2.value;
	
		
		if(i == selectedCarData.features.length - 1){
			
			$('#statustext').html('Simulation finished.');			
			
		}
		
	}, updateInterval);

	// Use this to stop the loop:
	//clearInterval(drivingLoop);	
	
}

function updateSpeedDisplay(value){
	
	var speedCircle = $('#speed_circle');
	
	// Let 180 km / h be the max displayable speed --> Calculate Percentage of 180
	var setValue = value / 180;
	var oldValue = speedCircle.circleProgress('value');
	
	speedCircle.circleProgress({value: setValue, animationStartValue: oldValue});
			
	
}

function updateRpmDisplay(value){
	
	var rpmCircle = $('#rpm_circle');
	
	// Let 6000 RPM be the max displayable speed --> Calculate Percentage of 180
	var setValue = value / 6000;
	var oldValue = rpmCircle.circleProgress('value');
	
	rpmCircle.circleProgress({value: setValue, animationStartValue: oldValue});
			
	
}

function updateCO2Chart(value,i, averageValue){
	
	var options = {
    	hAxis: {
        	title: 'Time'
		},
		vAxis: {
        	title: 'CO2 Emission (kg/h)'
		},
		series: {
        	1: {curveType: 'function'}
		}
    };
	

		
	var toBeAdded = [i, CO2statistics.avg, value];
	console.log(toBeAdded);
	CO2Chartdata.addRow(toBeAdded);
	
	CO2Chart.draw(CO2Chartdata, options)
	
	
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
          1: {curveType: 'function'}
        }
      };

      CO2Chart = new google.visualization.LineChart(document.getElementById('CO2Chart'));
            
      CO2Chart.draw(CO2Chartdata, options);
    }
