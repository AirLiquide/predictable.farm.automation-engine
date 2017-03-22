// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require(__dirname+'/socketServer/SocketActions');
    var WsEventHandler = require(__dirname+'/socketServer/WsEventHandler');
    var SocketServer = require(__dirname+'/socketServer/SocketServer');
    var ActuatorDashBoardSocket = require(__dirname+'/socketServer/ActuatorDashBoardSocket');
    var DashBoardSocket = require(__dirname+'/socketServer/DashBoardSocket');
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
            DashBoardSocket.registerNode(this,nodeName);

            this.on("close", function () {
                DashBoardSocket.removeNode(this,nodeName);
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
