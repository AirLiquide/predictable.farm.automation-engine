// node-red input binding for sensor_light_lux


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require('../../.././utils/SocketActions');
    var WsEventHandler = require('../../.././utils/WsEventHandler');
    var SocketServer = require('../../.././utils/SocketServer');
    var NodeRegister = require('../../.././utils/NodeRegister');
    var nodeName = "sensor_light_lux";

    // The main node definition - most things happen in here
    function sensorParNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        this.nodeType = nodeName;

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceId = n.deviceid;
        this.timeout = n.timeout*1000;//convert seconds to milliseconds.

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        if (!this.deviceId == ''){
            this.status({fill:"gray",shape:"ring",text:"not found"});
            this.registration = new NodeRegister(this);

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
        else{
            this.status({fill:"red",shape:"ring",text:"No ID specified"});
        }
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    //RED.nodes.registerType(nodeName,sensorParNode);

}
