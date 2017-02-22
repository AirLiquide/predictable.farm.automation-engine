// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname+'/socketServer/SocketActions');
    var WsEventHandler = require(__dirname+'/socketServer/WsEventHandler');
    var SocketServer = require(__dirname+'/socketServer/SocketServer');
    var nodeName = "global_dashboard_actuator";


    // The main node definition - most things happen in here
    function GlobalDashboardActuator(n) {

        //console.log(server)

        //var wss = require(__dirname+'/socketServer/SocketServer')(RED);
        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceid = n.deviceid;
        // maybe add an option to choose between milliseconds, seconds, minutes

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;


        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        if (!this.deviceid == '') {
            var socket = require('socket.io-client')('http://localhost:8080/');
            socket.emit("hello");

            socket.on('update-relay', function (msg) {
                var socket_io_data = {
                    'device_id': null,
                    'sensor_type': null,
                    'sensor_id': null,
                    'sensor_value': 0
                };

                var aKeys = Object.keys(socket_io_data).sort();
                var bKeys = Object.keys(msg).sort();
                var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

                if (isValid && msg.sensor_value == node.deviceid) {
                    node.send({
                        payload:msg
                    });
                }
                // in this example just send it straight on... should process it here really
                //node.send(msg);
            });

            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
            });
        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, GlobalDashboardActuator);

};
