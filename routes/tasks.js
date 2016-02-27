var express = require('express');
var router = express.Router();


/* GET list of urls. */
router.get('/list', function(req, res, next) {
  var db = req.db;  
  var taskcollection = db.get('taskcollection');
  taskcollection.find({},{},function(e,docs){
      if(e) console.log("ERROR:",e);
      
      //return json.
      res.json(docs);

      /*
      res.render('tasks', {
          "taskList" : docs
      });
      */
  });
}); 

/* POST to Add Task Service */
router.post('/add', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    console.log("ADD TASK: ");
    console.log(req.body);  

    var url = req.body.url;
    var crawl_frequency = req.body.crawl_frequency;

    // Set our collection
    var taskcollection = db.get('taskcollection');

    // Submit to the DB
    taskcollection.insert({
        "url" : url,
        "crawl_frequency": crawl_frequency,
        "last_craw": ""
    }, function (err, doc) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
        /*
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("urls");
        }*/
    });
});

/* POST to Delete Task Service */
router.delete('/delete/:id', function(req, res) {
    var db = req.db;
    console.log("DELETE TASK: ");
    console.log(req.body);  

    var taskcollection = db.get('taskcollection');
    var taskToDelete = req.params.id;
    taskcollection.remove({ '_id' : taskToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
