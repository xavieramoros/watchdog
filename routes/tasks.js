var express = require('express');
var task = require('./../models/task')
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
  console.log(req.body);  
  task.deleteTask(req.params.id,function(result){
    res.json(result);
  });
});

module.exports = router;
