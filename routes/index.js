var express = require('express');
var router = express.Router();


/* GET New URL page. */
router.get('/newurl', function(req, res) {
    res.render('newurl', { title: 'Add New Url' });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Watchdog' });
});


module.exports = router;
