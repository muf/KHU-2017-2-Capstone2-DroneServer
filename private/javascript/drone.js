
var async = require('async');
var request = require('request')

process.on('uncaughtException', function (err) {
	//예상치 못한 예외 처리
	console.log('uncaughtException 발생 : ' + err);
    return ;
});

var nodeBebop = require(__dirname + '/node-bebop.js')
// process.nodeBebop = nodeBebop
const { exec,spawn } = require('child_process')

var serverURI = "http://14.33.77.250"
var serviceMonitorPort=":3002"
var droneIP = "192.168.123.143"
var droneID = ""
var drone = {}
// var drone = bebop.createClient()
var droneGPS 
var flag = true

var interrupt = {kill:false, pause:true}
var mutex = {lock:false, timer:null}
var errCount = 0
var taskTick = false
var service; //lazy인듯
var seq = -1;
var errList= []

drone.run = function(body){
    console.log(body)
    //https://github.com/hybridgroup/node-bebop
    //https://github.com/hybridgroup/node-bebop/blob/master/docs/
                        
    var curTime = new Date().getTime()
    body.forEach(msg => {
        var time = new Date(msg.date).getTime()
        var check = (curTime - time)/1000
        if(check < 0 || check > 3){
            msg.cmd = "expired"
        }
        if(msg.cmd == "gotoPos"){
            // drone.setHome(msg.params.position.lat, msg.params.position.lng, 500)
            // 동기화 잘해야함
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
            nodeBebop.up(1)    
        }else if(msg.cmd == "down"){
            console.log("RUN @ down")
            nodeBebop.down(1)    
        }else if(msg.cmd == "right"){
            console.log("RUN @ right")
            nodeBebop.right(1)    
        }else if(msg.cmd == "left"){
            console.log("RUN @ left")
            nodeBebop.left(1)    
        }else if(msg.cmd == "forward"){
            console.log("RUN @ forward")
            nodeBebop.forward(1)    
        }else if(msg.cmd == "backward"){
            console.log("RUN @ backward")
            nodeBebop.backward(1)    
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

drone.main = function(){
    var count = 0
    // 매 주기 마다 상태를 체크한다.
    drone.init()
    //readyForTask() //@@ test task 준비 ㄴ
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
                //console.log("시간을 기렸다가 집으로 복귀합니다.")
                console.log( "mainTask가 정상적인 시간내에 종료되지 않음.")
                mutex.lock = false
                
                // callback(err = {message: "집으로 갑니다."})
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
    // 드론 도착 확인.. (이게 너무 먼 거리가 되는 경우 ..? 이상한게 맞음)
    if(mutex.lock == false){
        errCount = 0 // 에러 카운트 초기화
        mutex.lock = true
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
                //console.log(body)
                // console.log(nodeBebop)
                if(body.length){
                    if(nodeBebop.eventNames().length != 0){
    		            drone.run(body)
                    }else{
                        console.log("reconnect try")
                       nodeBebop.connect() // 다시 시도
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

// drone.connect()
// drone.on("PositionChanged", function(data) {
//     droneGPS = data
//     console.log(droneGPS)
// })
// 주기적으로 droneGPS 데이터 갱신
// timer = setInterval(function(){
//     drone.once("PositionChanged", function(data) {
//         droneGPS = data
//         console.log(droneGPS)

//         request({
//             url : serverURI + "/addDrone",
//             method:"POST",
//             json:true,
//             body:{
//                 gps:{
//                     lat: 3,
//                     lng: 0
//                 }
//             },
//             },function (err, response, body) {
//                 if (err) console.log(err)
//                 console.log(body)
//             }
//         )
//     })
// },3000)

drone.setHome = function(data){
    drone.GPSsetting.setHome(data.x,data.y,data.z) // gps랑 아예 딴판인가?
}
drone.goHome = function(data){
    drone.Piloting.navigateHome(data) //여기 data는 뭐임?
}
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
            callback(null, "AA:AA:AA:AA:AA:AA")
        },
        function(mac, callback){
            //@@ test mac = 
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
