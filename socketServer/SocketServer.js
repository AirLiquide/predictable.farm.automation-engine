/**
 * Created by ilab on 30/11/16.
 */
"use strict";
/**
 * Created by ilab on 01/12/16.
 */

var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions');

var url = require('url');

var WebSocketServer = require('/usr/local/lib/node_modules/node-red/node_modules/ws').Server;

var _clients = {};
var _nodes = {}; //might be removed to save memory, useful to fast iterate on nodes
var _sensors = {}; //might be removed to save memory, useful to fast iterate on sensors
var server = null;

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;
class SocketServer {
    constructor() {
        // Create a WebSocket Server
        server = new WebSocketServer({port: 8081});
        _clients = {};
        _nodes = {};
        _sensors = {};
        server.on('connection', this.handleConnection);
        console.log("Socket Server started!")
        return this;
    }

    handleConnection(ws) {
        do
            var id = (1 + Math.random() * 4294967295).toString(16);
        while (_clients.hasOwnProperty(id));
        var location = url.parse(ws.upgradeReq.url, true);
        var role = location.query.role;
        var client = {
            socket: ws,
            role: role
        }

        //TODO: add a more secure way to log clients, maybe a private crypted code ?
        if (role == 'node' || role == 'sensor') {
            //TODO : refactor code to have something cleaner
            if (role == 'node') {
                var sensorId = location.query.sensorId;
                var nodeType = location.query.node_type;
                client.sensorId = sensorId;
                client.nodeType = nodeType;
                _nodes[id] = client;
                _clients[id] = client;
                var sensors = Object.keys(_sensors);
                sensors.forEach(function each(sensor) {
                    if (_sensors[sensor].sensorId == sensorId) { //id is the sensor id
                        var _data ={
                            type:SocketActions.SENSOR_CONNECT,
                            data:{
                                connected: true
                            },
                            sensorId:sensorId,
                            id:id
                        };
                        ws.send(JSON.stringify(_data));
                    }
                });
                console.log("Node " + id + " connected");
            }
            else {
                var sensorId = location.query.sensorId;
                client.sensorId = sensorId;
                _sensors[id] = client;
                _clients[id] = client;
                var nodes = Object.keys(_nodes);
                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId) { //id is the sensor id

                        var _data ={
                            type:SocketActions.SENSOR_CONNECT,
                            data:{
                                connected: true
                            },
                            sensorId:sensorId,
                            id:id
                        }
                        _nodes[node].socket.send(JSON.stringify(_data));

                    }
                });
                console.log("Sensor " + id + "(" + sensorId + ") connected");
            }
            //TODO : adapt to different node type with a detection for wrong node type
            //TODO : maybe use scopes on login
        }

        ws.on('message', function (message) {

            var data = JSON.parse(message);
            if (role == 'node') {
                if (data.type == SocketActions.NODE_DISCONNECT){
                    delete _nodes[id];
                    delete _clients[id];
                    console.log("Node " + id + " disconnected or redeployed");
                    ws.close(); //each time the node is moved or deleted a new one is created so we close the connexion
                }
                //console.log("SERVER :", data)
            }
            else if (role == 'sensor') {

                var _data = JSON.stringify(data);
                //maybe find a more optimized data structure for later use if we start to have a lot of nodes
                //_nodes[node].socket.send(_data);


            }
        });

        ws.on('close', function () {
            delete _clients[id];
            if (role == 'node') {
                delete _nodes[id];
                delete _clients[id];
                console.log("Node " + id + " disconnected");
            }
            else {
                var nodes = Object.keys(_nodes);
                nodes.forEach(function each(node) {
                    if (_nodes[node].sensorId == sensorId) { //id is the sensor id
                        var _data ={
                            type:SocketActions.SENSOR_DISCONNECT,
                            data:{
                                disconnected: true
                            },
                            sensorId:sensorId,
                            id:id
                        }
                        _nodes[node].socket.send(JSON.stringify(_data));

                    }
                });

                delete _sensors[id];
                delete _clients[id];
                console.log("Sensor " + id + " disconnected");
            }
        })
    }
}

function getInstance() {
    if (instance == null) instance = new SocketServer();
    return instance;
}

module.exports = getInstance();
