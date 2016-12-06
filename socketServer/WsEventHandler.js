/**
 * Created by ilab on 06/12/16.
 */
"use strict";

var WebSocket = require('/usr/local/lib/node_modules/node-red/node_modules/ws');
var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions')

class WsEventHandler{

    constructor(node,address){
        this.ws = new WebSocket(address);
        this.node = node;

        var _node = this.node;

        this.ws.on('open', function open() {
            //ws.send(JSON.stringify({message: 'something'}));
            console.log("connected to server")

        });

        this.ws.on('message', function (data, flags) {

            var data = JSON.parse(data);
            var _data = {
                payload : data
            }
            if(data.type === SocketActions.SENSOR_DISCONNECT){
                console.log("Sensor disconnected")
                _node.status({fill:"gray",shape:"ring",text:"disconnected"});
                _node.send([null,null,_data]);
            }
            if(data.type === SocketActions.SENSOR_CONNECT){
                console.log("Sensor connected")
                _node.status({fill:"green",shape:"ring",text:"connected"});
                _node.send([null,null,_data]);
            }
            else
                _node.send([_data,null,null]);
            // flags.binary will be set if a binary data is received.
            // flags.masked will be set if the data was masked.
        });

        this.ws.on('close', function close() {
            console.log("disconnected");
        });
    }

    getSocket(){
        return this.ws;
    }
}

module.exports = WsEventHandler;