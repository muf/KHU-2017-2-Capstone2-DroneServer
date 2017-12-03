var express = require('express')
var router = express.Router()
var app = express()
var cors = require('cors')
var drone = require(__dirname + '/../private/javascript/drone.js')

// process.drone = drone
app.use(function(err, req, res, next) {
  console.log("error check");
  console.log(err)
})
module.exports = router
