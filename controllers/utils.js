var URL = require('url-parse');
var request = require("request");

/*Fucntion that given a url, returns it's status code*/
var checkUrlStatus = function(url, callback){
  console.log('CHECKING URL STATUS...');
  
  var task = new URL(url);

  var options = {
    url:url,
    method: 'GET', 
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  };

  request(options, function (error, response, body) {
    if (error){
      console.log("checkUrlStatus Error:",error);
      callback(error,null);
    }else{
      console.log("Status code:",response.statusCode);
      callback(null,response.statusCode);
    }
  });
}


module.exports = {
  checkUrlStatus:checkUrlStatus
};
