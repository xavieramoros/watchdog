var express = require('express');
var task = require('./../models/task')
var crawl = require('./../models/crawl')
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

/* POST to Refresh Task Service */
router.post('/refresh/:id', function(req, res) {
  console.log("REFRESH TASK: ",req.params.id);


  url = "www.vocativ.com/tech";//FIXME
  res.redirect('/crawl/?'+url);
  /*
  //get task url
  task.getTargetUrl(req.params.id,function(e,url){
    //once we have url, trigger crawl
    if(e) console.log("Error:",e);
    console.log("Crawling url:",url);
    res.redirect('/crawl/:'+url);
  });
  */
});


module.exports = router;
