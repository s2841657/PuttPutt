var courseName;
var currentHole;

// This is the database
var scoreCard = null; 



/* This function prevents the event listener from
 * being called before the handler can respond.
 */
function onBodyLoad() {
	if (typeof navigator.device === 'undefined'){
		onDeviceReady();
	} else {
		document.addEventListener('deviceready', onDeviceReady, false);
	}
}


function onDeviceReady() {
	try {
		// Open the database if there is support
		if (window.openDatabase) {
			scoreCard = window.openDatabase('Scores', '1.0', 'Putt Putt Scores', 200000);
			scoreCard.transaction(createScorecard, errorCB, successCB);
		}
	} catch(e) {
		alert('An error occurred: '+e);
	}
}


$('#homePlayBtn').click(function() {
	if (!window.openDatabase) {
		alert ('Sorry, you don\'t have database support!');
		//return false;
	}
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
	// At least one player must have entered a name
	var nameEntered = false;
	$('.playerName').each(function(index){
		if ($(this).val().length > 0) {
			nameEntered = true;
			return false;
		}
	});
	if (!nameEntered) {
		alert ('Enter some player names.');
		return false;
	}
	
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
	
	// Add the players to the scorecard
	$('.playerName').each(function(index){
		if ($(this).val().length > 0) {
			$('#perHoleTbl').append('<tr><td><div class="playerLbl">' +
					$(this).val() +
					'</div></td><td><input type="text" class="scoreInput" /></td>' +
					'<td><div class="totalLbl"></div></td></tr>');
		}
	});
}


function createScorecard(tx) {
	// We want to clear any previous data in the table
	tx.executeSql('DROP TABLE IF EXISTS scorecard;');
    tx.executeSql('CREATE TABLE IF NOT EXISTS scorecard (id INTEGER PRIMARY KEY, holeID INTEGER NOT NULL, name TEXT NOT NULL, score INTEGER);');
	tx.executeSql('INSERT INTO scorecard (holeID, name, score) VALUES (1, "hello", 1);');
}


// Transaction error callback
function errorCB(tx, err) {
	alert('Error processing SQL: '+err);
}


// Transaction success callback
function successCB() {
	alert('Success!');
}
