
var async = require('async');
var request = require('request')

const { exec,spawn } = require('child_process')
var bebop = require('node-bebop');
var serverURI = "http://192.168.123.111:3002"
var droneIP = "192.168.123.143"
var droneID = ""
var drone = {}
var drone = bebop.createClient();

// drone.connect(function() {
//   drone.on("PositionChanged", function(data) {
//     console.log(data);
//   })
// })
// drone.test = function(){
//     return "test"
// }

drone.init = function(port){
    async.waterfall([
        function (callback) {
            var query = "ifconfig | grep wlan | awk '{split($0, data, \"HWaddr \"); printf(\"%s\\n\",data[2]);}'"
            console.log(query)
            exec(query, (error, stdout, stderr) => {
                if (error) {
                console.error(`exec error: ${error}`);
                return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                
                if(typeof callback === 'function'){
                    callback(null, stdout.trim())
                }
            });
        },
        function(mac, callback){
            console.log(`mac:${mac}`)
            request({
                url : serverURI + "/addDrone",
                method:"POST",
                json:true,
                body:{
                    ip: droneIP,
                    port: Number(port),
                    model: "bebop",
                    mac: mac
                },
                },function (err, response, body) {
                    if (err) console.log(err)
                    console.log(body)
                }
            )
        }
    ], function (err, service) {

    });
    
   
}
module.exports = drone