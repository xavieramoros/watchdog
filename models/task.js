
//MongoDB settings:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/watchdog');

/*Add task to taskcollection*/

var addTask = function(url,freq,callback){
  // Set our internal DB variable
  // Set our collection
  var taskcollection = db.get('taskcollection');

  // Submit to the DB
  taskcollection.insert({
      "url" : url,
      "crawl_frequency": freq,
      "last_crawl": ""
  }, function (err, doc) {
    result = (err === null) ? { msg: '' } : { msg:'error: ' + err };
    callback(result)
  });
}

/*Function that lists all the tasks*/
var listTasks = function(callback){
  var taskcollection = db.get('taskcollection');
  taskcollection.find({},{},function(e,docs){
    if(e) console.log("ERROR:",e);
    callback(docs);      
  });
}

/*Delete a specific task*/
var deleteTask = function(id,callback){
  var taskcollection = db.get('taskcollection');
  var taskToDelete = id;
  taskcollection.remove({ '_id' : taskToDelete }, function(err) {
    result = (err === null) ? { msg: '' } : { msg:'error: ' + err };
    callback(result);
  });
}

var getTargetUrl = function(id,callback){
  var taskcollection = db.get('taskcollection');
  console.log("In getTargetUrl...");
  var targetTask = id;
  taskcollection.find({ '_id' : targetTask  }, {}, function(err, docs) {
    if(err){
      callback(err,null);
    }else{
      callback(null,docs[0].url);
    } 
  });
}

module.exports = {
  addTask:addTask,
  listTasks:listTasks,
  deleteTask:deleteTask,
  getTargetUrl:getTargetUrl
};
