var express = require('express')
var router = express.Router()
var app = express()
var cors = require('cors')
var drone = require(__dirname + '/../private/javascript/drone.js')

router.post('/setHome', cors(), function(req, res, next) {
    //req.body.pos === {x:1,y:1, z:1}
    drone.setHome(req.body.pos, function(err, result){
        if(err){
            res.status(500).send("fail")
        }
        res.status(200).send("ok")
    }) // gps랑 아예 딴판인가?
});

router.post('/goHome', cors(), function(req, res, next) {
    //req.body.pos === {x:1,y:1, z:1}?>@@@@@@@? 파라미터 뭐임?
    drone.setHome(req.body.pos, function(err, result){
        if(err){
            res.status(500).send("fail")
        }
        res.status(200).send("ok")
    }) // gps랑 아예 딴판인가?
});
app.use(function(err, req, res, next) {
  console.log("error check");
  console.log(err)
})


drone.main(0)

module.exports = router
