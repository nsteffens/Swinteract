/*
	
	index.js	-	This is the file where all the routing will happen, won't be much (hopefully ;-) )
	
*/



var express = require('express');
var app = express();


app.use(express.static('html'));
app.use(express.static('bower_components'));



app.listen('3001', function(){
	
	console.log('Swinteract Server listening on port 3001.');
	
	
});