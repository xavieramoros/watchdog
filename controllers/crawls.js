var express = require('express');
var router = express.Router();
var crawl = require('./../models/crawl')
var flash = require('connect-flash'); //used to send temp messages between redirects
var http = require('http');
var request = require("request");
var cheerio = require('cheerio');
var URL = require('url-parse');
const https = require('https');


//call the crawler
/*
router.get('/new', function(req, res) {
  //this function gets url to crawl from flash:
  url=JSON.stringify(req.flash('url'));
  console.log("NEW CRAWL URL (GET):",url);
  crawlUrl(url, function(data){
    //once crawled, save data
    crawl.saveCrawl(data,function(result){
      res.json(result);
    });
  });
});
*/

router.post('/new', function(req, res) {
  var url = req.body.url;
  console.log("NEW CRAWL URL (POST):",url);

  crawlUrl(url, function(data){
    res.json(data);
  });
});


// Function to save a crawl 
router.post('/save', function(req, res) {
  var url = req.body.url;
  var crawlData = req.body.data;

  console.log("SAVE CRAWL DATA:",crawlData);

  crawl.saveCrawl(url,crawlData,function(result){
    res.json(result);
  });
});

//function that given a url get parses it's html
var crawlUrl = function(targetUrl, callback){
  //need to input the URL (task) to crawl
  console.log("CRAWL URL");
  var targetUrl = 'https://www.npmjs.com/package/scrape-js';
  var task = new URL(targetUrl);
  var apikey = 'ed0940c1684860c3bdad3d2d2743c4f631d5fe59';
  var url = 'http://api.phantomjscloud.com/single/browser/v1/'+apikey+'/?targetContent=&requestType=raw&targetUrl='+targetUrl+'+&resourceUrlBlacklist=[]&loadImages=checked';
  //var url = 'http://api.phantomjscloud.com/single/browser/v2/'+apikey+'/?targetContent=&requestType=raw&targetUrl='+targetUrl+'+&resourceUrlBlacklist=[]&loadImages=checked';

  var bodyParsed;

  request(url, function(error, response, body) { 
    bodyParsed = parseBody(body);
    console.log('BODY PARSED:',bodyParsed);

    //req.end();
    callback(null,bodyParsed);
  });
}

var parseBody = function(body){
  console.log('PARSING BODY');
  var arr = [];
  var $ = cheerio.load(body);
  var title = $("title").text();
  var description = $('meta[name=description]').attr("content");
  var robots = $('meta[name=robots]').attr("content");
  var headingOne = $('body > div.container.content > div.sidebar > div.autoselect-wrapper.npm-install.icon-download > p').html();
  var canonical = $('link[rel=canonical]').attr("href");
  //arr.push(httpResponse,headingOne,title,description,robots,canonical);
  //arr.push(headingOne,title,description,robots,canonical);
  var dataParsed = {
    'h1':headingOne,
    'title':title,
    'meta_description':description,
    'robots':robots,
    'canonical':canonical    
  };

  return dataParsed;
}

/*
var processResponse = function(url, res, callback){
  console.log("Process response. Res:",res);   
  var httpResponse = res.statusCode;    
  console.log(httpResponse);    
  request(url, function(error, response, body) {  
    var bodyParsed = parseBody(body);
    //req.end();
    console.log('BODY PARSED:',bodyParsed);
    callback(null,bodyParsed);
  });
}
*/

var validateURL = function(url, callback){
  var address = new URL(url);
  var newPort;

  var keys = 
  {
    "method" : "GET",
    "port" : newPort,
    "hostname" : address.hostname,
    "path" : address.pathname,
    "user-agent" : "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  };

  if (address.protocol == 'https:') {
    newPort = '443';
  } else {
    newPort = '80';
  };
  var req = http.request(keys, function(res) {
    console.log(res.statusCode);
    if (res.statusCode != 200) {
      console.log('sorry, we can\'t accept URLs that do not 200');
    }
  });

  req.on('error', function(err) {
    throw ('Not a valid URL');  
  });
  callback(null,'');
}

module.exports = router;
