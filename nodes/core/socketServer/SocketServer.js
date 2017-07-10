/**
 * Created by ilab on 30/11/16.
 */
"use strict";
/**
 * Created by ilab on 01/12/16.
 */

var SocketActions = require(__dirname+'/SocketActions');

var url = require('url');

var io = require('socket.io').Server;

var server = null;

var _clients = {};
var _nodes = {}; //might be removed to save memory, useful to fast iterate on nodes
var _sensors = {}; //might be removed to save memory, useful to fast iterate on sensors
var _actuators = {}; //might be removed to save memory, useful to fast iterate on sensors

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;


class SocketServer {
    constructor() {
        server = require('socket.io').listen(3000);
        _clients = {};
        _nodes = {};
        _sensors = {};
        //server.on('connection', this.handleConnection);
        server.on('connection', this.handleConnection);
        console.log("Socket Server started!");
        return this;
    }

    handleConnection(ws) {
        do
            var id = (1 + Math.random() * 4294967295).toString(16);
        while (_clients.hasOwnProperty(id));
        var role = ws.handshake.query.role;
        var client = {
            socket: ws,
            role: role
        }

        //TODO: add a more secure way to log clients, maybe a private crypted code ?
        if (role == 'node' || role == 'sensor' || role =='actuator') {
            //TODO : refactor code to have something cleaner
            if (role == 'node') {
                var sensorId = ws.handshake.query.sensorId;
                var nodeType = ws.handshake.query.node_type;
                client.sensorId = sensorId;
                client.nodeType = nodeType;
                _nodes[id] = client;
                _clients[id] = client;
                var sensors = Object.keys(_sensors);
                sensors.forEach(function each(sensor) {
                    if (_sensors[sensor].sensorId == sensorId) { //id is the sensor id
                        var _data = {
                            data: {
                                connected: true
                            },
                            sensorId: sensorId,
                            id: id
                        };
                        ws.emit(SocketActions.SENSOR_CONNECT, _data);
                    }
                });
                console.log("Node " + id + " connected");
            }
            else if (role == 'sensor'){
                var sensorId = ws.handshake.query.sensorId;
                client.sensorId = sensorId;
                _sensors[id] = client;
                _clients[id] = client;
                var nodes = Object.keys(_nodes);

                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId) { //id is the sensor id

                        var _data = {
                            data: {
                                connected: true
                            },
                            sensorId: sensorId,
                            id: id
                        }
                        _nodes[node].socket.emit(SocketActions.SENSOR_CONNECT, _data);
                    }
                });

                var actuators = Object.keys(_actuators);
                actuators.forEach(function each(actuator) {
                    if (_actuators[actuator].sensorId == sensorId) { //id is the sensor id
                        var _data = {
                            data: {
                                connected: true
                            },
                            sensorId: sensorId,
                            id: id
                        };
                        _actuators[actuator].socket.emit(SocketActions.SENSOR_CONNECT, _data);
                    }
                });
                console.log("Sensor " + id + "(" + sensorId + ") connected");
            }

            else if (role == 'actuator'){
                var sensorId = ws.handshake.query.sensorId;
                var nodeType = ws.handshake.query.node_type;
                var relayId = ws.handshake.query.relayId;

                client.relayId = relayId;

                client.sensorId = sensorId;
                client.nodeType = nodeType;
                _actuators[id] = client;
                _clients[id] = client;
                var sensors = Object.keys(_sensors);
                sensors.forEach(function each(sensor) {
                    if (_sensors[sensor].sensorId == sensorId) { //id is the sensor id
                        var _data = {
                            data: {
                                connected: true
                            },
                            sensorId: sensorId,
                            id: id
                        };
                        ws.emit(SocketActions.SENSOR_CONNECT, _data);
                    }
                });
                console.log("Actuator " + id + "(" + sensorId + ") connected");
            }
            //TODO : adapt to different node type with a detection for wrong node type
            //TODO : maybe use scopes on login
        }

        ws.on(SocketActions.NODE_DISCONNECT, function (message) {
            if (role == 'node') {
                delete _nodes[id];
                delete _clients[id];
                console.log("Node " + id + " disconnected or redeployed");
                ws.disconnect(); //each time the node is moved or deleted a new one is created so we close the connexion
            }
        });

        ws.on(SocketActions.TEST_ACTION, function (message) {
            if (role == 'sensor') {
                var nodes = Object.keys(_nodes);
                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId) { //id is the sensor id
                        _nodes[node].socket.emit(SocketActions.TEST_ACTION, message);
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
                var nodes = Object.keys(_nodes);

                nodes.forEach(function each(node) {
                    if (_nodes[node].nodeType == 'global_all_sensor') { //id is the sensor id
                        _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                    }
                });

                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'global_sensor') { //id is the sensor id
                        _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                    }
                });

                /**
                 * AIR
                **/
                if (type == 'air_pressure') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_pressure') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_co2') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_co2') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_o3' || type == 'air_co') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_co') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_ch4') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_ch4') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_temperature') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_temperature') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'air_humidity') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_air_humidity') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * LIGHT
                **/
                else if (type == 'light_par') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_light_par') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'light_lux') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_light_lux') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_light_dli') { //id is the sensor id
                            _nodes[node].addDLI(message);
                        }
                    });
                }
                /*else if (type == 'light_dli') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_light_dli') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }*/
                else if (type == 'light_uv') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_light_uv') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * WATER
                **/
                else if (type == 'water_temperature') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_water_temperature') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_ph') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_water_ph') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_ec') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_water_ec') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_orp') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_water_orp') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'water_do') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_water_do') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * SOIL
                **/
                else if (type == 'moisture') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_soil_moisture') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'soil_temperature') {
                    nodes.forEach(function each(node) {
                        if (_nodes[node].sensorId == sensorId && _nodes[node].nodeType == 'sensor_soil_temperature') { //id is the sensor id
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }

                /**
                 * RELAY
                **/

                //TODO not working to detect the relaynumber
                else if (type.match(/^relay(\d+)$/g)) {
                    var relayId = Number.parseInt(type.match(/\d+/g));
                    nodes.forEach(function each(node) {
                        var node = _nodes[node];

                        console.log(node);
                        //console.log(node.sensorId ,sensorId , node.nodeType,node.relayId,relayId);
                        if (node.sensorId == sensorId && node.nodeType == 'sensor_actuator' && node.relaynumber == relayId) { //id is the relay id
                            console.log("sensor :", id);
                            _nodes[node].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                /*else if (type == 'relay2') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 2) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay3') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 3) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay4') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 4) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay5') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 5) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay6') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 6) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay7') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 7) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }
                else if (type == 'relay8') {
                    actuators.forEach(function each(actuator) {
                        if (_actuators[actuator].sensorId == sensorId && _actuators[actuator].nodeType == 'global_actuator' && _actuators[actuator].relayId == 8) { //id is the sensor id
                            _actuators[actuator].socket.emit(SocketActions.UPDATE_DATA, message);
                        }
                    });
                }*/

            }
        });

        ws.on(SocketActions.TEST_EMIT_ACTION, function (message) {
            //console.log("sent")
        });


        ws.on('disconnect', function () {
            delete _clients[id];
            if (role == 'node') {
                delete _nodes[id];
                delete _clients[id];
                console.log("Node " + id + " disconnected");
            }
            else if (role == 'actuator') {
                delete _actuators[id];
                delete _clients[id];
                console.log("Actuator " + id + " disconnected");
            }
            else {
                var nodes = Object.keys(_nodes);
                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId) { //id is the sensor id
                        var _data = {
                            data: {
                                disconnected: true
                            },
                            sensorId: sensorId,
                            id: id
                        }
                        _nodes[node].socket.emit(SocketActions.SENSOR_DISCONNECT, _data);
                    }
                });

                var actuators = Object.keys(_actuators);
                actuators.forEach(function each(actuator) {
                    if (_actuators[actuator].sensorId == sensorId) { //id is the sensor id
                        var _data = {
                            data: {
                                disconnected: true
                            },
                            sensorId: sensorId,
                            id: id
                        }
                        _actuators[actuator].socket.emit(SocketActions.SENSOR_DISCONNECT, _data);
                    }
                });

                delete _sensors[id];
                delete _clients[id];
                console.log("Sensor " + id + " disconnected");
            }
        });

        ws.on('sensor-receive', function (data) {
            var sensors = Object.keys(_sensors);
            sensors.forEach(function each(sensor) {
                if (_sensors[sensor].sensorId == sensorId) { //id is the sensor id
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
