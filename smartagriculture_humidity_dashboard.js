// node-red input binding for smartagriculture-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions');
    var WsEventHandler = require('/root/.node-red/nodes/socketServer/WsEventHandler');
    var SocketServer = require('/root/.node-red/nodes/socketServer/SocketServer');
    var nodeName = "smartagriculture_humidity_dashboard";

    // The main node definition - most things happen in here
    function SmartAgriculturehumidityNode(n) {

        //console.log(server)

        //var wss = require('./socketServer/SocketServer')(RED);
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


    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, SmartAgriculturehumidityNode);

}
