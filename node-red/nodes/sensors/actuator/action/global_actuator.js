// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require('../../../../src/utils/SocketActions');
    var WsEventHandler = require('../../../../src/utils/WsEventHandler');
    var SocketServer = require('../../../../src/utils/SocketServer');
    var NodeRegister = require('../../../../src/utils/NodeRegister');
    var RelayStateHandler = require('../../../../src/utils/RelayStateHandler');
    var nodeName = "global_actuator";


    // The main node definition - most things happen in here
    function GlobalActuator(n) {

        //TODO: add a timeout field and get the value to enable the detection of crashes

        // Create a RED node
        RED.nodes.createNode(this, n);

        this.nodeType = nodeName;

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceId = n.deviceid;
        this.relayId = n.relaynumber;
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

        //console.log(this.deviceId);

        if (this.deviceId != '') {
            this.registration = new NodeRegister(this);
            this.status({fill: "gray", shape: "ring", text: "disconnected"});
            //var ws = new WsEventHandler(node, 'http://localhost:3000', 'role=actuator&sensorId=' + node.deviceId + "&node_type=" + nodeName + "&relayId="+ node.relayId,nodeName);

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

                if (true || msg.valid){
                    if (RelayStateHandler.hasRelayState(node.deviceId,'relay'+node.relayId) && RelayStateHandler.getRelayState(node.deviceId,'relay'+node.relayId)){
                        var mymsg = {
                            device_id: node.deviceId,
                            sensor_type: 'relay' + node.relayId,
                            sensor_value: null
                        };

                        if (this.value == -1){
                            if (msg.payload.relayValue){
                                mymsg.sensor_value= msg.payload.relayValue;
                                //ws.getSocket().emit('sensor-receive', mymsg/* msg.payload*/);
                                this.registration.sendToSensor(mymsg,node.deviceId);
                            }
                            else{
                                node.alert("No value to send");
                            }

                        }
                        else{
                            if (/*isValid*/true) {
                                //console.log("actuator command valid :)");
                                mymsg.sensor_value= this.value;
                                //  msg.payload.sensor_type ='relay1';//'relay'+node.relayId;
                                // msg.payload.sensor_value =0; //node.value;
                                //console.log(JSON.stringify(mymsg));
                                //ws.getSocket().emit('sensor-receive', mymsg/* msg.payload*/);
                                this.registration.sendToSensor(mymsg,node.deviceId);

                            } else {
                                //console.log("actuator command invalid");
                            }
                        }
                    }

                }
            });

            this.on("close", function () {
                this.registration.disconnect();
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
