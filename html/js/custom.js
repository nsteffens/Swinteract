/*

	Custom Javascript file for swinteract.

*/

'use strict'

const swipeSpeed = 50;

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
	  if(slideFinished && event.deltaX > swipeSpeed){		// 200 Seems to fit quite good..
		  slideFinished = false;					// We will set it back to true when the afterSlideLoad callback is fired
		  $.fn.fullpage.moveSlideRight();
	  }

	  //SWIPE LEFT
	  if(slideFinished && event.deltaX < -swipeSpeed){		// 200 Seems to fit quite good..
		  slideFinished = false;					// We will set it back to true when the afterSlideLoad callback is fired
		  $.fn.fullpage.moveSlideLeft();
	  }
	}, false);

	

});
