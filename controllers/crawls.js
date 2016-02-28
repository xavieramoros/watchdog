var express = require('express');
var router = express.Router();
var crawl = require('./../models/crawl')

//call the crawler
router.post('/crawl/:url', function(req, res) {
  console.log("CRAWL URL: url");

  var url = req.body.url;

  crawlUrl(url, function(data){
    //once crawled, save data
    crawl.saveCrawl(data);
  });
});

var crawlUrl = function(url, callback){
  //TO BE COMPLETED
  //crawl url
  var dummyData = {
    'title':'fake title',
    'meta_description': 'fake meta description' 
  }
  
  //after some delay, execute callback:
  callback(dummyData);
}

module.exports = router;