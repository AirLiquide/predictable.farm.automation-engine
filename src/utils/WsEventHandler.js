/*
  Copyright (C) Air Liquide S.A,  2017-2018
  Author: Sébastien Lalaurette and Cyril Ferté, La Factory, Creative Foundry
  This file is part of Predictable Farm project.

  The MIT License (MIT)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
   
  See the LICENSE.txt file in this repository for more information.
*/

"use strict";

var SocketActions = require(__dirname+'/SocketActions');
var RelayStateHandler = require('./RelayStateHandler');

var STATE ={
    notFound : "Not found",
    connected : "Connected",
    timeout : "Timeout", //Important to send alerts
    disconnected : "Disconnected",
    discoTO: "Disconnected after Timeout" //Important to send alerts
};


class WsEventHandler {


    constructor(/*node*/node, /*string*/ address, /*string*/params, /*string*/nodeType ="") {

        this.node = node;

        var _node = this.node;
        var weh = this;
        this.state = STATE.notFound;

        this.ws = require('socket.io-client')(address, {query: params});

        //used to check all events at once. Useful for the timeout detection
        var onevent = this.ws.onevent;
        this.ws.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet);    // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);      // additional call to catch-all
        };

        this.ws.on('connect', function () {
        });

        this.ws.on('error', function (error) {
            console.log(error)
        });

        this.ws.on('disconnect', function () {

        });

        this.ws.on(SocketActions.SENSOR_DISCONNECT, function (data) {
            //console.log("Sensor disconnected")

            if (weh.getState() == STATE.timeout){
                weh.setState(STATE.discoTO);
                _node.status({fill: "red", shape: "ring", text: "disconnected after timeout"});
                _node.send([null,{
                    payload : {
                        time : Date.now()
                    }
                }])

            }
            else if (weh.getState() == STATE.connected){
                weh.setState(STATE.disconnected);
                _node.status({fill: "gray", shape: "ring", text: "disconnected"});
            }
            else{
                _node.status({fill: "gray", shape: "ring", text: "not found"});
            }
            var msg = {
                payload: data
            }
            //_node.send([null, null, msg]);
        });

        this.ws.on(SocketActions.SENSOR_CONNECT, function (data) {
            //console.log("Sensor connected")

            var msg = {
                payload: data
            }
            //_node.send([null, null, msg]);
        });

        this.ws.on(SocketActions.TEST_ACTION, function (data) {
            //updateTimeout(weh,SocketActions.TEST_ACTION);
            //console.log("Test action")
        });

        /**
         * var socket_io_data = {
         * 'device_id': null,
         * 'sensor_type': null,
         * 'sensor_id': null,
         * 'sensor_value': 0
         * }
         */

        this.ws.on(SocketActions.UPDATE_DATA, function (data) {
            if (weh.getState() != STATE.connected){
                weh.setState(STATE.connected);
            }

            var data = JSON.parse(data)
            var msg = {
                payload: data
            };

            if (nodeType == "global_actuator"){
                _node.status({fill: "green", shape: "dot", text: data.device_id + " / Value : " + ((data.sensor_value ==1)? "ON":"OFF")});
            }
            else if (nodeType !="global_sensor" && nodeType != "global_all_sensor"){
                _node.status({fill: "green", shape: "dot", text: data.device_id + " / Value : " + data.sensor_value});
            }
            else {
                _node.status({fill: "green", shape: "dot", text: "Connected"});
            }

            _node.send([msg,null]);

        });

        this.ws.on("*", function (event, data) {
            if (SocketActions.isValidAction(event)) {
                //prevent the timeout to be called when we disconnect/redeploy the node
                if (event != SocketActions.SENSOR_DISCONNECT && event != SocketActions.SENSOR_CONNECT ) {
                    //console.log(data);
                    weh.setLastUpdate(Date.now());
                    //console.log("lastUpdate edited", weh.getLastUpdate())
                    if (!weh.getTimeout()) {
                        weh.setTO(setTimeout(checkTimeout, weh.getNode().timeout, weh));
                    }
                }
                else {
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

    getState(){
        return this.state;
    }

    setState(state){
        this.state = state;
    }
}

var checkTimeout = function (weh) {
    if (weh.getSocket()) {
        //console.log((Date.now() - weh.getLastUpdate()) - weh.getNode().timeout);
        if ((Date.now() - weh.getLastUpdate()) >= weh.getNode().timeout) {
            //if ((Date.now()-weh.lastUpdate)>=5000){
            //notify timeout
            weh.setState(STATE.timeout);
            weh.getNode().status({fill: "red", shape: "dot", text: "timeout"});
            var msg = {
                payload: {
                    timeout: true
                }
            }
            //weh.getNode().send([null, msg, null]);
            weh.setTO(undefined);
            //weh.setTO("timeout");
        }
        else {
            weh.setTO(setTimeout(checkTimeout, Date.now() - weh.getLastUpdate(), weh));
        }
    }
}

var updateTimeout = function (weh, event) {


}

module.exports = WsEventHandler;
