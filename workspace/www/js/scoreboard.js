// A list of courses
var COURSES = {
	FUNRUN : { value:100, name:'Fun Run', code:'FunRun' },
	JUNGLETRAIL : { value:200, name:'Jungle Trail', code:'JungleTrail' },
	WATERWAYSCOVE : { value: 300, name:'Waterways Cove', code:'WaterwaysCove' }
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
		//return false;
	}
});



// Check whether a game is already in progress
function inProgressQuery(tx) {
	tx.executeSql('SELECT HoleID FROM Scorecard', [], promptToContinue, errorCB);
}



// Check whether the user wants to continue a saved game
function promptToContinue(tx, results) {
	alert('promptToContinue');
	
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
$('.courseSelect').click(function() {
	selectedCourse = courseFromName($(this).text());
});



$('#setupPlayBtn').click(function() {
	// Display the player names and scorecard
	if (setupNewScorecard()) {
		wasEdited = false;
		updatePerHolePage(1);
		database.transaction(createNewScorecard, errorCB);
	} else {
		alert ('Enter some player names.');
		return false;
	}
});



function setupNewScorecard() {
	var players = getUniqueNames();
	
	$.each(players, function(index, value) {
		addPlayerToScorecard(value);
	});
	
	// Return whether names were entered 
	return players.length > 0;
}



function getUniqueNames() {
	var players = [];
	var index = 0;
	
	var name;
	$('.playerName').each(function() {
		
		name = $(this).val();
		if (name && name.length > 0) {
			
			if (players.length == 0) {
				// Clear the table
				$('#perHoleTbl tbody').empty();
				players[index++] = name;
				
			// Add unique player names to the scorecard
			} else if (-1 == $.inArray(name, players)) {
				players[index++] = name;
			}
		}
	});
	
	return players;
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
$('#perHoleTbl').on('input propertychange paste', function() {
	if (!wasEdited) {
		wasEdited = true;
	}
});



$('#prevHole').click(function() {
	updatePerHolePage(currentHole-1);
});



$('#nextHole').click(function() {
	updatePerHolePage(currentHole+1);
});



function updatePerHolePage(hole) {
	holeInOneVisible(false);
	if (wasEdited) {
		alert('updatePerHolePage > wasEdited');
		database.transaction(saveCurrentHole, errorCB);
		wasEdited = false;
	}
	
	var willUpdate = false;
	
	if (!hole || hole < 1) {
		willUpdate = ((hole = 1) != currentHole);
	} else if (hole > 18) {
		if (hole == 19) {
			alert('leaderboard');
			//updateLeaderboard();
			//window.location = '#wholeCoursePage';
		}
		
		hole = 18;
	} else {
		willUpdate = true;
	}
	
	currentHole = hole;
	
	if (willUpdate) {
		displayCurrentHole();
	}
}



function displayCurrentHole() {
	// Show the current hole
	$('#holeLbl').text('Hole #' + currentHole);
	$('.scoreInput').val('');
	// Display each players' score for that hole
	database.transaction(displayPerHoleScores, errorCB);
}



// Display the score on the per-hole table
function displayPerHoleScores(tx) {
	alert('displayPerHoleScores');
	
	tx.executeSql('SELECT Name, Score FROM Scorecard WHERE HoleID = $', [getHoleID(selectedCourse.value, currentHole)],
			function(tx, result) {
				alert('SELECT Name, Score FROM Scorecard length = ' + result.rows.length);
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
	tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (HoleID, Name)) WITHOUT ROWID');	
}



function saveCurrentHole(tx) {
	alert('saveCurrentHole');
	var holeID = getHoleID(selectedCourse, currentHole);
	
	$('#perHoleTbl tr').each(function(index, value) {
		alert('inEach');

		tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ($, $, $)', [holeID, value[0].text(), value[1].val()],
				function() { alert('saveSuccessful');  }, errorCB);
	});
}



function updateLeaderboard() {
	
}



$('#holeInfo').click(function() {
	var imgLocation = '/img/hole/test.gif';// + getHoleID(selectedCourse, currentHole) + '.gif';
	
	alert(''+imgLocation);
	
	$('#holeOverlay').html('<img src="'+ imgLocation +'"></img>');
	
	holeInOneVisible(true);
});



$('#holeOverlay').click(function(){
	$(this).hide();
	holeInOneVisible(false);
});



function holeInOneVisible(diagramVisible) {
	if (diagramVisible) {
		$('#holeOverlay').show();
		
		$('#perHoleTbl').hide();
		$('#footerNav').hide();
	} else {
		$('#holeOverlay').hide();
		
		$('#perHoleTbl').show();
		$('#footerNav').show();
	}
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
		course = COURSES.WATERWAYSCOVE;
	} else if (id > 200) {
		course = COURSES.JUNGLETRAIL;
	} else if (id > 100) {
		course = COURSES.FUNRUN;
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
	} else {
		alert('Error processing SQL: '+err);
	}
}
