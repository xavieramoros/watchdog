// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the user table on initial page load
  populateTasksTable();

  // Add Tasl button click
  $('#btnAddTask').on('click', addTask);
  $('#taskList table tbody').on('click', 'td a.linkdeletetask', deleteTask);
  $('#taskList table tbody').on('click', 'td a.linkrefreshtask', refreshTask);    
  /*
  // Show task details.
  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
  */

  $(".dropdown-menu li a").click(function(){
    var selText = $(this).text();
    $(this).parents('.dropdown').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
  });



});

// Functions =============================================================

// Fill table with data
function populateTasksTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/tasks/list', function( data ) {

    // Stick our user data array into a tasklist variable in the global object
    taskListData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkrefreshtask glyphicon glyphicon-refresh" rel="' + this._id + '"></a></td>';            
      tableContent += '<td><a href="#" class="    " rel="' + this.url + '">' + this.url + '</a></td>';
      tableContent += '<td> Every ' + this.crawl_frequency + 'day</td>';            
      tableContent += '<td> Last crawl: ' + this.last_crawl + '</td>';            
      tableContent += '<td><a href="#" class="linkdeletetask glyphicon glyphicon-remove" rel="' + this._id + '"></a></td>';
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#taskList table tbody').html(tableContent);
  });
};

// Show User Info
function showTaskInfo(event) {

  // Prevent Link from Firing
  event.preventDefault();

  // Retrieve username from link rel attribute
  var thisUrl = $(this).attr('rel');

  // Get Index of object based on id value
  var arrayPosition = taskListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

  // Get our User Object
  var thisTaskObject = taskListData[arrayPosition];

  //Populate Info Box
  $('#urlUrl').text("Url test");//(thisTaskObject.fullname);
  $('#urlTitle').text("Title test");//(thisTaskObject.age);
  $('#urlLastCrawl').text("Last crawl test");//(thisTaskObject.gender);
}

// Add Task
function addTask(event) {
  event.preventDefault();

  // Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#addTask input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });

  // Check and make sure errorCount's still at zero
  if(errorCount === 0) {

    // If it is, compile all user info into one object
    var newTask = {
      'url': $('#addTask form input#inputTaskUrl').val(),
      'crawl_frequency': $('#addTask form input#inputTaskCrawlFrequency').val(),
       }    

    // Use AJAX to post the object to our adduser service
    $.ajax({
      type: 'POST',
      data: newTask,
      url: '/tasks/add',
      dataType: 'json'
    }).done(function(response) {
      // Check for successful (blank) response            
      if (response.msg === '') {
        // Clear the form inputs
        $('#addTask form input').val('');
        // Update the table
        populateTasksTable();
      }
      else {
        // If something goes wrong, alert the error message that our service returned
        alert('Error: ' + response.msg);
      }
    });
  }
  else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};
//Refresh Task
function refreshTask(event){
  event.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/tasks/refresh/' + $(this).attr('rel')
  }).done(function( response ) {
    // Check for a successful (blank) response
    console.log("&&&&&&BACK:",response);
    if (response.msg !== '') alert('Error: ' + response.msg);
    // Update the table
    populateTasksTable();
  });
};


// Delete Task
function deleteTask(event) {

  event.preventDefault();
  // Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this task?');

  // Check and make sure the user confirmed
  if (confirmation === true) {
    
    // If they did, do our delete
    $.ajax({
      type: 'DELETE',
      url: '/tasks/delete/' + $(this).attr('rel')
    }).done(function( response ) {

      // Check for a successful (blank) response
      if (response.msg === '') {
      }
      else {
        alert('Error: ' + response.msg);
      }
      // Update the table
      populateTasksTable();
    });
  }
  else {
    // If they said no to the confirm, do nothing
    return false;

  }

};

