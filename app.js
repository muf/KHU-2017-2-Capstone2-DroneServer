// load node modules
var express = require('express')

// sub app require

// module require
var path = require('path')
var bodyParser = require('body-parser')
var conf = require('./conf').get(process.env.NODE_ENV);

var drone = require(__dirname + '/private/javascript/drone.js')
// make instances
var app = express()

var index_router = require('./router/index')
var drone_router = require('./router/drone')

// on application


// set application


// use application
app.use(express.static(path.join(__dirname, 'public'))); // static default path to public ex) /css == ... expressJS/public/css
app.use(bodyParser.json()); // parse body of response to json 
app.use(bodyParser.urlencoded({ extended: false })); // parse the text as url encoded data. [false]:parse only once. [true]:parse every time (?????)


// connect sub apps
app.use('/', index_router) 
app.use('/drone', drone_router)

// use error check
app.use(function(err, req, res, next) {
  console.log("ERROR : APP.JS");
  console.log("MSG: "+err);
})

// listen application
app.listen(function(){
  var port = this.address().port
  console.log("Recovering APSP Application Running on %s port", port);
  drone.init(port)
});




