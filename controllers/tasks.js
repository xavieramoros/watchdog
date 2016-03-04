var express = require('express');
var task = require('./../models/task')
var crawl = require('./../models/crawl')
var crawls = require('./../controllers/crawls')
var router = express.Router();
var request = require('request');

var configuration = require('./../config')
conf = configuration.config();
var mongoConnectionString = "mongodb://"+conf.mongoHost+"/watchdog";
var Agenda = require('agenda');
var agenda = new Agenda({db: {address: mongoConnectionString, collection: "agendacollection"}});


/* GET list of urls. */
router.get('/list', function(req, res, next) {  
  console.log("LIST ALL TASK. ");
  task.listTasks(function(err,data){
    if(err) res.json({err:err,data:null});
    console.log(data);
    res.json({err:null,data:data});
  })
}); 

/* POST to Add Task Service */
router.post('/add', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    console.log("ADD TASK: ",req.body);

    var url = req.body.url;
    var crawl_frequency = req.body.crawl_frequency;

    task.addTask(url,crawl_frequency,function(err,data){
      agendaName = 'crawl url '+url;
      console.log("Task added! Setting agenda...",agendaName);      
      
      //set crawl agenda
      agenda.define(agendaName, function(job, done) { 
        //refresh task
        refreshTask(data.id,function(err,result){
          console.log("END OF TASK REFRESH");
          done();
        });
      });

      agenda.on('ready', function() {
        agenda.every('30 seconds', agendaName); 
        //FIXME: here you can add timezone: 'America/New_York', see doc.
        agenda.start();
      });
      
      refreshTask(data.id,function(err,result){
        console.log("END OF TASK REFRESH");
        if(err) res.json({err:err,data:null});
        res.json({err:null,data:''});
      })
      
    })
  
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
  console.log("REFRESH TASK: ");
  //console.log("req.params:",req.params);

  var id = req.params.id;
  refreshTask(id,function(err,result){
    if(err) res.json({err:err,data:null});
    res.json({err:null,data:result});
  })
});

var refreshTask = function(id,callback){
  console.log("RefreshTask...");
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
        console.log(response.body);
        //save crawl
        request.post(conf.host+'/crawls/save',{form:{url:url,data:response.body}},function(err, response, body){
          //update crawl date        
          task.updateTaskDate(id,function(err,res){
            (err === null) ? callback(null,res):callback(err,null);
          });
        });
      });
    };
  });
}

module.exports = router;
