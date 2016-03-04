var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash'); //used to send temp messages between redirects
var routes = require('./routes/index');
var crawls = require('./controllers/crawls');
var tasks = require('./controllers/tasks');  

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //  extended: true


app.use(express.static(path.join(__dirname, 'public')));

//To use flash, first setup sessions as usual by enabling cookieParser and session middleware
app.use(cookieParser('watchdog pass'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());

// Make our db accessible to our router, wrapping database object into every request //FIXME
app.use(function(req,res,next){
    next();
});

app.use('/', routes);
app.use('/crawls', crawls);
app.use('/tasks', tasks);

var configuration = require('./config')
conf = configuration.config();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
