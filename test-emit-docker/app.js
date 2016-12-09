/**
 * Created by ilab on 08/12/16.
 */
var socket = require('socket.io-client')('http://10.49.95.122:8080/');
var SocketActions = require('./SocketActions')

var i = 0;

socket.on('connect', function(){
    console.log("TEST : connected to server")
    socket.emit("hello")

    function sendData(){
        var _data ={
            device_id:'brice',
            sensor_type:'temperature',
            sensor_id:'brice',
            sensor_value:'0'
        }
        socket.emit("sensor-emit",_data);
        console.log("data sent" ,SocketActions.TEST_ACTION)
        console.log(i);
        i = i+1;
        if (i<20)
            setTimeout(sendData,5000)
    }
    setTimeout(sendData,2000);;
});
socket.on('event', function(data){

});
socket.on('disconnect', function(){
    console.log("disconnected");
});
socket.on('error', function(error){
    console.log(error);
});