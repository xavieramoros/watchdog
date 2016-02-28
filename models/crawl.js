//MongoDB settings:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/watchdog');

/*Add task to taskcollection*/

var saveCrawl = function(data,callback){
  var crawlcollection = db.get('crawlcollection');

  // Submit to the DB
  crawlcollection.insert({
      "title" : data.title,
      "meta_description": data.meta_description,
      "crawl_date": new Date(),
  }, function (err, doc) {
    result = (err === null) ? { msg: '' } : { msg:'error: ' + err };
    callback(result)
  });
}

module.exports = {
  saveCrawl:saveCrawl
}