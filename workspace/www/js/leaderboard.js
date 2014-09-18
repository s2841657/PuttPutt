var currentCourse;
var database;



$('#homeLeaderboardBtn').click(function(){
	if (!window.openDatabase) {
		alert ('Sorry, you don\'t have database support!');
		//return false;
	}
});



// Display the high scores for each course
$('.leaderboardBtn').click(function() {
	var temp;
	// When a new course is selected
	if (window.database && currentCourse !== (temp = courseNameToCode($(this).text())) && temp) {
		currentCourse = temp;
		// Clear the table
		$('#leaderboardTbl tbody').remove();
	
		// Try to display the high scores
		displayCourse();
	}
});



function displayCourse() {
	// Make sure there is a database object
	database = window.openDatabase('Scores', '1.0', 'Putt Putt Scores', 200000);
	// Get the high scores from the database
	database.transaction(getCourseScores, errorCB); 
}



function getCourseScores(tx) {
	tx.executeSql('SELECT (name, score) FROM leaderboard ORDER BY score', [], updateTable, errorCB);
}



function updateTable(tx, results) {
	$(results).each(function(index) {
		$('#leaderboardTbl tbody').append('<tr><td>' +
				index+1 +
				'</td><td>' +
				$(this).name +
				'</td><td>' +
				$(this).score +
				'</td></tr>');
	});
}



// We will ignore any errors and just leave the table blank
function errorCB(err) { }



function courseNameToCode(courseName) {
	var code;
	switch(courseName) {
		case 'Fun Run': code = 'funrun'; break;
		case 'Jungle Trail': code = 'jungletrail'; break;
		case 'Waterways Cove': code = 'waterwayscove'; break;
		default: code = null;
	}
	return code;
}
