var express = require('express');
var router = express.Router();
var crawl = require('./../models/crawl')
var flash = require('connect-flash'); //used to send temp messages between redirects

//call the crawler

router.get('/url', function(req, res) {
  //this function gets url to crawl from flash:
  url=JSON.stringify(req.flash('url'));
  console.log("CRAWL URL (GET):",url);
  crawlUrl(url, function(data){
    //once crawled, save data
    crawl.saveCrawl(data,function(result){
      res.json(result);
    });
  });
});

router.post('/url', function(req, res) {
  var url = req.body.url;
  console.log("CRAWL URL (POST):",url);

  crawlUrl(url, function(data){
    //once crawled, save data
    crawl.saveCrawl(data,function(result){
      res.json(result);
    });
  });
});


var crawlUrl = function(url, callback){
  //TO BE COMPLETED: dsottimano
  //crawl url
  var dummyData = {
    'title':'fake title',
    'meta_description': 'fake meta description' 
  };
  
  //after some delay, execute callback:
  callback(dummyData);
}

//function that saves the crawl data:
var saveCrawl = function(data, callback){
  crawl.saveCrawl(data,function(result){
    callback(result); 
  });
};


module.exports = router;
