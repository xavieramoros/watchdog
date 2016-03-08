#!/usr/bin/env node

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var session = require('express-session');
var bodyParser = require('body-parser');
//var flash = require('connect-flash'); //used to send temp messages between redirects
var routes = require('./routes/index');
var crawls = require('./controllers/crawls');
var tasks = require('./controllers/tasks');  
var debug = require('debug')('watchdog:server');
var http = require('http');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
//app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
//app.listen(conf.port, conf.ip);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //  extended: true

var port = normalizePort(conf.port);
app.set('port', port);
app.set('ip',conf.ip);


app.use(express.static(path.join(__dirname, 'public')));

//To use flash, first setup sessions as usual by enabling cookieParser and session middleware
//app.use(cookieParser('watchdog pass'));
//app.use(session({cookie: { maxAge: 60000 }}));
//app.use(flash());

// Make our db accessible to our router, wrapping database object into every request //FIXME
app.use(function(req,res,next){
    next();
});

app.use('/', routes);
app.use('/crawls', crawls);
app.use('/tasks', tasks);

var configuration = require('./config')
conf = configuration.config();


//DEBUGING OPENSHIFT
console.log("***Starting app. conf.env:",conf.env);

try{
  var Agenda = require('agenda');
  agenda = new Agenda({db: {address: conf.mongoConnectionString, collection: "agendacollection", options:{uri_decode_auth:true}}});
  agenda.start();
}catch(e){
  console.log("Error connecting Agenda:",e);
}


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

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, conf.ip);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;
