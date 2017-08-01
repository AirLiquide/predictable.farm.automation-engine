/**
 * Created by ilab on 06/12/16.
 */
"use strict";
var SocketActions = require('./SocketActions');
var SocketServer = require('./SocketServer');

var STATE = {
    notFound: "Not found",
    connected: "Connected",
    timeout: "Timeout", //Important to send alerts
    disconnected: "Disconnected",
    discoTO: "Disconnected after Timeout" //Important to send alerts
};


class NodeRegister {

    constructor(/*node*/node) {
        this.node = node;
        this.state = STATE.notFound;

        this.enabled = true;

        if (this.node.nodeType == "global_actuator") {
            SocketServer.registerActuatorNode(this.node);
        }
        else {
            SocketServer.registerSensorNode(node);
        }
    }

    handleEvent(event, data) {

        if (SocketActions.isValidAction(event)) {
            //prevent the timeout to be called when we disconnect/redeploy the node
            if (event != SocketActions.SENSOR_DISCONNECT && event != SocketActions.SENSOR_CONNECT) {
                //console.log(data);
                this.setLastUpdate(Date.now());
                //console.log("lastUpdate edited", weh.getLastUpdate())
                if (!this.getTimeout()) {
                    this.setTO(setTimeout(checkTimeout, this.getNode().timeout, this));
                }
            }
            else {
                if (this.getTimeout()) {
                    clearTimeout(this.getTimeout());
                }
                this.setTO(undefined);
            }

            if (event == SocketActions.SENSOR_CONNECT) {
                this.onSensorConnect(data)

            }
            else if (event == SocketActions.SENSOR_DISCONNECT) {
                this.onSensorDisconnect(data)

            }
            else if (event == SocketActions.UPDATE_DATA) {
                this.onUpdateData(data)

            }
        }

    }

    onSensorConnect() {

    }

    onSensorDisconnect(data) {
        if (this.getState() == STATE.timeout) {
            this.setState(STATE.discoTO);
            this.node.status({fill: "red", shape: "ring", text: "disconnected after timeout"});
        }
        else if (this.getState() == STATE.connected) {
            this.setState(STATE.disconnected);
            this.node.status({fill: "gray", shape: "ring", text: "disconnected"});
        }
        else {
            this.node.status({fill: "gray", shape: "ring", text: "not found"});
        }

    }

    onUpdateData(data) {

        if (this.getState() != STATE.connected) {
            this.setState(STATE.connected);
        }

        var data = JSON.parse(data);
        var msg = {
            payload: data
        };

        if (this.node.nodeType == "sensor_light_dli") {
            this.node.updateValue();
        }
        else {
            this.node.send(msg);
        }

        if (this.node.nodeType == "global_actuator" || this.node.nodeType == 'sensor_actuator') {
            this.node.status({
                fill: "green",
                shape: "dot",
                text: data.device_id + " / Value : " + ((data.sensor_value == 0) ? "ON" : "OFF")
            });
        }
        else if (this.node.nodeType == "sensor_light_dli") {
            this.node.status({fill: "green", shape: "dot", text: data.device_id + " / Value : " + (this.node.dli/1000000).toFixed(2)}); //convert micromol to mol
        }
        else if (this.node.nodeType != "global_sensor" && this.node.nodeType != "global_all_sensor") {
            this.node.status({fill: "green", shape: "dot", text: data.device_id + " / Value : " + data.sensor_value});
        }
        else {
            this.node.status({fill: "green", shape: "dot", text: "Connected"});
        }

    }

    disconnect() {
        if (this.node.nodeType == "global_actuator") {
            SocketServer.removeActuatorNode(this.node);
        }
        else {
            SocketServer.removeSensorNode(this.node);
        }
        clearTimeout(this.TO);
        this.enabled = false;
        this.state = STATE.disconnected;
    }

    sendToSensor(data, deviceId) {
        SocketServer.sendToSensor(data, deviceId);
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

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }
}

var checkTimeout = function (weh) {

    if (weh.enabled) {
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

module.exports = NodeRegister;
