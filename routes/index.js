var express = require('express');
var router = express.Router();


/* GET urls. */
router.get('/urls', function(req, res, next) {
  var db = req.db;  
  var urlcollection = db.get('urlcollection');
  urlcollection.find({},{},function(e,docs){
      if(e) console.log("ERROR:",e);
      
      console.log("DOCS:",docs);

      res.render('urls', {
          "urlList" : docs
      });
  });
});

/* GET New URL page. */
router.get('/newurl', function(req, res) {
    res.render('newurl', { title: 'Add New Url' });
});

/* POST to Add Url Service */
router.post('/addurl', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var url = req.body.url;
    var title = req.body.title;

    // Set our collection
    var collection = db.get('urlcollection');

    // Submit to the DB
    collection.insert({
        "url" : url,
        "title" : title
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("urls");
        }
    });
});


/* GET specific url
router.get('/url/:id', function(req, res, next) {
  res.render('urls', { title: 'Express' });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
