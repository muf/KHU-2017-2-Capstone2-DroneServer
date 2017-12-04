
var async = require('async');
var request = require('request')

process.on('uncaughtException', function (err) {
	//예상치 못한 예외 처리
	console.log('uncaughtException 발생 : ' + err);
    return ;
});

var nodeBebop = require(__dirname + '/node-bebop.js')
const { exec,spawn } = require('child_process')

var serverURI = "http://14.33.77.250"
var serviceMonitorPort=":3002"
var droneIP = "192.168.123.143"
var droneID = ""
var drone = {}
var droneGPS 
var flag = true

var interrupt = {kill:false, pause:true}
var mutex = {lock:false, timer:null}
var errCount = 0
var taskTick = false
var service; 
var seq = -1;
var errList= []
drone.testGPS = function (){    
    async.waterfall([
        function (callback) {
            nodeBebop.once("PositionChanged", function(data) {
                droneGPS = data 
                    callback(null, data)
            })
        },
        function(gps, callback){
            mac = "AA:AA:AA:AA:AA:AA"
            process.global = {mac:mac}
            request({
                url : serverURI + serviceMonitorPort + "/addDrone",
                method:"POST",
                json:true,
                body:{
                    gps:{
                        lat: gps.latitude.toString(),
                        lng: gps.longitude.toString(),
                        al: gps.altitude.toString()
                    },
                    model: "bebop",
                    mac: mac
                },

                },function (err, response, body) {
                    if (err) console.log(err)
                    // console.log(body)
                    console.log("db update for gps")
                    callback(null, body)
                }
            )
        }
    ], function (err, service) {
        console.log("done")
    });
}
process.drone = drone
drone.run = function(body){
    console.log(body)
    //console.log("!!!!!!!!!!!!!!!!!!!!! " + nodeBebop.GPSSettings.homeType())
    //https://github.com/hybridgroup/node-bebop
    //https://github.com/hybridgroup/node-bebop/blob/master/docs/
                        
    var curTime = new Date().getTime()
    body.forEach(msg => {
        var time = new Date(msg.date).getTime()
        var check = (curTime - time)/1000
        if(check < 0 || check > 3){
            msg.cmd = "expired"
        }
        //http://forum.developer.parrot.com/t/bebop-2-indoor-autonomous-flight/4463/3
        //https://github.com/hybridgroup/node-bebop/issues/48
        if(msg.cmd == "move"){
            console.log(Number(msg.position.lat))
            console.log(Number(msg.position.lng))
            // nodeBebop.GPSSettings.setHome(Number(msg.position.lat), Number(msg.position.lng,1))
            // nodeBebop.GPSSettings.setHome(Number(msg.position.lat), Number(msg.position.lng,1))
            nodeBebop.GPSSettings.setHome(Number(msg.position.lat), Number(msg.position.lng,0))
            // nodeBebop.GPSSettings.sendControllerGPS(Number(msg.position.lat), Number(msg.position.lng), 0,-1 ,-1)
           // nodeBebop.GPSSettings.sendControllerGPS(37.2111, 127.07402, 0,-1 ,-1)
            // nodeBebop.GPSSettings.homeType('PILOT',1)
            // nodeBebop.GPSSettings.homeType('TAKEOFF',1)
            nodeBebop.GPSSettings.homeType('FIRST-FIX',1)
            // nodeBebop.GPSSettings.homeType({type:'TAKEOFF',available:1})
            // nodeBebop.GPSSettings.homeType({type:'PILOT',available:1})
            nodeBebop.GPSSettings.homeType({type:'FIRST_FIX',available:1})
            nodeBebop.GPSSettings.homeType({type:'FIRST_FIX'})
            nodeBebop.GPSSettings.resetHome()
            
            // nodeBebop.GPSSettings.homeType = 'TAKEOFF'
            // nodeBebop.GPSSettings.setHome(Number(msg.position.lat), Number(msg.position.lng,0))
            setTimeout(function(){
                console.log("############## GO TO POSITION")
                // nodeBebop.Piloting.navigateHome(1)
            },10000)
        }
        else if(msg.cmd == "gotoPos"){
            // drone.setHome(msg.params.position.lat, msg.params.position.lng, 500)
            // drone.navigateHome()
            console.log("goto..")
        // console.log(`goto position lat: ${msg.params.position.lat}, lng: ${msg.params.position.lng} `)
        }
        else if(msg.cmd == "land"){
            console.log("RUN @ land")
             nodeBebop.land()
        }
        else if(msg.cmd == "takeOff"){
            console.log("RUN @ takeOff")
             nodeBebop.takeOff()
        }else if(msg.cmd == "up"){
            console.log("RUN @ up")
            nodeBebop.up(20)    
        }else if(msg.cmd == "down"){
            console.log("RUN @ down")
            nodeBebop.down(20)    
        }else if(msg.cmd == "right"){
            console.log("RUN @ right")
            nodeBebop.right(20)    
        }else if(msg.cmd == "left"){
            console.log("RUN @ left")
            nodeBebop.left(20)    
        }else if(msg.cmd == "forward"){
            console.log("RUN @ forward")
            nodeBebop.forward(20)
        }else if(msg.cmd == "backward"){
            console.log("RUN @ backward")
            nodeBebop.backward(20)    
        }else if(msg.cmd == "stop"){
            console.log("RUN @ stop")
            nodeBebop.stop()
        }else if(msg.cmd == "clockwise"){
            console.log("RUN @ clockwise")
            nodeBebop.clockwise(1)    
        }else if(msg.cmd == "counterClockwise"){
            console.log("RUN @ counterClockwise")
            nodeBebop.counterClockwise(1)    
        } else if(msg.cmd == "sendGps"){
            console.log("RUN @ sendGps")
            nodeBebop.once("PositionChanged", function(data) {
                droneGPS = data 
                console.log(droneGPS)
            })
        }else if(msg.cmd == "expired"){
            console.log("RUN @ expired")
        }else{
            console.log("UNKNOWN @ ??")
        }
        
    },nodeBebop)
}

drone.main = function(port){
    var count = 0
    // 매 주기 마다 상태를 체크한다.
    drone.init(port)
    async.whilst(
        function () { 
            // 매 초 확인. kill이 들어오면 즉시 종료
            count++

            // close test용 함수
            if(count > 20000000){
                interrupt.kill= true
            }
            if(interrupt.kill){
                return false
            }

            if(!mutex.lock && !interrupt.pause){
                taskTick = true
            }
            return true
        },
        function (callback) {
            count++;
            if(errCount > 100){
                console.log( "mainTask가 정상적인 시간내에 종료되지 않음.")
                mutex.lock = false
            }
            checkTimer = setTimeout(function(){
               callback()
            }, 100); 
            // 비동기 함수. 문제 발생 시 임의로 pause 할 수 있다.
            if(!interrupt.pause && taskTick){
                mainTask(callback)
            }
        },
        // 반복 다 끝나면 여기로
        function (err) {
            if(err) console.log(err.message)
            // 5 seconds have passe

           // exitProcess()
        }
    )
}
function exitProcess(){
    process.exit()
}
function mainTask(callback){
    //taskTick = false
    // 클러스터 돌려서 변수에 저장
    // 알고리즘 돌려서 결과 변수에 저장
    // 드론 명령 후 확인
    // 드론 도착 확인.. 
    if(mutex.lock == false){
        errCount = 0 // 에러 카운트 초기화
        mutex.lock = true
        drone.testGPS()
        request({
            url : serverURI + serviceMonitorPort + "/receive",
            method:"POST",
            json:true,
            body:{
                mac: process.global.mac
            },
            },function (err, response, body) {
                if (err){
                    console.log(err) 
                    mutex.lock = false
                    return;  
                }
                if(body.length){
    		            drone.run(body)
                    if(nodeBebop.eventNames().length != 0){
    		            drone.run(body)
                    }else{
                        console.log("reconnect try")
                      // nodeBebop.connect() // 다시 시도
                    }
                }
                mutex.lock = false
            }
        )
    }
    else{
        errCount++; //시간이 됬는데 lock 안풀려서 진입 못하는 횟수 증가
    }
}

drone.init = function(port){
    async.waterfall([
        function (callback) {
            // var query = "ifconfig | grep wlan | awk '{split($0, data, \"HWaddr \"); printf(\"%s\\n\",data[2]);}'"
            // console.log(query)
            // exec(query, (error, stdout, stderr) => {
            //     if (error) {
            //     console.error(`exec error: ${error}`);
            //     return;
            //     }
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
                
            //     if(typeof callback === 'function'){
            //         callback(null, stdout.trim())
            //     }
            // });
            // 테스트를 위해 mac 주소 직접 지정
            callback(null, "AA:AA:AA:AA:AA:AA")
        },
        function(mac, callback){
            //@@ test mac 
            mac = "AA:AA:AA:AA:AA:AA"
            process.global = {mac:mac}
            console.log(`mac:${mac}`)
            request({
                url : serverURI + serviceMonitorPort + "/addDrone",
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
                    console.log("[RECEIVED]@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                    console.log(body)
                    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                    callback(null, body)
                }
            )
        },function(result, callback){
            request({
                url : serverURI + serviceMonitorPort + "/connect",
                method:"POST",
                json:true,
                body:{
                    mac: process.global.mac
                },
                },function (err, response, body) {
                    if (err) console.log(err)
                    console.log(body)

                    interrupt.pause = false
                    callback(null,body)
                
                }
            )
        }
    ], function (err, service) {

    });
    
   
}
module.exports = drone
