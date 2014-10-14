/*
	It is generally bad design to hardcode certain things like the holeID and COURSES, but I wanted to avoid having to create a table with static values, then having to also implement foreign keys. This may become an issue if more courses or holes are added.
*/

// A list of courses
var COURSES = {
	FUNRUN : { value:100, name:'Fun Run', code:'FunRun' },
	JUNGLETRAIL : { value:200, name:'Jungle Trail', code:'JungleTrail' },
	WATERWAYSCOVE : { value: 300, name:'Waterways Cove', code:'WaterwaysCove' }
};
// The course which is being played (eg: COURSES.FUNRUN)
var selectedCourse;
// The course which is being viewed in the leaderboard
var leaderboardCourse;

var currentHole;
// This is the unique id of each hole
function getHoleID(course, hole) {
	return course.value + hole;
}

var playerNames = [];

// Whether a score has been edited (and needs saving)
var wasEdited;

// Whether the user has opted to continue an existing game or start a new one
var willContinue;
// This will hold the database
var database;
document.addEventListener('deviceready', onDeviceReady, false);


// Device APIs are available
function onDeviceReady() {
	database = window.openDatabase('Scorecard', '1.0', 'Putt Putt Scores', 200000);
	// Ensure the leaderboard is available
	database.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS Leaderboard (Name TEXT, Course TEXT, Score INTEGER)');
	}, errorCB);
	return false;
}



$('#homeLeaderboardBtn').click(function(){
	if (window.openDatabase) {
		// Reset the leaderboard table
		leaderboardCourse = null;
		$('#leaderboardTbl tbody').empty();
	} else {
		alert ('Sorry, you don\'t have database support!');
		return false;
	}
});



$('#homePlayBtn').click(function() {
	if (window.openDatabase) {
		willContinue = false;
		// Load an existing game
		database.transaction(inProgressQuery, errorCB, function() {
			if (willContinue) {
				database.transaction(setupExistingScorecard, errorCB);
				updatePerHolePage(currentHole=1);
				window.location = '#perHolePage';
			}
		});
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
function promptToContinue(tx, result) {
	if (result.rows.length > 0 &&
			(selectedCourse = courseFromholeID(result.rows.item(0).HoleID)) &&
			confirm('Continue your previous game?')) {
		willContinue = true;
	}
}



// Store the selected course
$('.courseSelect').click(function() {
	selectedCourse = courseFromName($(this).text());
});



$('#setupPlayBtn').click(function() {
	// Display the player names and scorecard
	if (setupNewScorecard()) {
		database.transaction(createNewScorecard, errorCB, function(){
			wasEdited = false;
			updatePerHolePage(1);
		});
	} else {
		alert ('Enter some player names.');
		return false;
	}
});



function setupNewScorecard() {
	playerNames = getUniqueNames();
	
	addPlayersToScorecard();
	
	// Return whether names were entered 
	return playerNames.length > 0;
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
				playerNames = [];
				for(var i = 0, len = result.rows.length; i < len; ++i) {
					playerNames[i] = result.rows.item(i).Name;
				}
				
				addPlayersToScorecard();
				
				wasEdited = true;
				updatePerHolePage(1);
			}, errorCB);
}



function addPlayersToScorecard() {
	if (playerNames.length > 0) {
		$('#perHoleTbl tbody').empty();
	}
	// Add each player to the scorecard
	$.each(playerNames, function(index, value) {
		$('#perHoleTbl tbody').append('<tr><td><div class="playerLbl">' +
				value +
				'</div></td><td><input type="text" class="scoreInput" /></td>' +
				'<td><div class="totalLbl"></div></td></tr>');
	});
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
		database.transaction(saveCurrentHole, errorCB, function() {
			wasEdited = false;
			database.transaction(displayPerHoleTotal, errorCB, function() {
				updatePerHolePage(hole);
			});
		});
		return;
	}
	
	var willUpdate = false;
	
	if (!hole || hole < 1) {
		willUpdate = ((hole = 1) != currentHole);
	} else if (hole > 18) {
		if (hole == 19) {
			database.transaction(updateLeaderboard, errorCB);
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
	// alert('displayPerHoleScores current_hole:' + currentHole);
		var holeID = getHoleID(selectedCourse, currentHole);
		//alert("Current hole " + current_hole);
		tx.executeSql('SELECT Name, Score, HoleID FROM Scorecard WHERE HoleID='+holeID, [],
			function(tx, results) {
				var rowIndex;
		        var len = results.rows.length;
		        var tblRows = $('#perHoleTbl tbody tr');
		        for (var i=0; i<len; i++){
		        	rowIndex = -1;
		        	var players = $('.playerLbl');
		        	for(var j = 0; j < players.length; j++) {
		        		if($('.playerLbl').eq(j).text() === results.rows.item(i).Name) {
		        			rowIndex = j;
		        			break;
		        		}
		        	}
		        
					if (rowIndex != -1) {
						tblRows.eq(rowIndex).find('.scoreInput').val(results.rows.item(i).Score);
					}
		        }				

			}, errorCB);
}


function displayPerHoleTotal(tx) {
	tx.executeSql('SELECT Name, SUM(Score) AS Total FROM Scorecard GROUP BY Name', [], function(tx, result) {
		var rowIndex;
		var qryLength = result.rows.length;

		var tblRows = $('#perHoleTbl tbody tr');
		var players = tblRows.find('.playerLbl');
		var playerLength = players.length;

		for (var i=0; i < qryLength; ++i) {
			rowIndex = -1;

			for (var j=0; j < playerLength; ++j) {
				if (players.eq(j).text() === result.rows.item(i).Name) {
					rowIndex = j;
					break;
				}
			}

			if (-1 != rowIndex) {
				tblRows.eq(rowIndex).find('.totalLbl').text(result.rows.item(i).Total);
			}
		}
	}, errorCB);
}


function createNewScorecard(tx) {
	tx.executeSql('DROP TABLE IF EXISTS Scorecard', [], null, errorCB);
	tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (HoleID, Name))', [], null, errorCB);
}



function saveCurrentHole(tx) {
	var holeID = getHoleID(selectedCourse, currentHole);
	$('#perHoleTbl tbody tr').each(function(index, value) {
		var name = $(this).find("td").eq(0).text();
		var score = parseInt($(this).find("td").eq(1).find("input").val());
		
		if (!isNaN(score) && !(score < 0 || score > 7)) {
			tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ('+holeID+', "'+name+'", '+score+')', [], null, errorCB);
		}
	});
	return;
}



$('#holeInfo').click(function() {
	var imgLocation = 'img/hole/' + getHoleID(selectedCourse, currentHole) + '.gif';
	
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



function updateLeaderboard(tx) {
	$('#perHoleTbl tbody tr').each(function(index, value) {
		name = $(this).find('.playerLbl').eq(0).text();
		score = parseInt($(this).find('.totalLbl').eq(0).text());
		
		tx.executeSql('INSERT INTO Leaderboard (Name, Course, Score) Values ("'+name+'", "'+selectedCourse.code+'",'+score+')');
	});
	
	var limitQry = 'DELETE FROM Leaderboard WHERE RowID NOT IN '+
			'(SELECT * FROM (SELECT RowID FROM Leaderboard WHERE Course = "' + selectedCourse.code + '" ORDER BY Score ASC LIMIT 5) '+
			'UNION SELECT RowID FROM Leaderboard WHERE Course != "' + selectedCourse.code + '")';
	
	tx.executeSql(limitQry);
}



$('#resetLeaderboardBtn').click(function() {
	if (confirm('Are you sure you want to reset the leaderboards?\nThis can\'t be undone!')) {
		database.transaction(function(tx){
			tx.executeSql('DROP TABLE IF EXISTS Leaderboard');
			tx.executeSql('CREATE TABLE IF NOT EXISTS Leaderboard (Name TEXT, Course TEXT, Score INTEGER)');
		}, errorCB, function() {
			alert('The leaderboards have been reset!');
		});
	}
});


// Display the high scores for each course
$('.leaderboardBtn').click(function() {
	var temp;
	// When a new course is selected
	if (leaderboardCourse !== (temp = courseFromName($(this).text())) && temp) {
		leaderboardCourse = temp;
		// Clear the table
		$('#leaderboardTbl tbody').empty();
	
		// Get the high scores from the database
		database.transaction(displayLeaderboardPage, errorCB); 
	}
});



function displayLeaderboardPage(tx) {
	tx.executeSql('SELECT Name, Score FROM Leaderboard WHERE Course = "'+ leaderboardCourse.code +'" ORDER BY Score', [], function(tx, result) {
		for (var i = 0, len = result.rows.length, prevScore = 0, place = 1, currentScore; i < len; ++i) {
			
			currentScore = result.rows.item(i).Score;
			if (currentScore !== prevScore) {
				place = i+1;
			}
			prevScore = currentScore;
			
			$('#leaderboardTbl tbody').append('<tr><td>' +
					place +
					'</td><td>' +
					result.rows.item(i).Name +
					'</td><td>' +
					currentScore +
					'</td></tr>');
		}
	}, errorCB);
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
	alert('Error processing SQL - Code: '+err.code+'\n'+err);
	
	// If a console is available
	if (window.console && window.console.log) {
		// log the error to it
		console.log('Error processing SQL: '+err);
	}
}