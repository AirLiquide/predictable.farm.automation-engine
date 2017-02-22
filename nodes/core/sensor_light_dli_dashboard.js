// node-red input binding for sensor-par;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname+'/socketServer/SocketActions');
    var DashBoardSocket = require(__dirname+'/socketServer/DashBoardSocket');
    var nodeName = "sensor_light_dli_dashboard";


    // The main node definition - most things happen in here
    function sensorLightDliDashboardNode(n) {

        var socket = new DashBoardSocket("Light DLI");

        //console.log(server)

        //var wss = require(__dirname+'/socketServer/SocketServer')(RED);
        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)

        // maybe add an option to choose between milliseconds, seconds, minutes

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        this.on('input', function (msg) {
            socket.emit("sensor-emit",msg.payload);
            // in this example just send it straight on... should process it here really
            //node.send(msg);
        });

        this.on("close", function () {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });


    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, sensorLightDliDashboardNode);

}
