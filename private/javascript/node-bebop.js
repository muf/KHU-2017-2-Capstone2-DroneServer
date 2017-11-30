
var bebop = require('node-bebop')
var nodeBebop = bebop.createClient()

nodeBebop.connect(function(){
    nodeBebop.addListener()
    console.log("connected!@@@@")
})
nodeBebop.test = function(){
    console.log("test")
}
nodeBebop.addListener = function(){

    // timer = setInterval(function(){
    //         drone.once("PositionChanged", function(data) {
    //             droneGPS = data
    //             console.log(droneGPS)
    // },3000)})

    nodeBebop.on("ComponentStateListChanged", function(data) {
        console.log("ComponentStateListChanged", data);
      });
      
      nodeBebop.on("HomeChanged", function(data) {
        console.log("HomeChanged",data);
      });
      
      nodeBebop.on("NumberOfSatelliteChanged", function(data) {
        console.log("NumberOfSatelliteChanged ",data);
      });
      
      nodeBebop.on("AllSettingsChanged", function(data) {
        console.log("HomeChanged",data);
      });
      
      
      nodeBebop.on("ready", function() {
        console.log("ready");
      });
    
      nodeBebop.on("battery", function(data) {
        console.log("battery", data);
      });
    
      nodeBebop.on("landed", function() {
        console.log("landed");
      });
    
      nodeBebop.on("takingOff", function() {
        console.log("takingOff");
      });
    
      nodeBebop.on("hovering", function() {
        console.log("hovering");
      });
    
      nodeBebop.on("flying", function() {
        console.log("flying");
      });
    
      nodeBebop.on("landing", function() {
        console.log("landing");
      });
    
    //   drone.on("unknown", function(data) {
    //     console.log("unknown", data);
    //   });
}
module.exports = nodeBebop