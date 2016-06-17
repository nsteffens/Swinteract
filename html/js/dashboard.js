'use strict'

$(document).ready(function() {


  // circle on dashboard
  $('#speed_circle').circleProgress({
  			size: 100,
  			value: 0.0,
  			startAngle:1.5*Math.PI,
  			fill: { color: '#a3fff4' }
  	}).on('circle-animation-progress', function(event, progress, stepValue) {
      $("#speedStrong").html(parseInt(100 * stepValue) + '<i>%</i>');
  });



  $('#co2_circle').circleProgress({
  			size: 100,
  			value: 0.0,
  			startAngle:1.5*Math.PI,
  			fill:{ image: "/img/co2_gradient.png"} 
  	}).on('circle-animation-progress', function(event, progress, stepValue) {
      $("#speedStrong").html(parseInt(100 * stepValue) + '<i>%</i>');
  }); 

  $('#speed_circle').on('circle-animation-progress', function(e, v) {
  	var obj = $(this).data('circle-progress'),
    	  ctx = obj.ctx,
		  s = obj.size,
// 		  sv = (100 * v).toFixed(),
		  sv = $('#speed').html(),
		  fill = obj.arcFill;

		  ctx.save();
		  ctx.font = "bold " + s / 2.5 + "px sans-serif";
		  ctx.textAlign = 'center';
		  ctx.textBaseline = 'middle';
		  ctx.fillStyle = fill;
		  ctx.fillText(sv, s / 2, s / 2);
		  ctx.restore();
});

	$('#co2_circle').on('circle-animation-progress', function(e, v) {
	  	var obj = $(this).data('circle-progress'),
    	  ctx = obj.ctx,
		  s = obj.size,
// 		  sv = (100 * v).toFixed(),
		  sv = $('#Co2_display').html(),
		  fill = obj.arcFill;
		  
		  ctx.save();
		  ctx.font = "bold " + s / 3 + "px sans-serif";
		  ctx.textAlign = 'center';
		  ctx.textBaseline = 'middle';
		  ctx.fillStyle = $('#speed_circle').data('circle-progress').arcFill;
		  ctx.fillText(sv, s / 2, s / 2);
		  ctx.restore();
});




});
