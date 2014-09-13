var courseName;
var currentHole;

// This is the database
var scoreCard;




document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
	scoreCard = window.openDatabase("Scores", "1.0", "Putt Putt Scores", 200000); 
}


$('#homePlayBtn').click(function() {
	// Check whether a game is in progress
	// SELECT name FROM sqlite_master WHERE type='table' AND name='scorecard';
	// $(this).attr('href', '#perHolePage');
	
	// Or create a new one
});





// Store the selected course
$('.courseSelect').click(function() {
	courseName = $(this).text();
});



$('#setupPlayBtn').click(function() {
	// Create a new scorecard in the database
	initScorecard();
	
	// Display the player names and scorecard
	initPerHoleTbl();
	
	displayHole(currentHole = 1);
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
}



function initPerHoleTbl() {
	// Clear the table
	$('#perHoleTbl tbody').empty();
	
	$('.playerName').each(function(index){
		if ($(this).val().length > 0) {
			$('#perHoleTbl').append('<tr><td><div class="playerLbl">' +
					$(this).val() +
					'</div></td><td><input type="text" class="scoreInput" /></td>' +
					'<td><div class="totalLbl"></div></td></tr>');
		}
	});
}



function initScorecard() {
	try {
		scoreCard.transaction(createScorecard, errorCB, successCB);
	} catch(e) {
		alert("An error occurred: "+e);
	}
}



function createScorecard(tx) {
	// We want to clear any previous data in the table
	tx.executeSql('DROP TABLE IF EXISTS scorecard');
    tx.executeSql('CREATE TABLE IF NOT EXISTS scorecard (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)');
}



// Transaction error callback
//
function errorCB(tx, err) {
	alert("Error processing SQL: "+err);
}



// Transaction success callback
//
function successCB() {
	alert("success!");
}
