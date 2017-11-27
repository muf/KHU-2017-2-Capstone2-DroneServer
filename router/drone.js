var express = require('express')
var router = express.Router()
var app = express()
var cors = require('cors')
var drone = require(__dirname + '/../private/javascript/drone.js')

router.get('/test', cors(), function(req, res, next) {
    console.log(drone.test())
    res.status(200).send(drone.test())
});

router.get('/test', cors(), function(req, res, next) {
    console.log(drone.test())
    res.status(200).send(drone.test())
});

router.get('/test', cors(), function(req, res, next) {
    console.log(drone.test())
    res.status(200).send(drone.test())
});

app.use(function(err, req, res, next) {
  console.log("error check");
  console.log(err)
})

module.exports = router