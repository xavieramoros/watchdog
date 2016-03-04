
//MongoDB settings:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/watchdog');
var debug = require('debug')('monk')

/*Function that adds task to taskcollection
Returns data: id if success and url
*/
var addTask = function(url,freq,callback){
  var taskcollection = db.get('taskcollection');  
  // Submit to the DB
  taskcollection.insert({
      "url" : url,
      "crawl_frequency": freq,
      "last_crawl": " "
  }, function (err, doc) {
    if(err) throw err;
    var data = {
      id:doc._id,
      url:url
    };
    (err === null) ? callback(null,data) : callback(err,null);
  });
}

/*Function that lists all the tasks
* @return {docs}: Document retrieved with all the tasks.
*/
var listTasks = function(callback){
  var taskcollection = db.get('taskcollection');
  taskcollection.find({},{},function(err,docs){
    if(err) throw err;
    (err === null) ? callback(null,docs) : callback(err,null);
  });
}

/*Delete a specific task*/
var deleteTask = function(id,callback){
  var taskcollection = db.get('taskcollection');
  var taskToDelete = id;
  taskcollection.remove({ '_id' : taskToDelete }, function(err,docs) {
    (err === null) ? callback(null,docs) : callback(err,null);
  });
}

var updateTaskDate = function(id, callback){
  var taskcollection = db.get('taskcollection');
  // Submit to the DB
  var current_date = new Date();
  taskcollection.findAndModify(
    { "_id": id },
    { "$set": { "last_crawl": current_date}}, 
    function (err, doc) {
      (err === null) ? callback(null,doc):callback(err,null);
  });
        /*
  taskcollection.findAndModify({'_id':id},
    {"$set:":{
      "last_crawl": new Date()}
    }, 
    function (err, doc) {
      (err === null) ? callback(null,doc):callback(err,null);
  });*/

}

/*Function that give a task id returns it's url. */
var getTaskUrl = function(id,callback){
  var taskcollection = db.get('taskcollection');
  var targetTask = id;
  console.log(targetTask);
  taskcollection.find({ '_id' : targetTask }, {}, function(err, docs) {
    if(err){
      callback(err,null)
    } 
    else{
      var url = docs[0].url;
      console.log("Task has URL:",url);
      callback(null,url);
    }
  });
}

module.exports = {
  addTask:addTask,
  listTasks:listTasks,
  deleteTask:deleteTask,
  getTaskUrl:getTaskUrl,
  updateTaskDate:updateTaskDate
};
