var express = require('express');
var task = require('./../models/task')
var crawl = require('./../models/crawl')
var crawls = require('./../controllers/crawls')
var router = express.Router();
var request = require('request');
var async = require('async');
var utils = require('./utils');
var dateFormat = require('dateformat'); 

/* GET list of urls. */
router.get('/list', function(req, res, next) {  
  console.log("LIST ALL TASK. ");
  task.listTasks(function(err,data){
    if(err) res.json({err:err,data:null});
    //change date format.
    console.log(data);

    async.forEachOf(data, function(item, key, callback){
      if(item.last_crawl !== ' '){
        date = new Date(item.last_crawl);
        //FIXME: show year if it's a different year.
        var sameYear = true;
        if(sameYear){
          data[key].last_crawl = dateFormat(date,"ddd, mmmm dS, h:MM TT");  
        }else{
          data[key].last_crawl = dateFormat(date,"ddd, mmmm dS, yyyy, h:MM TT");  
        }
      };
      callback();
    },function(err){
      console.log(data);
      if (err) console.error(err.message);
      res.json({err:null,data:data});
    });
  })
}); 

/* POST to Add Task Service */
router.post('/add', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    console.log("ADD TASK: ",req.body);

    var url = req.body.url;
    var crawl_frequency = req.body.crawl_frequency;
    var status = {all:'ok'};

    //check first if url exists.
    utils.checkUrlStatus(url,function(err, statusCode){  
      if(statusCode === 200){
        task.addTask(url,crawl_frequency,function(err,data){
          agendaName = 'crawl url '+url;
          console.log("Task added! Setting agenda...",agendaName);      
          
          //FIXME check first if here is already one agenda like that
          /*
          if(agenda already exists){
            //delete it
            //create again
          }else create 

          */
          //set crawl agenda
          agenda.define(agendaName, function(job, done) { 
            //refresh task
            refreshTask(data.id,function(err,result){
              console.log("END OF TASK REFRESH");
              done(); //to unlock the agenda job = the job is done
            });
          });

          //agenda.on('ready', function() {
          agenda.every('30 seconds', agendaName); 
            //FIXME: here you can add timezone: 'America/New_York', see doc.
          //});
          
          res.json({err:null,data:''});
          })
      }else{
        res.json({err:err,data:null});
      }
    });
  
});

/* POST to Delete Task Service */
router.delete('/delete/:id', function(req, res) {
  var id = req.params.id;
  console.log("DELETE TASK: ");
  //get task url
  task.getTaskUrl(id,function(e,url){
    //once we have url, trigger crawl
    if(e){
      res.json({err:'There was an error',data:null});
    }else{
      //delete task from db
      task.deleteTask(req.params.id,function(result){
        //remove agenda job
        agenda.cancel({name: 'crawl url '+url}, function(err, numRemoved) {
          res.json({err:null,data:result});
        });
      });
    };
  });
});

/* POST to refresh Task Service */
router.post('/refresh/:id', function(req, res) {
  console.log("REFRESH TASK");
  var id = req.params.id;
  refreshTask(id,function(err,result){
    if(err){
      res.json({err:err,data:null});
    }else{
      res.json({err:null,data:result});  
    }
  })
});

//function that do a crawl and then saves it and updates the status.
var refreshTask = function(id,callback){
  //get task url, crawl it and save it.
  task.getTaskUrl(id,function(e,url){
    //once we have url, trigger crawl
    if(e){
      console.log("Error:",e);
      res.json({err:e,data:null});
    }else{
      console.log("Crawling url:",url);
      //req.flash('url', url);//using session flash message to pass url.      
      //res.redirect('/crawls/url');
      //other way to do it instead of res.redirect('/crawls/url');
      request.post(conf.host+'/crawls/new',{form:{url:url}},function(err, response, body){
        if(err){
          //there was an error crawling
          console.log("There was an error:",err);
          callback(err,null);
        }else{
          bodyParsed = JSON.parse(body);
          newCrawlData = bodyParsed.data;
          async.series([
            //1-get previous crawl and compare to get task status
            function(callback){
              var body = {
                url:url,
                data:newCrawlData
              }
  
              var options = {
                url:conf.host+'/crawls/last', 
                method: "POST",
                json: true,
                body: body
              };

              request(options,function(err, response, body){
                //call update status with oldCrawlData and newCrawlData.   
                console.log('/crawls/last done!');

                if(response){  
                  console.log("body",body);
                  if(body.data){
                    console.log("bodyParsed.data",body.data);
                    oldCrawlData = body.data;
                    updateStatus(id,newCrawlData,oldCrawlData,callback);  
                  }else{
                    callback(body.err,null);
                  }
                }else{
                  callback("No response from /crawls/last",null);
                }
              });
            },
            //2-save current crawlasync.parallel([
            function(callback){
              console.log('Then /crawls/save');
              console.log('newCrawlData:',newCrawlData);

              var body = {
                url:url,
                data:newCrawlData
              }
  
              var options = {
                url:conf.host+'/crawls/save', 
                method: "POST",
                json: true,
                body: body
              };

              request(options,function(err, response, body){
                //update crawl date        
                task.updateTaskDate(id,function(err,res){
                  (err === null) ? callback(null,res):callback(err,null);
                });
              });
            }
          ], function(err, results){
            console.log("Both async seris finished, results:",results);
            callback(err,results);
          });
        }
      });
    };
  });
}

var updateStatus = function(id,newCrawlData,oldCrawlData,callback){
  console.log('UPDATE STATUS...');
  console.log('oldCrawlData:',oldCrawlData);
  statusObject = {};
  for (var key in newCrawlData) {
    console.log("key:",key);
    if (newCrawlData.hasOwnProperty(key)) { //to make sure that the key you get is an actual property of an object, and doesn't come from the prototype
      //if old array has this property and it changed:
      var tempKey = key;
      //FIXME: use here libraries to compare strings
      if(oldCrawlData.hasOwnProperty(key) && newCrawlData[key]!==oldCrawlData[key]){

        //update status object
        var alert_level; //ok, low, medium, high
        var message;
        switch(key){
          case 'title':
            alert_level = 'low';
            message = 'Title has changed from <br><b>'+oldCrawlData[key]+'</b><br> to <br><b>'+newCrawlData[key]+'</b>';
            break;
          case 'meta_description':
            alert_level = 'low';
            message = 'Meta description has changed from <br><b>'+oldCrawlData[key]+'</b><br> to <br><b>'+newCrawlData[key]+'</b>';
            break;
          case 'h1':
            alert_level = 'medium';
            message = 'H1 has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';            
            break;
          case 'robots':
            alert_level = 'high';  
            message = 'Robots has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';                          
            break;
          case 'canonical':
            alert_level = 'high'; 
            message = 'Canonical has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';                                         
            break;
          case 'mobile_alternate':
            alert_level = 'high';    
            message = 'Mobile Alternate has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';                                      
            break;
          case 'keywords':
            alert_level = 'low';    
            message = 'Keywords has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';                                      
            break;
          case 'amp_alternate':      
            alert_level = 'high';  
            message = 'Amp Alernate has changed from <br><b>'+oldCrawlData[key]+'</b><br>to <br><b>'+newCrawlData[key]+'</b>';                                      
            break;
        };
        statusObject[key]={
          alert_level: alert_level,
          old_value: oldCrawlData[key],
          new_value: newCrawlData[key],
          message:message
        };
      }
    }
  }//end of loop through newCrawlData properties.
  //save statusObject.
  task.saveStatus(id,statusObject,function(err,res){
    callback();  
  })
  //save status
}

var updateStatusObject = function(){}

module.exports = router;
