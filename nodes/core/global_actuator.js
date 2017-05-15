// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname + '/socketServer/SocketActions');
    var WsEventHandler = require(__dirname + '/socketServer/WsEventHandler');
    var SocketServer = require(__dirname + '/socketServer/SocketServer');
    var nodeName = "global_actuator";


    // The main node definition - most things happen in here
    function GlobalActuator(n) {

        //TODO: add a timeout field and get the value to enable the detection of crashes

        //console.log(server)

        //var wss = require(__dirname+'/socketServer/SocketServer')(RED);
        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceid = n.deviceid;
        this.relaynumber = n.relaynumber;
        this.value = n.value;
        this.timeout = n.timeout*1000;//convert seconds to milliseconds.
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
            this.status({fill: "gray", shape: "ring", text: "disconnected"});
            var ws = new WsEventHandler(node, 'http://localhost:3000', 'role=actuator&sensorId=' + node.deviceid + "&node_type=" + nodeName + "&relayId="+ node.relaynumber);


            this.on('input', function (msg) {

                var socket_io_data = {
                    'device_id': null,
                    'sensor_type': null,
                    'sensor_id': null,
                    'sensor_value': 0
                };

                //var aKeys = Object.keys(socket_io_data).sort();
                //var bKeys = Object.keys(msg.payload).sort();
                //var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

                if (/*isValid*/true) {
                    //console.log("actuator command valid :)");
                    var mymsg = {
                        device_id: this.deviceid,
                        sensor_type: 'relay' + node.relaynumber,
                        sensor_value: this.value
                    };
                    //  msg.payload.sensor_type ='relay1';//'relay'+node.relaynumber;
                    // msg.payload.sensor_value =0; //node.value;
                    //console.log(JSON.stringify(mymsg));
                    ws.getSocket().emit('sensor-receive', mymsg/* msg.payload*/);

                } else {
                    //console.log("actuator command invalid");
                }
                // in this example just send it straight on... should process it here really
                node.send(msg);
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
    RED.nodes.registerType(nodeName, GlobalActuator);

};
