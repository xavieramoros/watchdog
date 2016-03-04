//MongoDB settings:
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/watchdog');

/*Add task to taskcollection*/

var saveCrawl = function(url,data,callback){
  var crawlcollection = db.get('crawlcollection');

  // Submit to the DB
  crawlcollection.insert({
      "url": url,
      "title" : data.title,
      "meta_description": data.meta_description,
      "crawl_date": new Date(),
  }, function (err, doc) {
    result = (err === null) ? { msg: '' } : { msg:'error: ' + err };
    callback(null, result);
  });
}

var listCrawls = function(url, callback){
  var crawlcollection = db.get('crawlcollection');
  //{sort:}
  crawlcollection.find({url:url},{crawl_date:'desc'},function(err,docs){
    if(err) throw err;
    (err === null) ? callback(null,docs) : callback(err,null);
  });
}


module.exports = {
  saveCrawl:saveCrawl,
  listCrawls:listCrawls
}