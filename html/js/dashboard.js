'use strict'

$(document).ready(function() {

  // circle on dashboard
  	$('.second.circle').circleProgress({
  			size: 300,
  	    value: 0.6,
  			startAngle:1.5*Math.PI,
  			fill: { color: '#a3fff4' }
  	}).on('circle-animation-progress', function(event, progress, stepValue) {
      $("#speedStrong").html(parseInt(100 * stepValue) + '<i>%</i>');
  });

});
