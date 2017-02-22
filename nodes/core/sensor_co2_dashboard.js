// node-red input binding for sensor-co2;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname+'/socketServer/SocketActions');
    var nodeName = "sensor_co2_dashboard";


    // The main node definition - most things happen in here
    function sensorCo2DashboardNode(n) {

        var socket = require('socket.io-client')('http://127.0.0.1:80/');
        socket.on('connect', function(){
            console.log("CO2 node connected to dashboard");
        });

        socket.on('connect_error', function(error){
            console.log(error);
        });
        socket.emit("hello");

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
            node.warn("I saw a payload: " + msg.payload);
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
    RED.nodes.registerType(nodeName, sensorCo2DashboardNode);

}
