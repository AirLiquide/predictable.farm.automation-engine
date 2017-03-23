/**
 * Created by admin on 22/02/2017.
 */
"use strict"

const crypto = require('crypto');
var socketClient = require('socket.io-client');
//var cloudAddress = 'http://bridge.predictable.farm';
var cloudAddress = 'http://35.158.65.142:3001';

var farmID = process.env.FARM_ID || "";
var secretKey = process.env.PREDICTABLE_KEY || "";

var _actuators = {};
var _dashboard = {};
var _clients = {};

function encrypt(text) {
    var crypted = crypto.createHmac('sha256', secretKey).update(text).digest('hex');
    return crypted;
}

var instance = null;

class DashBoardSocket {

    constructor(type) {
        _actuators = {};
        _dashboard = {};
        _clients = {};
        this.socket = socketClient('http://127.0.0.1:80/');
        this.cloudSocket = socketClient(cloudAddress, {
            query: "farmId=" + farmID
        });
        this.socket.on('connect', function () {
            console.log("Node-RED connected to dashboard");
        });

        this.socket.on('connect_error', function (error) {
            //console.log(error);
        });

        this.socket.on('sensor-receive', function (msg) {
            var msg = JSON.parse(msg);
            var socket_io_data = {
                'device_id': null,
                'sensor_type': null,
                'sensor_id': null,
                'sensor_value': 0
            };

            var aKeys = Object.keys(socket_io_data).sort();
            var bKeys = Object.keys(msg).sort();
            var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

            var actuators = Object.keys(_actuators);

            actuators.forEach(function each(actuator) {

                var node = _actuators[actuator];

                if (isValid && node.deviceid == msg.device_id){
                    node.send({
                        payload: msg
                    });
                }
                // in this example just send it straight on... should process it here really
                //node.send(msg);
            });
        });
        this.socket.emit("hello");

        var cs = this.cloudSocket;
        this.cloudSocket.on('connect', function () {

            cs.on('connect_error', function (error) {
                //console.log(error);
            });
            cs.on("authenticate", function (msg) {
                var hash = encrypt(msg);
                cs.emit('authenticate', hash);

            });
            cs.on("authenticated", function (msg) {
                console.log("Node-RED connected to Bridge");
            });
            cs.on("authenticated", function (msg) {
                console.log("Node-RED connected to Cloud Dashboard");
            });

            cs.on('sensor-receive', function (msg) {
                var socket_io_data = {
                    'device_id': null,
                    'sensor_type': null,
                    'sensor_id': null,
                    'sensor_value': 0
                };

                var aKeys = Object.keys(socket_io_data).sort();
                var bKeys = Object.keys(msg).sort();
                var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

                var actuators = Object.keys(_actuators);

                actuators.forEach(function each(actuator) {
                    var node = actuators[actuator];

                    if (isValid && node.deviceid == msg.device_id){
                        node.send({
                            payload: msg
                        });
                    }
                    // in this example just send it straight on... should process it here really
                    //node.send(msg);
                });
            });

        });
    }

        registerNode(node, type)
        {
            do
                var id = (1 + Math.random() * 4294967295).toString(16);
            while (_clients.hasOwnProperty(id));

            node.dashboardId = id;
            _clients[id] = node;

            if (type == 'global_dashboard_actuator') {
                _actuators[id] = node;
            }
            else if (type == 'global_sensor_dashboard') {
                _dashboard[id] = node;
            }

        }

        removeNode(node, type)
        {
            let id = node.dashboardId;

            delete _clients[id];

            if (type == 'global_dashboard_actuator') {
                delete _actuators[id];
            }
            else if (type == 'global_sensor_dashboard') {
                delete _dashboard[id];
            }

        }

        emit(event, data)
        {
            this.socket.emit(event, data);
            this.cloudSocket.emit(event, data);
        }

        close()
        {

        }


    }

    function

    getInstance() {
        if (instance == null) instance = new DashBoardSocket();
        return instance;
    }

    module
.
    exports = getInstance();
