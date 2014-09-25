// A list of courses
var COURSES = {
	FUNRUN : { value:300, name:'Fun Run', code:'FunRun' },
	JUNGLETRAIL : { value:200, name:'Jungle Trail', code:'JungleTrail' },
	WATERWAYSCOVE : { value: 100, name:'Waterways Cove', code:'WaterwaysCove' }
};
// The course which is being played (eg: COURSES.FUNRUN)
var selectedCourse;


var currentHole;
// This is the unique id of each hole
function getHoleID(course, hole) {
	return course.value + hole;
}

// This will hold the database
var database;
// Whether a score has been edited (and needs saving)
var wasEdited;



$('#homePlayBtn').click(function() {
	if (window.openDatabase) {
		try {
			database = window.openDatabase('Scores', '1.0', 'Putt Putt Scores', 200000);
			// Load an existing game
			database.transaction(inProgressQuery, errorCB);
		} catch(err) {
			// If a console is available 
			if (window.console && window.console.log) {
				// log the error to it
				console.log('An error occured: '+err);
			}
		}
	} else {
		alert ('Sorry, you don\'t have database support!');
		return false;
	}
});



// Check whether a game is already in progress
function inProgressQuery(tx) {
	tx.executeSql('SELECT HoleID FROM Scorecard', [], promptToContinue, errorCB);
}



// Check whether the user wants to continue a saved game
function promptToContinue(tx, results) {
	
	
	// NEED TO IMPLEMENT DIALOG BOX
	
	
	if (results.rows.length > 0 &&
			(selectedCourse = courseFromholeID(results.rows[0].HoleID))
			) {
		database.transaction(setupExistingScorecard, errorCB);
		updatePerHolePage(currentHole=1);
		window.location = '#perHolePage';
	}
}



// Store the selected course
$('.courseSelectBtn').click(function() {
	selectedCourse = courseFromName($(this).text());
});



$('#setupPlayBtn').click(function() {
	// Display the player names and scorecard
	if (setupNewScorecard()) {
		database.transaction(createNewScorecard, errorCB);
		updatePerHolePage(currentHole=1);
	} else {
		alert ('Enter some player names.');
		return false;
	}
});



function setupNewScorecard() {
	var nameEntered = false;
	var playerName;
	
	$('.playerName').each(function() {
		playerName = $(this).val();
		if (playerName.length > 0) {
			
			if (!nameEntered) {
				nameEntered = true;
				// Clear the table
				$('#perHoleTbl tbody').empty();
				// The first name needn't be checked
				addPlayerToScorecard(playerName);
			
			// Add unique player names to the scorecard
			} else if (-1 == $.inArray(playerName, $('#perHoleTbl .playerLbl'))) {
				addPlayerToScorecard(playerName);
			}
		}
	});
	// Return whether a name was added 
	return nameEntered;
}



function setupExistingScorecard(tx) {
	tx.executeSql('SELECT DISTINCT Name FROM Scorecard', [], 
			function(tx, result) {
				$.each(result, function(index, value) {
					addPlayerToScorecard(value.Name);
				});
			}, errorCB);
}



function addPlayerToScorecard(playerName) {
	// Add the player to the scorecard
	$('#perHoleTbl tbody').append('<tr><td><div class="playerLbl">' +
			 playerName +
			'</div></td><td><input type="text" class="scoreInput" /></td>' +
			'<td><div class="totalLbl"></div></td></tr>');
}



// Player's score textfield has been changed (and needs saving)
$('#perHoleTbl .scoreInput').on('input propertychange paste', function() {
	if (!wasEdited) {
		wasEdited = true;
	}
});



$('#prevHole').click(function() {
	updatePerHolePage(--currentHole);
});



$('#nextHole').click(function() {
	updatePerHolePage(++currentHole);
});



function updatePerHolePage(hole) {
	if (!hole || hole < 1) {
		currentHole = 1;
	}
	
	if (wasEdited) {
		wasEdited = false;
		database.transaction(saveCurrentHole, errorCB);
	}
	
	if (hole > 18) {
		updateLeaderboard();
	} else {
		currentHole = hole;
		displayCurrentHole();
	}
}



function displayCurrentHole() {
	// Show the current hole
	$('#holeLbl').text('Hole #' + currentHole);
	// Display each players' score for that hole
	database.transaction(displayPerHoleScores, errorCB);
}



// Display the score on the per-hole table
function displayPerHoleScores(tx) {
	tx.executeSql('SELECT Name, Score FROM Scorecard WHERE HoleID = $', [getHoleID(selectedCourse.value, currentHole)],
			function(tx, result) {
				var rowIndex;
				var tblRows = $('#perHoleTbl tr');
				$.each(result, function(tblIndex, value) {
					if (-1 != (rowIndex = $.inArray(value.Name, tblRows.find('.playerLbl')))) {
						tblRows.eq(rowIndex).find('.scoreInput').val(value.Score);
					}
				});
			}, errorCB);
}



function createNewScorecard(tx) {
	tx.executeSql('DROP TABLE IF EXISTS Scorecard');
	tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (Name, HoleID)) WITHOUT ROWID');	
}



function saveCurrentHole(tx) {
	var holeID = getHoleID(selectedCourse, currentHole);
	
	// Update each player's score in the database
	$('#perHoleTbl tr').each(function(index, value) {
		tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ($,$,$)',
			[	holeID,
				value[0].text(),
				value[1].val()
			],
			errorCB);
	});
}



function updateLeaderboard() {
	
}



function courseFromName(name) {
	var course;
	switch (name) {
		case COURSES.FUNRUN.name:
			course = COURSES.FUNRUN;
			break;
		case COURSES.JUNGLETRAIL.name:
			course = COURSES.JUNGLETRAIL;
			break;
		case COURSES.WATERWAYSCOVE.name:
			course = COURSES.WATERWAYSCOVE;
			break;
	}
	return course;
}



function courseFromholeID(id) {
	var course;
	if (id > 300) {
		course = COURSES.FUNRUN;
	} else if (id > 200) {
		course = COURSES.JUNGLETRAIL;
	} else if (id > 100) {
		course = COURSES.WATERWAYSCOVE;
	} else {
		course = null;
	}
	return course;
}



// Database transaction error callback
function errorCB(tx, err) {
	// If a console is available
	if (window.console && window.console.log) {
		// log the error to it
		console.log('Error processing SQL: '+err);
	}
}
