
var async = require('async');
var request = require('request')

const { exec,spawn } = require('child_process')
var bebop = require('node-bebop');
var serverURI = "http://192.168.123.111"
var serviceMonitorPort=":3002"
var droneIP = "192.168.123.143"
var droneID = ""
var drone = {}
var drone = bebop.createClient()
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
    body.forEach(msg => {
        if(msg.cmd == "gotoPos"){
            // drone.setHome(msg.params.position.lat, msg.params.position.lng, 500)
            // 동기화 잘해야함
            // drone.navigateHome()
            console.log(`goto position lat: ${msg.params.position.lat}, lng: ${msg.params.position.lng} `)
        }
        else if(msg.cmd == "land"){
            
        }
    })
}

drone.main = function(count){
    // 매 주기 마다 상태를 체크한다.
    console.log("main start")
    drone.init()
    //readyForTask() //@@ test task 준비 ㄴ
    async.whilst(
        function () { 
            // 매 초 확인. kill이 들어오면 즉시 종료
            count++

            // close test용 함수
            if(count > 200){
                //interrupt.kill
                interrupt.kill= true
            }
            if(interrupt.kill){
                return false
            }

            if(!mutex.lock && !interrupt.pause){
                if(count > 5){

                    taskTick = true
                    count = 0
                }
            }
            return true
        },
        function (callback) {
            count++;
            if(errCount > 3){
                callback(err = {message: "mainTask가 정상적인 시간내에 종료되지 않음."})
            }
            checkTimer = setTimeout(function(){
               callback()
            }, 1000); 
            // 비동기 함수. 문제 발생 시 임의로 pause 할 수 있다.
            if(!interrupt.pause && taskTick){
                mainTask(callback)
            }
        },
        // 반복 다 끝나면 여기로
        function (err) {
            if(err) console.log(err.message)
            // 5 seconds have passed
            exitProcess()
        }
    )
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
                if (err) console.log(err)
                drone.run(body)
                mutex.lock = false
            
            }
        )
        // setTimeout(function(){
        //     console.log("func finished@@@@@@@@@@@@@@@@@@@@@@@2")
        //     mutex.lock = false
        // },1000)
        // async.waterfall([
        //     function(callback){
        //         callback(null, "none")
        //     },
        //     makeClusterData,
        //     runAlgorithm,
        //     // controlDrones,
        //     function(result, callback){

        //         callback(null, result)
        //     }
        //   ], function (err, result) {
        //     mutex.lock = false
        //     console.log("func finished.##################")
        //   });
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
                    console.log(body)
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