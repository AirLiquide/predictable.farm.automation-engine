/**
 * Created by ilab on 01/12/16.
 */
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8081/?role=sensor&sensorId=1');
var i = 0;

ws.on('open', function open() {
    //ws.send(JSON.stringify({message:'something'}));
    console.log("TEST : connected to server")
    function sendData(){
        var _data ={
            type:"TEST_ACTION",
            data:{
                connected: true
            }
        }
        ws.send(JSON.stringify(_data));
        console.log("data sent")
        console.log(i);
        i = i+1;
        if (i<5)
            setTimeout(sendData,2000)
        //ws.send(JSON.stringify({message:'something'}));
    }
    setTimeout(sendData,2000);
});

ws.on('message', function(data, flags) {
    console.log(data)
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
});

ws.on ('close', function close() {
    console.log("TEST : disconnected");
});

ws.on('data', function(data, flags) {
    console.log(data)
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
});