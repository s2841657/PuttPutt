    
    
//------- Google Maps ---------//

// Creating a LatLng object containing the coordinate for the center of the map
var latlng = new google.maps.LatLng(-28.043475, 153.433862);

// Creating an object literal containing the properties we want to pass to the map
var options = {
	center: latlng,
    zoom: 18, // This number can be set to define the initial zoom level of the map
    mapTypeId: google.maps.MapTypeId.ROADMAP // This value can be set to define the map type ROADMAP/SATELLITE/HYBRID/TERRAIN
};

// Calling the constructor, thereby initializing the map
var map = new google.maps.Map(document.getElementById('map_div'), options);

// Define Marker properties
var image = new google.maps.MarkerImage('https://yt3.ggpht.com/-hUHd2RtG_aU/AAAAAAAAAAI/AAAAAAAAAAA/cXfRAZjd97A/s100-c-k-no/photo.jpg',
    // This marker is 129 pixels wide by 42 pixels tall.
    new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    new google.maps.Point(10,0),
    // The anchor for this image is the base of the flagpole at 18,42.
    new google.maps.Point(18, 42)
);    


// Add Markers
var marker1 = new google.maps.Marker({
    position: new google.maps.LatLng(-28.043478, 153.433865),
    map: map
});

// Add listener for a click on the pin
google.maps.event.addListener(marker1, 'click', function() {
    infowindow1.open(map, marker1);
});

// Add information window
var infowindow1 = new google.maps.InfoWindow({
    content:  createInfo('<a title="Click to view our website" href="http://www.puttputtgolf.com.au/">Our Website <img src="https://yt3.ggpht.com/-hUHd2RtG_aU/AAAAAAAAAAI/AAAAAAAAAAA/cXfRAZjd97A/s100-c-k-no/photo.jpg"/></a>')
});



// Create information window
function createInfo(title, content) {
    return '<div class="infowindow"><strong>'+ title +'</strong>'+content+'</div>';
}

