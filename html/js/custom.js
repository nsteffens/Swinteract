/*
	
	Custom Javascript file for swinteract.
		
*/

$(document).ready(function() {
	console.log('Loading fullpage.js ...')
	
	$('#fullpage').fullpage({
// 		anchors: ['firstPage', 'secondPage', '3rdPage'],
		sectionsColor: ['#8FB98B', '#DE564B', '#EAE1C0'],
		slidesNavigation: true
	});
});
