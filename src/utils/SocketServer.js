/**
 * Created by ilab on 30/11/16.
 */
"use strict";
/**
 * Created by ilab on 01/12/16.
 */

var SocketActions = require('./SocketActions');
var DLIStore = require('./DLIStore');

var url = require('url');

var io = require('socket.io').Server;

var server = null;

var _clients = {};
var _sensors = {}; //might be removed to save memory, useful to fast iterate on sensors

var sensorNodes = [];
var actuatorNodes = [];

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;


class SocketServer {
    constructor() {
        server = require('socket.io').listen(3000);
        _clients = {};
        _sensors = {};
        sensorNodes = [];
        actuatorNodes = [];
        //server.on('connection', this.handleConnection);
        server.on('connection', this.handleConnection);
        console.log("Socket Server started!");
        return this;
    }

    registerSensorNode(node) {
        var i = sensorNodes.indexOf(node);
        if (i == -1) {
            sensorNodes.push(node);
        }

        //TODO: check if sensor is already logged in
    }

    removeSensorNode(node) {

        var i = sensorNodes.indexOf(node);
        if (i != -1) {
            sensorNodes.splice(i, 1);
        }
    }

    registerActuatorNode(node) {
        var i = actuatorNodes.indexOf(node);
        if (i == -1) {
            actuatorNodes.push(node);
            console.log("actuator registered")
        }

        //TODO: check if sensor is already logged in
    }

    removeActuatorNode(node) {
        var i = actuatorNodes.indexOf(node);
        if (i != -1) {
            actuatorNodes.splice(i, 1);
        }
    }

    sendToSensor(data,deviceId){
        //console.log("HELLO")
        var sensors = Object.keys(_sensors);
        sensors.forEach(function each(sensor) {
            if (_sensors[sensor].deviceId == deviceId) { //id is the sensor id
                _sensors[sensor].socket.emit('sensor-receive', JSON.stringify(data));

            }
        });
    }

    handleConnection(ws) {
        do
            var id = (1 + Math.random() * 4294967295).toString(16);
        while (_clients.hasOwnProperty(id));
        var role = ws.handshake.query.role;
        var deviceId = ws.handshake.query.sensorId;

        console.log("deviceID :",deviceId)
        var client = {
            socket: ws,
            deviceId: deviceId,
            role: role
        };

        //TODO: add a more secure way to log clients, maybe a private crypted code ?
        //TODO : refactor code to have something cleaner
        if (role == 'sensor') {
            client.deviceId = deviceId;
            _sensors[id] = client;
            _clients[id] = client;

            sensorNodes.forEach(function each(node) {
                if (node.deviceid == deviceId) { //id is the sensor id

                    var _data = {
                        data: {
                            connected: true
                        },
                        sensorId: sensorId,
                        id: id
                    }
                    node.registration.handleEvent(SocketActions.SENSOR_CONNECT, _data);
                }
            });

            actuatorNodes.forEach(function each(actuator) {
                if (actuator.deviceid == deviceId) { //id is the sensor id
                    var _data = {
                        data: {
                            connected: true
                        },
                        sensorId: sensorId,
                        id: id
                    };
                    actuator.registration.handleEvent(SocketActions.SENSOR_CONNECT, _data);
                }
            });
            console.log("Sensor " + id + "(" + deviceId + ") connected");
        }
        //TODO : adapt to different node type with a detection for wrong node type
        //TODO : maybe use scopes on login

        ws.on(SocketActions.NODE_DISCONNECT, function (message) {
            if (role == 'node') {
                delete _clients[id];
                console.log("Node " + id + " disconnected or redeployed");
                ws.disconnect(); //each time the node is moved or deleted a new one is created so we close the connexion
            }
        });

        ws.on(SocketActions.TEST_ACTION, function (message) {
            if (role == 'sensor') {
                var nodes = Object.keys(_nodes);
                nodes.forEach(function each(node) {
                    if (node.sensorId == sensorId) { //id is the sensor id
                        node.socket.emit(SocketActions.TEST_ACTION, message);
                    }
                })
            }
        });

        ws.on(SocketActions.SENSOR_EMIT, function (message) {
            if (role == 'sensor') {
                var socket_io_data = {
                    'device_id': null,
                    'sensor_type': null,
                    'sensor_id': null,
                    'sensor_value': 0
                };



                var data = JSON.parse(message);
                var type = data['sensor_type'];

                sensorNodes.forEach(function each(node) {
                    if ((node.deviceId == deviceId && node.nodeType == 'global_sensor') || node.nodeType == 'global_all_sensor') { //id is the sensor id
                        node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                    }
                });

                /**
                 * AIR
                 **/
                if (type == 'air_pressure') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_pressure') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_co2') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_co2') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_o3' || type == 'air_co') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_co') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_ch4') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_ch4') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_temperature') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_temperature') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_humidity') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_air_humidity') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * LIGHT
                 **/
                else if (type == 'light_par') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_light_par') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_light_dli') { //id is the sensor id
                            if (!DLIStore.hasDLI(node.deviceId)) {
                                DLIStore.addDLI(node.deviceId);
                            }
                            DLIStore.addValueToDLI(node.deviceId, data.sensor_value, (value) => {

                            });
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                /*else if (type == 'light_lux') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_light_lux') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }

                    });
                }*/
                /*else if (type == 'light_dli') {
                 nodes.forEach(function each(node) {
                 if (node.sensorId == sensorId && node.nodeType == 'sensor_light_dli') { //id is the sensor id
                 node.socket.emit(SocketActions.UPDATE_DATA, message);
                 }
                 });
                 }*/
                else if (type == 'light_uv') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_light_uv') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * WATER
                 **/
                else if (type == 'water_temperature') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_water_temperature') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_ph') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_water_ph') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_ec') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_water_ec') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_orp') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_water_orp') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_do') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_water_do') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * SOIL
                 **/
                else if (type == 'moisture') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_soil_moisture') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'soil_temperature') {
                    sensorNodes.forEach(function each(node) {
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_soil_temperature') { //id is the sensor id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * RELAY
                 **/

                else if (type.match(/^relay(\d+)$/g)) {
                    var relayId = Number.parseInt(type.match(/\d+/g));
                    sensorNodes.forEach(function each(node) {

                        //console.log(node.sensorId ,sensorId , node.nodeType,node.relayId,relayId);
                        if (node.deviceId == deviceId && node.nodeType == 'sensor_actuator' && node.relayId == relayId) { //id is the relay id
                            node.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }

                    });

                    actuatorNodes.forEach(function each(actuator) {

                        if (actuator.deviceId == deviceId && actuator.nodeType == 'global_actuator' && actuator.relayId == relayId) { //id is the relay id
                            actuator.registration.handleEvent(SocketActions.UPDATE_DATA, message);
                        }

                    });
                }

            }
        });

        ws.on(SocketActions.TEST_EMIT_ACTION, function (message) {
            //console.log("sent")
        });


        ws.on('disconnect', function () {
            delete _clients[id];
            sensorNodes.forEach(function each(node) {
                if (node.deviceId == deviceId) { //id is the sensor id
                    var _data = {
                        data: {
                            disconnected: true
                        },
                        deviceId: deviceId,
                        id: id
                    }
                    node.registration.handleEvent(SocketActions.SENSOR_DISCONNECT, _data);
                }
            });

            actuatorNodes.forEach(function each(actuator) {
                if (actuator.deviceId == deviceId) { //id is the sensor id
                    var _data = {
                        data: {
                            disconnected: true
                        },
                        deviceId: deviceId,
                        id: id
                    }
                    actuator.registration.handleEvent(SocketActions.SENSOR_DISCONNECT, _data);
                }
            });

            delete _sensors[id];
            delete _clients[id];
            console.log("Sensor " + id + " disconnected");
        });

        ws.on('sensor-receive', function (data) {
            var sensors = Object.keys(_sensors);
            sensors.forEach(function each(sensor) {
                if (_sensors[sensor].deviceId == deviceId) { //id is the sensor id
                    _sensors[sensor].socket.emit('sensor-receive', JSON.stringify(data));
                }
            });
        });
    }
}

function getInstance() {
    if (instance == null) instance = new SocketServer();
    return instance;
}

module.exports = getInstance();
