var courseName;
var currentHole;

// This is the database
var scoreCard;



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

function displayHole(holeNumber) {
	// Show the current hole
	$('#holeLbl').text('Hole #' + holeNumber);
	
	// Clear the table
	$('#perHoleTbl tbody').empty();
}
