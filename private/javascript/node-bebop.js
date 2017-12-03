
var bebop = require('node-bebop')
var nodeBebop = bebop.createClient()
process.drone = nodeBebop
nodeBebop.connect(function(){
    nodeBebop.addListener()
    console.log("connected!@@@@")
})
nodeBebop.test = function(){
    console.log("test")
}
nodeBebop.addListener = function(){
    nodeBebop.on("ComponentStateListChanged", function(data) {
        console.log("ComponentStateListChanged", data);
      });
      
      nodeBebop.on("HomeChanged", function(data) {
        console.log("HomeChanged",data);
      });
      
      nodeBebop.on("HomeTypeAvailabilityChanged", function(data) {
        console.log("HomeTypeAvailabilityChanged",data);
      });
      
      nodeBebop.on("HomeTypeChosenChanged", function(data) {
        console.log("HomeTypeChosenChanged",data);
      });
      
      nodeBebop.on("NumberOfSatelliteChanged", function(data) {
        console.log("NumberOfSatelliteChanged ",data);
      });
      
      nodeBebop.on("AllSettingsChanged", function(data) {
        console.log("AllSettingsChanged",data);
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
  }
module.exports = nodeBebop
