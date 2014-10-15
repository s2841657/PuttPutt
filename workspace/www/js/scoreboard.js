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
// This will hold a value 1 or 2 for front- and back-nine respectively
var currentNine;

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
	database = window.openDatabase('Database', '1.0', 'Putt Putt Scores', 200000);
	// Ensure the tables are available
	database.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS Leaderboard (Name TEXT, Course TEXT, Score INTEGER)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (HoleID INTEGER NOT NULL, Name TEXT NOT NULL, Score INTEGER, PRIMARY KEY (HoleID, Name))');
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



/*
	The leaderboard should be empty until a course is selected.
	The home button will clear it,
	and the end game screen will display the current course.
	Settings are the only other external link on or to this page.
*/
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
	if(!$('#perHoleTbl tbody tr').length) {
		window.location = '#homePage';
	}
	
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

function bleh(tx, result, words){alert(words);}

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
	$('#holeOverlayImg').html('<img src="'+ imgLocation +'"></img>');
	
	$('#crazyGolfLbl').text(getCrazyGolfText());
	
	holeInOneVisible(true);
});



$('#holeOverlay').click(function(){
	holeInOneVisible(false);
});



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



$('#prevNine').click(function(){
	displayWholeCoursePage(1);
});



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
	
	if (nine !== currentNine) {
		currentNine = nine;
		$('#nineLbl').text(lblTxt);
		displayWholeCourseTable();
	}
}



function displayWholeCourseTable() {
	$('#wholeCourseTbl tr').empty();
	
	var tblHead = '<tr><th>Name</th>'
	for (var i = (currentNine === 1 ? 1 : 10); i <= currentNine * 9; ++i) {
		tblHead += '<th>' + i + '</th>';
	}
	tblHead += '<th>Total</th></tr>';
	
	$('#wholeCourseTbl thead').append(tblHead);

	$.each(playerNames, function(index, value){
		
	});
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



function getCrazyGolfText() {
	var text;
	switch(currentHole) {
		case 1:
			text = "Play this hole right handed";
			break;
		case 2:
			text = "Use your right foot to putt the ball";
			break;
		case 3:
			text = "Putt facing backwards through your legs";
			break;
		case 4:
			text = "Putt one handed using only your right hand";
			break;
		case 5:
			text = "Play this hole like a snooker shot";
			break;
		case 6:
			text = "Play this hole left handed";
			break;
		case 7:
			text = "Pick up your ball and bowl your first shot";
			break;
		case 8:
			text = "Close your eyes for your first shot. Every miss counts!";
			break;
		case 9:
			text = "Play hockey, if your ball leaves your putter that is 1 shot";
			break;
		case 10:
			text = "Play this hole with your putter turned backwards";
			break;
		case 11:
			text = "Stand on 1 leg for all shots";
			break;
		case 12:
			text = "Your ball cannot stop rolling. Count 1 shot every hit";
			break;
		case 13:
			text = "Play this hole right handed";
			break;
		case 14:
			text = "Everyone putts their first shot then swap balls to continue playing this hole";
			break;
		case 15:
			text = "Make up your own (make sure it\'s crazy!)";
			break;
		case 16:
			text = "Each shot must rebound off a bump board (1 stroke penalty)";
			break;
		case 17:
			text = "Putt one handed using only your left hand";
			break;
		case 18:
			text = "Everyone putts their first shot. Closest ball to the hole without going in wins a special prize"
			break;
		default:
			text = "";
			break;
	}
	return text;
}



// Database transaction error callback
function errorCB(tx, err) {
	alert('Error processing SQL - Code: '+err.code);
	
	// If a console is available
	if (window.console && window.console.log) {
		// log the error to it
		console.log('Error processing SQL: '+err);
	}
}