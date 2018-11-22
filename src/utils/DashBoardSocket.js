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

"use strict"

const crypto = require('crypto');
var socketClient = require('socket.io-client');

var cloudAddress = null
var SocketServer = require('./SocketServer');
var RelayStateHandler = require('./RelayStateHandler');

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
        this.socket = socketClient('http://dashboard:80/');

        this.cloudSocket = false;
        if(cloudAddress){
            this.cloudSocket = socketClient(cloudAddress, {
                query: "farmId=" + farmID
            });
        }
        this.socket.on('connect', function () {
            console.log("Node-RED connected to dashboard");
        });

        this.socket.on('connect_error', function (error) {
            //console.log(error);
        });

        this.socket.on('sensor-receive', function (msg) {

            var data = JSON.parse(msg);
            console.log(msg);
            var socket_io_data = {
                'device_id': null,
                'sensor_type': null,
                'sensor_id': null,
                'sensor_value': 0
            };

            SocketServer.sendToSensor(msg,data.device_id);
            RelayStateHandler.updateRelay(data.device_id,data.sensor_type, '1');

            /*
            var aKeys = Object.keys(socket_io_data).sort();
            var bKeys = Object.keys(msg).sort();
            var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

            var actuators = Object.keys(_actuators);


            actuators.forEach(function each(actuator) {

                var node = _actuators[actuator];

                if (node.deviceid == msg.device_id){
                    node.send({
                        payload: msg
                    });
                }
                // in this example just send it straight on... should process it here really
                //node.send(msg);
            });*/
        });
        this.socket.emit("hello");


        if(cloudAddress){
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

                  var data = JSON.parse(msg);
                  var type = data.sensor_type;

                  var aKeys = Object.keys(socket_io_data).sort();
                  var bKeys = Object.keys(msg).sort();
                  var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

                  var actuators = Object.keys(_actuators);

                  if (type.match(/^relay(\d+)$/g)) {
                      SocketServer.sendToSensor(msg,data.device_id)
                  }

                  actuators.forEach(function each(actuator) { //might be removed
                      var node = actuators[actuator];

                      if (isValid && node.deviceid == msg.device_id){
                          node.send({
                              payload: msg
                          });
                      }
                  });
              });

          });
      }
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

        sendWeatherToDashboard(weather){
            this.emit("update-weather",weather);
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

    module.exports = getInstance();
