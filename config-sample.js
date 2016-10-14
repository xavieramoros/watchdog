exports.config = function() {
  var ip = require('ip');
  var env = process.env.NODE_ENV || 'development';
  var app = {};
  // Define the base environment
  app.env = {
    production: false,
    qa: false,
    development: false
  };

  // Set up the current environment
  app.env[env] = true;

  ////////////////////////////////////////////////
  // DEVELOPMENT (default) ENVIRONMENT          //
  ////////////////////////////////////////////////

  if(app.env.development === true){
    app.host = 'http://localhost:3000';
    app.mongoHost = 'localhost'; //important to remove the http
    app.mongoPort = '27017';
    app.mongoDb = 'watchdog';
    app.port = '3000'; // || process.env.PORT  
    app.ip = "127.0.0.1";
    app.mongoConnectionString = "mongodb://"+app.mongoHost+":"+app.mongoPort+"/"+app.mongoDb;

    //app.mongoUser = 'admin';
    //app.mongoPwd = 'jTiGBghGuBHd';    
  };

  ////////////////////////////////////////////////
  // PRODUCTION ENVIRONMENT                     //ƒ
  ////////////////////////////////////////////////
  if(app.env.production === true){  //FIXME: add mongolab credentials to bashenv https://hub.openshift.com/quickstarts/11-mongolab
    app.host = 'http://'+process.env.OPENSHIFT_NODEJS_IP+':'+process.env.OPENSHIFT_NODEJS_PORT;//''ip.address();  
    app.mongoHost = 'XXXXXXX.mlab.com'; 
    app.mongoPort = XXXXX;
    app.mongoDb = 'watchdog';
    app.mongoUser = 'watchdog_user';
    app.mongoPwd = 'XXXXXXX';
    app.mongoConnectionString = 'mongodb://'+app.mongoUser+':'+app.mongoPwd+'@'+app.mongoHost+':'+app.mongoPort+'/'+app.mongoDb;
    app.port = process.env.OPENSHIFT_NODEJS_PORT;//process.env.OPENSHIFT_NODEJS_PORT;
    app.ip = process.env.OPENSHIFT_NODEJS_IP;//process.env.OPENSHIFT_NODEJS_IP;
  };

  ////////////////////////////////////////////////
  // QA ENVIRONMENT                             //
  ////////////////////////////////////////////////

  if(app.env.qa === true){
    app.host = ip.address(); 
    app.mongoHost = ''; //FIXME
  };
  return app;
};
