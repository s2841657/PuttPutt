// A list of courses
var COURSES = {
	FUNRUN : { value:100, name:'Fun Run', code:'FunRun' },
	JUNGLETRAIL : { value:200, name:'Jungle Trail', code:'JungleTrail' },
	WATERWAYSCOVE : { value: 300, name:'Waterways Cove', code:'WaterwaysCove' }
};
// The course which is being viewed in the leaderboard
var leaderboardCourse;
// The course which is being played (eg: COURSES.FUNRUN)
var selectedCourse;

// The id of the hole which is being played
var currentHole;
// This is the unique id of each hole
function getHoleID(course, hole) {
	return course.value + hole;
}
// 1 or 2 for front- and back-nine respectively
var currentNine;

// Whether a score has been edited (and needs saving)
var wasEdited;

// The players on the scorecard
var playerNames = [];

// Whether the user has opted to continue an existing game or start a new one
var willContinue;

// This is the database for the scorecard and leaderboard
var database;
document.addEventListener('deviceready', onDeviceReady, false);


// Device APIs are available
function onDeviceReady() {
	database = window.openDatabase('Database', '1.0', 'Putt Putt Scores', 200000);
	// Ensure the tables are available
	database.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS Leaderboard (Name TEXT, Course TEXT, Score INTEGER)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (HoleID, Name))');
	}, errorCB);
	
	return false;
}



// The leaderboard button on the home page is clicked
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



// Refresh the leaderboard page when navigating away
$('#leaderboardSettings').click(function(){
	// Clear the table
	leaderboardCourse = null;
	$('#leaderboardTbl tbody').empty();
});



$('#homePlayBtn').click(function() {
	if (window.openDatabase) {
		willContinue = false;
		// Load an existing game
		database.transaction(inProgressQuery, errorCB, function() {
			if (willContinue) {
				// Display the loaded scorecard
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
			database.transaction(populateNewScorecard, errorCB, function(){
				wasEdited = true;
				updatePerHolePage(1);
			});
		});
	} else {
		alert ('Enter some player names.');
		return false;
	}
});



// Add each player to the scorecard
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
	// Iterate through each player's name input
	$('.playerName').each(function() {
		
		name = $(this).val();
		if (name && name.length > 0) {
			
			if (players.length == 0) {
				// We can be certain the first name is unique
				players[index++] = name;
				
			// Add unique player names to the scorecard
			} else if (-1 == $.inArray(name, players)) {
				players[index++] = name;
			}
		}
	});
	
	return players;
}



// Load a scorecard from the database
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



// Display players on the scorecard
function addPlayersToScorecard() {
	if (playerNames.length > 0) {
		// Clear the scorecard table
		$('#perHoleTbl tbody').empty();
	}
	
	// Add each player to the scorecard
	$.each(playerNames, function(index, value) {
		$('#perHoleTbl tbody').append('<tr><td><div class="playerLbl">' +
				value +
				'</div></td><td class="score"><input type="tel" class="scoreInput" /></td>' +
				'<td><div class="totalLbl"></div></td></tr>');
	});
}



// Player's score textfield has been changed (and needs saving)
$('#perHoleTbl').on('input propertychange paste', function() {
	if (!wasEdited) {
		wasEdited = true;
	}
});



// Display the previous hole
$('#prevHole').click(function() {
	if (validatePerHoleInput()) {
		updatePerHolePage(currentHole-1);
	}
});



// Display the next hole
$('#nextHole').click(function() {
	if (validatePerHoleInput()) {
		updatePerHolePage(currentHole+1);
	}
});



// Make sure only valid scores have been entered
function validatePerHoleInput() {
	var isValid = true;
	
	// Iterate through each score
	for (var i = 0, score, length = $('.scoreInput').length; i < length; ++i) {
		// Parse each input field to an integer
		input = $('.scoreInput').eq(i).val();
		// Empty fields are zero
		score = parseInt((input ? input : 0));
		
		if (isNaN(score) || score < 0 || score > 7) {
			isValid = false;
		}
	}
	
	// If a score hasn't been entered correctly
	if (!isValid) {
		// Ask whether that score should be ignored
		isValid = confirm('Your scores should be between 1 and 6! Invalid scores will be ignored.\nDo you want to continue?');
	}
	
	return isValid;
}



// Save any scores then display another hole
function updatePerHolePage(hole) {
	// An error has occured as the scorecard has been cleared
	if(!$('#perHoleTbl tbody tr').length) {
		window.location = '#homePage';
	}
	
	if (wasEdited) {
		// Save the new scores to the database
		database.transaction(saveCurrentHole, errorCB, function() {
			wasEdited = false;
			// Refresh the total
			database.transaction(displayPerHoleTotal, errorCB, function() {
				updatePerHolePage(hole);
			});
		});
		return;
	}
	
	var willUpdate = false;
	
	// Ensure the hole is within bounds
	if (!hole || hole < 1) {
		willUpdate = ((hole = 1) != currentHole);
	} else if (hole > 18) {
		if (hole == 19) {
			database.transaction(updateLeaderboard, errorCB, function(){
				window.location = "#roundCompletePage";
			});
		} else {
			hole = 18;
		}
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
	var holeID = getHoleID(selectedCourse, currentHole);

	tx.executeSql('SELECT Name, Score, HoleID FROM Scorecard WHERE HoleID='+holeID, [],
			function(tx, result) {
				var rowIndex;
				var len = result.rows.length;
				var tblRows = $('#perHoleTbl tbody tr');
				for (var i=0; i<len; ++i){
					rowIndex = -1;
					for(var j = 0, players = $('.playerLbl'); j < players.length; ++j) {
						if(players.eq(j).text() === result.rows.item(i).Name) {
							rowIndex = j;
							break;
						}
					}
					
					if (rowIndex != -1 && result.rows.item(i).Score) {
						tblRows.eq(rowIndex).find('.scoreInput').val(result.rows.item(i).Score);
					}
				}
			}, errorCB);
}



// Display each player's total
function displayPerHoleTotal(tx) {
	tx.executeSql('SELECT Name, SUM(Score) AS Total FROM Scorecard GROUP BY Name', [], function(tx, result) {
		displayTotal(result, '#perHoleTbl', '.playerLbl', '.totalLbl');
	}, errorCB);
}



// Find the appropriate player for each total
function displayTotal(qryResult, tableName, playerLbl, totalLbl) {	
	var rowIndex;
	var qryLength = qryResult.rows.length;

	// Get each player from the table
	var tblRows = $(tableName + ' tbody tr');
	var players = tblRows.find(playerLbl);
	var playerLength = players.length;

	for (var i=0; i < qryLength; ++i) {
		rowIndex = -1;

		for (var j=0; j < playerLength; ++j) {
			// Find the player's score
			if (players.eq(j).text() === qryResult.rows.item(i).Name) {
				rowIndex = j;
				break;
			}
		}

		// Display the player's score
		if (-1 != rowIndex) {
			tblRows.eq(rowIndex).find(totalLbl).text(qryResult.rows.item(i).Total);
		}
	}	
}



// Create a new, empty scorecard
function createNewScorecard(tx) {
	tx.executeSql('DROP TABLE IF EXISTS Scorecard', [], null, errorCB);
	tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (HoleID, Name))', [], null, errorCB);
}



// Initialize the new scorecard with default scores (zero)
function populateNewScorecard(tx) {
	for (var currentHole = getHoleID(selectedCourse, 1), maxHole = getHoleID(selectedCourse, 18);
			currentHole <= maxHole; ++currentHole) {
		$.each(playerNames, function(index, value){
			tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ('+currentHole+', "'+value+'", 0)', [], null, errorCB);
		});
	}
}



// Save the scores for the current hole of the scorecard
function saveCurrentHole(tx) {
	var holeID = getHoleID(selectedCourse, currentHole);
	
	$('#perHoleTbl tbody tr').each(function(index, value) {
		var name = $(this).find('.playerLbl').eq(0).text();
		var score = parseInt($(this).find('td input').eq(0).val());
		
		// Insert valid scores into the database
		if (!isNaN(score) && !(score < 0 || score > 7)) {
			tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ('+holeID+', "'+name+'", '+score+')', [], null, errorCB);
		}
	});
}



$('#holeInfo').click(function() {
	// Display the hole-in-one diagram
	var imgLocation = 'img/hole/' + getHoleID(selectedCourse, currentHole) + '.gif';
	$('#holeOverlayImg').html('<img src="'+ imgLocation +'"></img>');
	
	holeInOneVisible(true);
});



$('#holeOverlay').click(function(){
	// Close the hole-in-one diagram on click
	holeInOneVisible(false);
});



// Set the visibility of the hole-in-one diagram
function holeInOneVisible(diagramVisible) {
	if (diagramVisible) {
		$('#holeOverlay').show();
		$('#holeDiv').hide();
	} else {
		$('#holeOverlay').hide();
		$('#holeDiv').show();
	}
}



function updateLeaderboard(tx) {
	// Add each player to the leaderboard
	$('#perHoleTbl tbody tr').each(function(index, value) {
		var name = $(this).find('.playerLbl').eq(0).text();
		var total = parseInt($(this).find('.totalLbl').eq(0).text());
		
		tx.executeSql('INSERT INTO Leaderboard (Name, Course, Score) Values ("'+name+'", "'+selectedCourse.code+'",'+total+')');
	});
	
	// Keep only the high scores
	var limitQry = 'DELETE FROM Leaderboard WHERE RowID NOT IN '+
			'(SELECT * FROM (SELECT RowID FROM Leaderboard WHERE Course = "' + selectedCourse.code + '" ORDER BY Score ASC LIMIT 5) '+
			'UNION SELECT RowID FROM Leaderboard WHERE Course != "' + selectedCourse.code + '")';
	
	tx.executeSql(limitQry);
}



// Reset the leaderboard
$('#resetLeaderboardBtn').click(function() {
	// Confirm whether the user wants to clear the leaderboard
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



// Display the leaderboard for a course
function displayLeaderboardPage(tx) {
	tx.executeSql('SELECT Name, Score FROM Leaderboard WHERE Course = "'+ leaderboardCourse.code +'" ORDER BY Score', [],
		function(tx, result) {
			for (var i = 0, len = result.rows.length, prevScore = 0, place = 1, currentScore; i < len; ++i) {
		
				// Make placing correct (two players with the same score are placed the same)
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



$('#roundCompleteLeaderboardBtn').click(function(){
	// Display the players' place on the leaderboard
	leaderboardCourse = selectedCourse;
	window.location = '#leaderboardsPage';
	
	// Clear the table
	$('#leaderboardTbl tbody').empty();
	// Get the high scores from the database
	database.transaction(displayLeaderboardPage, errorCB); 
});



// Display the overview scorecard
$('#roundCompleteScorecardBtn').click(function(){
	currentNine = null;
	displayWholeCoursePage(1);
});



$('#fullScorecard').click(function(){
	var nine;
	if (currentHole <= 9) {
		// Display the front-nine
		nine = 1;
	} else {
		// Back-nine
		nine = 2;
	}
	displayWholeCoursePage(nine);
});



// Display the front-nine
$('#prevNine').click(function(){
	displayWholeCoursePage(1);
});



// Display the back-nine
$('#nextNine').click(function(){
	displayWholeCoursePage(2);
});



function displayWholeCoursePage(nine) {
	var lblTxt;
	if (1 === nine) {
		lblTxt = 'Front Nine';
	} else {
		lblTxt = 'Back Nine';
		nine = 2;
	}
	
	// Show the score for each hole per front/back-nine
	if (nine !== currentNine) {
		currentNine = nine;
		$('#nineLbl').text(lblTxt);
		
		$('#wholeCourseTbl thead').empty();
		$('#wholeCourseTbl tbody').empty();
	
		displayWholeCourseTable();
	}
}



function displayWholeCourseTable() {
	// Display the overview scorecard table's header
	var tblHead = '<tr><th>Name</th>';
	for (var i = (currentNine === 1 ? 1 : 10); i <= currentNine * 9; ++i) {
		tblHead += '<th>' + i + '</th>';
	}
	tblHead += '<th>Total</th></tr>';
	
	$('#wholeCourseTbl thead').append(tblHead);

	// Display the scores and totals for each player
	database.transaction(displayWholeCourseScores, errorCB, function(){
		database.transaction(displayWholeCourseTotals, errorCB);
	});
}



function displayWholeCourseScores(tx) {
	var qry;
	$.each(playerNames, function(index, value){
		// Retrieve all scores for the front/back-nine for each player in turn
		qry = 'SELECT Name, Score FROM Scorecard WHERE Name = "' + value + '" AND HoleID';
		
		if (1 === currentNine) {
			qry += ' <= ';
		} else {
			qry += ' > ';
		}
		qry += getHoleID(selectedCourse, 9) + ' ORDER BY HoleID ASC';
		
		tx.executeSql(qry, [], displayWholeCoursePlayerScore, errorCB);
	});
}



function displayWholeCoursePlayerScore(tx, result) {
	// Display the scores for a particular player
	var rowHTML = '<tr><td class="playerLbl">' + result.rows.item(0).Name + '</td>';
	
	for(var index = 0, length = result.rows.length; index < length;	++index) {
		rowHTML += '<td>' + result.rows.item(index).Score + '</td>';
	}
	
	// Create a field for the total
	rowHTML += '<td class="totalLbl"></td></tr>';
	
	$('#wholeCourseTbl tbody').append(rowHTML);
}



// Display the total for each player on the wholeCourse scorecard
function displayWholeCourseTotals(tx) {
	tx.executeSql('SELECT Name, SUM(Score) AS Total FROM Scorecard GROUP BY Name', [], function(tx, result){
		displayTotal(result, '#wholeCourseTbl', '.playerLbl', '.totalLbl');
	}, errorCB);
}



// Retrieve a course's details from its name
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



// Retrieve a courses details from a particular hole id
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
		console.log('Error processing SQL - Code: '+err.code);
	}
}