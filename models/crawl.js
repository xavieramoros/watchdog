//MongoDB settings:
var mongo = require('mongodb');
var monk = require('monk');
var configuration = require('./../config')
conf = configuration.config();

var db = monk(conf.mongoHost+":"+conf.mongoPort+"/"+conf.mongoDb);

/*Add task to taskcollection*/

var saveCrawl = function(url,data,callback){
  var crawlcollection = db.get('crawlcollection');

  // Submit to the DB
  crawlcollection.insert({
      "url": url,
      "title" : data.title,
      "meta_description": data.meta_description,
     "h1":data.h1,
     "robots":data.robots,
     "canonical":data.canonical,
     "mobile_alternate":data.mobile_alternate,
     "keywords":data.keywords,
     "amp_alternate":data.amp_alternate,
      "crawl_date": new Date(),
  }, function (err, doc) {
    result = (err === null) ? { msg: '' } : { msg:'error: ' + err };
    callback(null, result);
  });
}

//function to retrieved the previously saved crawl.
var lastCrawl = function(url, callback){
  var crawlcollection = db.get('crawlcollection');
  //{sort:}
  crawlcollection.find({url:url},{sort:{crawl_date:-1},limit:1},function(err,docs){
    if(err) callback(err,null);
    if(err) throw err;
    (err === null) ? callback(null,docs) : callback(err,null);
  });
}

var listCrawls = function(url,callback){
  var crawlcollection = db.get('crawlcollection');
  crawlcollection.find({url:url},{crawl_date:'desc'},function(err,docs){
    if(err) throw err;
    (err === null) ? callback(null,docs) : callback(err,null);
  });

}

module.exports = {
  saveCrawl:saveCrawl,
  listCrawls:listCrawls,
  lastCrawl:lastCrawl
}