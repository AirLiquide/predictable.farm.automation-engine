// node-red input binding for sensor_light_dli


module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require('../../../../src/utils/SocketActions');
    var WsEventHandler = require('../../../../src/utils/WsEventHandler');
    var SocketServer = require('../../../../src/utils/SocketServer');
    var NodeRegister = require('../../../../src/utils/NodeRegister');
    var DLIStore = require('../../../../src/utils/DLIStore');
    var schedule = require('node-schedule');
    var nodeName = "sensor_light_dli";


    // The main node definition - most things happen in here
    function sensorLightDliNode(n) {
        // Create a RED node
        RED.nodes.createNode(this, n);

        this.nodeType = nodeName;

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceId = n.deviceid;
        this.timeout = n.timeout * 1000;//convert seconds to milliseconds.

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        this.dli = 0;

        this.lastValueTime = Date.now();

        this.addDLI = function (message) {

            DLIStore.addValueToDLI(node.deviceId, message.sensor_value, (value) => {

                console.log(value);
                node.dli = (value / 1000000).toFixed(2);
                var msg = {
                    sensor_value : node.dli.toString(),
                    sensor_type : 'light_dli',
                    device_id : node.deviceId
                };
                node.send(msg);
                node.status({fill: "green", shape: "dot", text: node.deviceId + " / Value : " + node.dli});
            });
        };


        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        if (!this.deviceId == '') {

            if (DLIStore.hasDLI(this.deviceId)) {
                this.dli = DLIStore.getDLI(this.deviceId);
            }
            else {
                DLIStore.addDLI(this.deviceId);
            }
            this.status({fill: "gray", shape: "ring", text: "not found"});
            this.registration = new NodeRegister(this);

            schedule.scheduleJob('0 0 * * *', () => {
                node.dli = 0;
            });

            // respond to inputs....
            this.on('input', function (msg) {
                node.warn("I saw a payload: " + msg.payload);
                // in this example just send it straight on... should process it here really
                //node.send(msg);
            });

            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
                this.registration.disconnect();
            });

        }
        else {
            this.status({fill: "red", shape: "ring", text: "No ID specified"});
        }
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, sensorLightDliNode);

}
