var courseName;
var currentHole;

// This is the database
var scoreCard;


document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
	
}


$('#homePlayBtn').click(function() {
	// Check whether a game is in progress
	//scoreCard=loadGame();
	//$(this).attr('href', '#perHolePage');
	
	// Or create a new one
});

// Store the selected course
$('.courseSelect').click(function() {
	courseName = $(this).text();
});

$('#setupPlayBtn').click(function() {
	displayHole((currentHole = 1));
});

$('#prevHole').click(function() {
	// Save before transition
	
	if (typeof currentHole === 'undefined'){
		displayHole(currentHole=1);
	} else if (currentHole > 1) {
		displayHole(--currentHole);
	}
});

$('#nextHole').click(function() {
	if (typeof currentHole === 'undefined'){
		displayHole(currentHole=1);
	} else if (currentHole < 18) {
		displayHole(++currentHole);
	}
});

function displayHole(holeNumber) {
	// Show the current hole
	$('#holeLbl').text('Hole #' + holeNumber);
	
	// Clear the table
	$('#perHoleTbl tbody').empty();
}
