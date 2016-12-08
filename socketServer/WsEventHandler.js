/**
 * Created by ilab on 06/12/16.
 */
"use strict";

var WebSocket = require('/usr/local/lib/node_modules/node-red/node_modules/ws');
var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions');

class WsEventHandler {


    constructor(node, address,params) {

        console.log(address, {query :params})

        this.node = node;

        var _node = this.node;
        var weh = this;

        this.ws = require('/root/.node-red/nodes/node_modules/socket.io-client')(address,{query :params});

        //used to check all events
        var onevent = this.ws.onevent;
        this.ws.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call (this, packet);    // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);      // additional call to catch-all
        };

        this.ws.on('connect', function(){
        });

        this.ws.on('error', function(error){
            console.log(error)
        });

        this.ws.on('disconnect', function(){

        });

        this.ws.on(SocketActions.SENSOR_DISCONNECT, function(data){
            //console.log("Sensor disconnected")
            _node.status({fill: "gray", shape: "ring", text: "disconnected"});
            _node.send([null, null, data]);
        });

        this.ws.on(SocketActions.SENSOR_CONNECT, function(data){
            //console.log("Sensor connected")
            _node.status({fill: "green", shape: "dot", text: "connected"});
            _node.send([null, null, data]);
        });

        this.ws.on(SocketActions.TEST_ACTION, function(data){
            //console.log("Test action")
        });

        this.ws.on("*",function(event,data) {
            if (SocketActions.isValidAction(event)) {
                if (event != SocketActions.SENSOR_DISCONNECT) {
                    weh.setLastUpdate(Date.now());
                    if (!weh.getTimeout()) {
                        weh.setTO(setTimeout(checkTimeout, weh.getNode().timeout, weh));
                    }
                }
                else{
                    console.log(weh.getTimeout());
                    if (weh.getTimeout()) {
                        clearTimeout(weh.getTimeout());
                    }
                    weh.setTO(undefined);

                }
            }
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
            //weh.setTO("timeout");
        }
        else {
            weh.setTO(setTimeout(checkTimeout, Date.now() - weh.getLastUpdate(), weh));
        }
    }
}

module.exports = WsEventHandler;