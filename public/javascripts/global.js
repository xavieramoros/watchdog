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
  // Show task crawls.
  $('#taskList table tbody').on('click', 'td a.linkshowcrawls', populateCrawlsTable);
  
  /*$('.linkshowcrawls').click(function(event){
    refreshTask(event);
  });
  */
  //on('click', 'td a.linkshowcrawls', populateCrawlsTable);

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
  $.getJSON('/tasks/list', function(response) {
    data = response.data;
    if(data){
      // Stick our user data array into a tasklist variable in the global object
      taskListData = data;

      // For each item in our JSON, add a table row and cells to the content string
      $.each(data, function(){
        tableContent += '<tr>';
        tableContent += '<td><a href="#" class="linkrefreshtask glyphicon glyphicon-refresh" rel="' + this._id + '"></a></td>';            
        tableContent += '<td><a href="#" class="linkshowcrawls" rel="' + this.url + '">' + this.url + '</a></td>';
        tableContent += '<td> Every ' + this.crawl_frequency + ' day';
        tableContent += (this.crawl_frequency >1 ? "s":""); //add s if >1 days
        tableContent +='</td>';            
        tableContent += '<td>' + this.last_crawl + '</td>';            
        tableContent += '<td>' + this.status + '</td>';            
        tableContent += '<td><a href="#" class="linkdeletetask glyphicon glyphicon-remove" rel="' + this._id + '"></a></td>';
        tableContent += '</tr>';
      });
      // Inject the whole content string into our existing HTML table
      $('#taskList table tbody').html(tableContent);
    }

    //connect links
    $('#crawlList table tbody').on('click', 'td a.linkshowcrawls', populateCrawlsTable);

  });
};

//function that given a url, populates it's crawl data.
function populateCrawlsTable(event){  
  var url = $(this).attr('rel');

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.post('/crawls/list', {url:url},function(response) {
    data = response.data;
    if(data){
      // Stick our user data array into a tasklist variable in the global object
      //taskListData = data;
      crawlListData = data;

      // For each item in our JSON, add a table row and cells to the content string
      $.each(data, function(){
        tableContent += '<tr>';
        tableContent += '<td>'+this.crawl_date+'</td>';            
        tableContent += '<td>'+this.title+'</td>';
        tableContent += '<td>'+this.meta_description+'</td>';            
        tableContent += '</tr>';
      });
      // Inject the whole content string into our existing HTML table
      $('#crawlList table tbody').html(tableContent);
    }
  });

};


// Show User Info
/*
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
*/

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
    var dropdownText = $('.dropdown-toggle').text();
    var dropdownNumber;
    
    switch(dropdownText.trim()){
      case "Every day":
        dropdownNumber = 1;
        break;
      case "Every week":
        dropdownNumber = 7;
        break;
      case "Every month":
        dropdownNumber = 30;
        break;  
      default:
        dropdownNumber = 1;
    }

    // If it is, compile all user info into one object
    var url = $('#addTask form input#inputTaskUrl').val();
    //if url doesn't start by http, append
    if (!url.match(/^[a-zA-Z]+:\/\//))
    { 
      url = 'http://' + url;
    }

    var newTask = {
      'url': url,
      'crawl_frequency': dropdownNumber
    };    
    //FIXME add valid url check

    //check if valid url
    if(isUrlValid(url)){
      // Use AJAX to post the object to our adduser service
      $.ajax({
        type: 'POST',
        data: newTask,
        url: '/tasks/add',
        dataType: 'json'
      }).done(function(err,res) {
        // Check for successful (blank) response            
        if (err) {
          console.log(err);
          console.log(err.code);
          if(err.code === 'ENOTFOUND'){
            alert('That url seems unreachable');  
          }else{
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ',JSON.parse(err));  
          }
        }
        else{
          // Clear the form inputs
          $('#addTask form input').val('');
          // Update the table
          populateTasksTable();
        }
      });
    }else{
      alert('Please enter a valid url');
      return false;
    }
  }
  else {
    // If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};
//Refresh Task
function refreshTask(event){
  console.log("refreshTask...");
  event.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/tasks/refresh/' + $(this).attr('rel'),
    dataType:'json'
  }).done(function( response ) {
    //FIXME: check for errors

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
    }).done(function(response) {
      if(response.err){
        alert("There was an error:",response.err);
      }else{
        // Update the table
        populateTasksTable();  
      }  
    });
  }
  else {
    // If they said no to the confirm, do nothing
    return false;

  }

};

function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}


