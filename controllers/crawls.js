var express = require('express');
var router = express.Router();
var crawl = require('./../models/crawl');
var utils = require('./utils');
var flash = require('connect-flash'); //used to send temp messages between redirects
var http = require('http');
var request = require("request");
var cheerio = require('cheerio');
var URL = require('url-parse');
const https = require('https');


//call the crawler
router.post('/new', function(req, res) {
  var url = req.body.url;
  console.log("NEW CRAWL url:",url);
  //check if url status is 200.
  utils.checkUrlStatus(url,function(err, statusCode){
    if(statusCode === 200){
      crawlUrl(url, function(err,data){ 
        res.json({err:null,data:data});
      });  
    }else{
      res.json({err:err,data:null});
    }
  })
});

// Function to save a crawl 
router.post('/save', function(req, res) {
  var url = req.body.url;
  var crawlData = req.body.data;
  console.log("SAVE CRAWL url:",url);

  console.log("crawlData to save:",crawlData);
  

  crawlData = {
   'title':crawlData.title,
   'meta_description':crawlData.meta_description,
   'h1':crawlData.headingOne,
   'robots':crawlData.robots,
   'canonical':crawlData.canonical,
   'mobile_alternate':crawlData.mobile_alternate,
   'keywords':crawlData.keywords,
   'amp_alternate':crawlData.amp_alternate
  };

/*'mobile_alternate':
     'keywords':
     'amp_alternate':*/

  console.log("SAVE CRAWL DATA:",crawlData);

  crawl.saveCrawl(url,crawlData,function(err, result){
    res.json({err:null,data:result});
  });
});

//list all crawl of a specific url
router.post('/list', function(req, res) {
  var url = req.body.url;
  console.log("LIST CRAWL DATA:",url);
  crawl.listCrawls(url, function(err,data){
    console.log(data);
    res.json({err:null,data:data});
  });
});

//Get previous crawl of a specific url. could be that there is only one saved (first time).
router.post('/last', function(req, res) {
  var url = req.body.url;
  console.log("GET PREVIOUS CRAWL DATA:",url);
  crawl.lastCrawl(url, function(err,data){
    if(err){
      console.log('err');
      res.json({err:err,data:null});  
    }else{
      console.log('data');
      res.json({err:null,data:data[0]});
    }
  });
});

//function that given a url get parses it's html
var crawlUrl = function(targetUrl,callback){
  //need to input the URL (task) to crawl
  console.log("CRAWL URL:",targetUrl);
  var task = new URL(targetUrl);
  var apikey = 'ed0940c1684860c3bdad3d2d2743c4f631d5fe59';
  
  var bodyParsed;
  var phantomJsCloudUrl = 'http://api.phantomjscloud.com/api/browser/v2/'+apikey;
  
  
  var body = {
    url:targetUrl,
    outputAsJson:false,
    renderType:'html'
  }
  
  /*
  var options = {
    url:phantomJsCloudUrl, 
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: body
  };
  
  console.log("options:",options);
  request(options,function(error, response, body) { 
  */

  url = 'http://api.phantomjscloud.com/api/browser/v2/'+apikey +'/?request='+encodeURIComponent(JSON.stringify(body));
  console.log('URL:',url); 
  request(url,function(error, response, body) {     
    if(body.statusCode && body.statusCode === '404'){
      callback(body.error,null);
    }else{
      bodyParsed = parseBody(body);
      console.log('BODY PARSED:',bodyParsed);
      callback(null,bodyParsed); 
    }
  });
}

var parseBody = function(body){
  console.log('PARSING BODY...');
  var arr = [];
  var $ = cheerio.load(body);
  var title = $("title").text();
  var description = $('meta[name=description]').attr("content");
  var robots = $('meta[name=robots]').attr("content");
  var headingOne = $('body > div.container.content > div.sidebar > div.autoselect-wrapper.npm-install.icon-download > p').html();
  var canonical = $('link[rel=canonical]').attr("href");
  var mobile_alternate = null;
  var keywords = null;
  var amp_alternate = null;     
  //arr.push(httpResponse,headingOne,title,description,robots,canonical);
  //arr.push(headingOne,title,description,robots,canonical);
  var dataParsed = {
    'h1':headingOne,
    'title':title,
    'meta_description':description,
    'robots':robots,
    'canonical':canonical,
    'mobile_alternate':mobile_alternate,
    'amp_alternate':amp_alternate,
    'keywords':keywords   
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
