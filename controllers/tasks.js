var express = require('express');
var task = require('./../models/task')
var crawl = require('./../models/crawl')
var crawls = require('./../controllers/crawls')
var router = express.Router();


/* GET list of urls. */
router.get('/list', function(req, res, next) {  
  console.log("LIST ALL TASK. ");
  task.listTasks(function(data){
    res.json(data);
  })
}); 

/* POST to Add Task Service */
router.post('/add', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    console.log("ADD TASK: ",req.body);

    var url = req.body.url;
    var crawl_frequency = req.body.crawl_frequency;

    task.addTask(url,crawl_frequency,function(result){
      console.log("ADD TASK DONE:",result);
      res.json(result);
    })
});

/* POST to Delete Task Service */
router.delete('/delete/:id', function(req, res) {
  console.log("DELETE TASK: ");
  task.deleteTask(req.params.id,function(result){
    res.json(result);
  });
});

/* POST to refresh Task Service */
router.post('/refresh/:id', function(req, res) {
  console.log("REFRESH TASK: ");
  //console.log("req.params:",req.params);

  //get task url
  task.getTargetUrl(req.params.id,function(e,url){
    //once we have url, trigger crawl
    if(e){
      console.log("Error:",e);
      res.json();
    }else{
      console.log("Crawling url:",url);
      req.flash('url', url);//using session flash message to pass url.      
      res.redirect('/crawls/url');
    }
  });
});


module.exports = router;
