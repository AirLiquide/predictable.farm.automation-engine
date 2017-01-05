// node-red input binding for smartenvpro-cO


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname+'/socketServer/SocketActions');
    var WsEventHandler = require(__dirname+'/socketServer/WsEventHandler');
    var SocketServer = require(__dirname+'/socketServer/SocketServer');
    var nodeName = "smartenvpro_co";

    // The main node definition - most things happen in here
    function SmartEnvProCONode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceid = n.deviceid;
        this.timeout = n.timeout*1000;//convert seconds to milliseconds.

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        if (!this.deviceid == '') {
            this.status({fill: "gray", shape: "ring", text: "disconnected"});
            var ws = new WsEventHandler(node, 'http://localhost:8080/','role=node&sensorId=' + node.deviceid + "&node_type=" + nodeName);

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
                var _data ={
                    data:{
                        disconnected: true
                    }
                }
                ws.getSocket().emit(SocketActions.NODE_DISCONNECT,_data);
            });

        }
        else {
            this.status({fill: "red", shape: "ring", text: "No ID specified"});
        }
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName,SmartEnvProCONode);

}
