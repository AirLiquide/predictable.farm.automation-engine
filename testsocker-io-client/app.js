/**
 * Created by ilab on 08/12/16.
 */
var socket = require('socket.io-client')('http://172.18.0.22:3000/',{ query: 'role=sensor&sensorId=1'});
var SocketActions = require('./SocketActions');

var i = 0;

var types =[
    'misthumidity',
    'mistlux',
    'misttemperature',
    'ch4',
    'co',
    'co2',
    'humidity',
    'pressure',
    'temperature',
    'waterec',
    'waterhumidity',
    'waterorp',
    'watertemperature'
];

socket.on('connect', function(){
    console.log("TEST : connected to server");
    function sendData(){
        var index = getRandomInt(0,types.length-1);
        var value = getRandomInt(0,100);
        var _data = {
            'device_id': '1',
            'sensor_type': types[index],
            'sensor_id': '1',
            'sensor_value': value
        };
        //console.log(_data);
        socket.emit(SocketActions.SENSOR_EMIT,JSON.stringify(_data));
        console.log(i);
        i = i+1;
        if (i<5000)
            setTimeout(sendData,200)
    }
    setTimeout(sendData,2000);
});
socket.on('event', function(data){

});
socket.on('disconnect', function(){
    console.log("disconnected");
});
socket.on('error', function(error){
    console.log(error);
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}