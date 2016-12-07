/**
 * Created by ilab on 06/12/16.
 */
"use strict";

var WebSocket = require('/usr/local/lib/node_modules/node-red/node_modules/ws');
var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions');

class WsEventHandler {

    //TODO : add timeout handling
    //TODO: method 1 : using setTimeout() / ClearTimeout()
    //TODO: method 2 : using setTimeout() / Timestamp


    constructor(node, address) {
        this.ws = new WebSocket(address);
        this.node = node;

        var _node = this.node;
        console.log(this.node.timeout)
        var weh = this;

        this.ws.on('open', function open() {
            //ws.send(JSON.stringify({message: 'something'}));
            //console.log("connected to server")
        });

        this.ws.on('message', function (data, flags) {

            var data = JSON.parse(data);
            var _data = {
                payload: data
            }

            if (SocketActions.isValidAction(data.type) ) {
                weh.setLastUpdate(Date.now());

                if (!weh.getTimeout()&& data.type != SocketActions.SENSOR_DISCONNECT) {
                    weh.setTO(setTimeout(checkTimeout, weh.getNode().timeout, weh));
                    //weh.setTimeout(setTimeout(checkTimeout,5000,weh));
                }

                if (data.type === SocketActions.SENSOR_DISCONNECT) {
                    //console.log("Sensor disconnected")
                    _node.status({fill: "gray", shape: "ring", text: "disconnected"});
                    _node.send([null, null, _data]);
                    if (weh.getTimeout()) {
                        clearTimeout(weh.getTimeout());
                    }
                }

                if (data.type === SocketActions.SENSOR_CONNECT) {
                    //console.log("Sensor connected")
                    _node.status({fill: "green", shape: "dot", text: "connected"});
                    _node.send([null, null, _data]);
                }
                if (data.type === SocketActions.TEST_ACTION) {
                    //console.log("Test action")
                }
                else
                    _node.send([_data, null, null]);
                // flags.binary will be set if a binary data is received.
                // flags.masked will be set if the data was masked.
            }
        });


        this.ws.on('close', function close() {

        });

    }

    getSocket() {
        return this.ws;
    }

    getNode() {
        return this.node;
    }

    getTimeout() {
        return this.timeout;
    }

    getLastUpdate() {
        return this.lastUpdate;
    }

    setTO(timeout) {
        this.timeout = timeout;
    }

    setLastUpdate(lastUpdate) {
        this.lastUpdate = lastUpdate;
    }
}

var checkTimeout = function (weh) {
    if (weh.getSocket()) {
        if ((Date.now() - weh.lastUpdate) >= weh.getNode().timeout) {
            //if ((Date.now()-weh.lastUpdate)>=5000){
            //notify timeout
            weh.getNode().status({fill: "yellow", shape: "dot", text: "timeout"});
            weh.setTO(undefined);
            console.log(weh.getTimeout())
        }
        else {
            weh.setTO(setTimeout(checkTimeout, Date.now() - weh.getLastUpdate(), weh));
        }
    }
}

module.exports = WsEventHandler;