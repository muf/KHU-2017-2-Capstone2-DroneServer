// 사용자 데이터 정보를 가상으로 생성해주는 제너레이터 웹 앱
var tool = require('cloneextend')
,conf = {};
conf.defaults = {
    server : {
        name : "droneController",
        description:"web application which controlls bebop drone",
        ip : '123',
        port : 4444
    }
};

exports.get = function get(env, obj){
var settings = tool.cloneextend(conf.defaults, conf[env]);
return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}
