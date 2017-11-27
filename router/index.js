var express = require('express')
var router = express.Router()
var app = express();

router.get('/',function(req, res, next) {
  console.log('get /')
  res.status(200).send("ok")
});


app.use(function(err, req, res, next) {
  console.log("error check");
  console.log(err)
})

module.exports = router


