
var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function() {
  drone.on("PositionChanged", function(data) {
    console.log(data);
  })
})
drone.test = function(){
    return "test"
}
module.exports = drone