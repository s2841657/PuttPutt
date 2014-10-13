/*var db;

document.addEventListener("deviceready", onDeviceReady, false);


// device APIs are available
function onDeviceReady() {
	db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
	alert('Database: ' + db);
	db.transaction(populateDB, errorCB, successCB);
	return false;
}


// Populate the database
function populateDB(tx) {
	alert('populateDB');
	tx.executeSql('DROP TABLE IF EXISTS Demo');
	tx.executeSql('CREATE TABLE IF NOT EXISTS Demo (ID INTEGER NOT NULL, Data TEXT)');
	tx.executeSql('INSERT INTO DEMO (ID, Data) VALUES (1, "hello")', []);
	tx.executeSql('INSERT INTO DEMO (ID, Data) VALUES (2, "goodbye")', []);
}


// Transaction success callback
function successCB() {
	alert('populateDB success!');
	db.transaction(queryDB, errorCB);
}


// Query the database
function queryDB(tx) {
	tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}


// Query the success callback
function querySuccess(tx, results) {
	var htmlString = '';
	var len = results.rows.length;
	alert("No of rows in the table " + len);
	
	
	for(var i=0; i<len; i++) {
		htmlString += 'ID: ' + results.rows.item(i).ID + '\t Name: ' + results.rows.item(i).Data + '\n';
	}
	
	alert(htmlString);
}


// Transaction error callback
function errorCB(err) {
	console.log("Error processing SQL: "+err.code);
}

*/
// A list of courses
var COURSES = {
	FUNRUN : { value:100, name:'Fun Run', code:'FunRun' },
	JUNGLETRAIL : { value:200, name:'Jungle Trail', code:'JungleTrail' },
	WATERWAYSCOVE : { value: 300, name:'Waterways Cove', code:'WaterwaysCove' }
};
// The course which is being played (eg: COURSES.FUNRUN)
var selectedCourse;

var debug = 0;

var currentHole;
// This is the unique id of each hole
function getHoleID(course, hole) {
	return parseInt(course.value + hole);
}

// Whether a score has been edited (and needs saving)
var wasEdited;

// This will hold the database
var database;
document.addEventListener('deviceready', onDeviceReady, false);


// device APIs are available
function onDeviceReady() {
	//alert('onDeviceReady');
	database = window.openDatabase('Scorecard', '1.0', 'Putt Putt Scores', 200000);
	// alert(''+database);
	return false;
}

$('#homePlayBtn').click(function() {
	// if (window.openDatabase) {
	// 	// Load an existing game
	// 	database.transaction(inProgressQuery, null,errorCB);
	// } else {
	// 	alert ('Sorry, you don\'t have database support!');
	// 	return false;
	// }
});



// Check whether a game is already in progress
function inProgressQuery(tx) {
	//alert('inProgressQuery');
	tx.executeSql('SELECT HoleID FROM Scorecard', null, null, errorCB);//, [], promptToContinue, errorCB);
	//alert('after inProgressQuery');
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
		database.transaction(createNewScorecard, errorCB, function(){
			//alert("finished creating scoreboard");
			wasEdited = false;
			updatePerHolePage(1);
		});
		//alert('after setupPlayBtn');
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
		//alert('updatePerHolePage > wasEdited');
		database.transaction(saveCurrentHole, errorCB, function(){
			wasEdited = false;
			currentHole = hole;
			displayCurrentHole();
		});
		return;
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
	// alert('displayPerHoleScores current_hole:' + currentHole);
		var current_hole = getHoleID(selectedCourse, currentHole);
		//alert("Current hole " + current_hole);
		tx.executeSql('SELECT Name, Score, HoleID FROM Scorecard WHERE HoleID='+current_hole, [],
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
					if(debug == 1) alert("The score for " + results.rows.item(i).Name + " is " + results.rows.item(i).Score);
		        }				

			}, function(){alert("error?")});
	
	// alert('after displayPerHoleScores');
}



function createNewScorecard(tx) {
	if(debug == 1) alert('createNewScorecard');
	tx.executeSql('DROP TABLE IF EXISTS Scorecard',[], null,errorCB);
	tx.executeSql('CREATE TABLE IF NOT EXISTS Scorecard (id INTEGER PRIMARY KEY AUTOINCREMENT, HoleID INTEGER, Name TEXT NOT NULL, Score INTEGER)',[], null,errorCB);
}



function saveCurrentHole(tx) {
	if(debug == 1) alert('saveCurrentHole');
	var holeID = getHoleID(selectedCourse, currentHole);
	$('#perHoleTbl tbody tr').each(function(index, value) {
		if(debug == 1) alert('inEach');
		var c_hole = holeID;
		// var c_name = value[0].text();
		// var c_score = value[1].val();
		var c_name = $(this).find("td").eq(0).text();
		var c_score = parseInt($(this).find("td").eq(1).find("input").val());
		// alert($(this).find("td").eq(1).text());
		// tx.executeSql('SELECT Name, Score, HoleID FROM Scorecard WHERE HoleID=101', [], function(){alert("FUCK YOU CUNT")}, errorCB);
		// alert('INSERT INTO Scorecard (HoleID, Name, Score) VALUES ('+holeID+', "'+value[0].text()+'", '+value[1].val()+')');
		if(debug == 1) alert('INSERT INTO Scorecard (HoleID, Name, Score) VALUES ('+c_hole+', "'+c_name+'", '+c_score+')');
		tx.executeSql('INSERT OR REPLACE INTO Scorecard (HoleID, Name, Score) VALUES ('+c_hole+', "'+c_name+'", '+c_score+')', [], 
			function() { if(debug==1) alert('saveSuccessful');  }, function(){alert("Error on insert")});
		// tx.executeSql('INSERT INTO Scorecard (HoleID, Name, Score) VALUES (102, "ok", 120)', [], 
		// 	function() { alert('saveSuccessful');  }, function(){alert("Error on insert")});	
	});
	return;
}



function updateLeaderboard() {
	
}



$('#holeInfo').click(function() {
	var imgLocation = 'img/hole/test.gif';// + getHoleID(selectedCourse, currentHole) + '.gif';
	
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
		alert('Error processing SQL: '+err.code);
	// If a console is available
	if (window.console && window.console.log) {
		// log the error to it
		console.log('Error processing SQL: '+err);
	} else {
		alert('Error processing SQL: '+err);
	}
}
