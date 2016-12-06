// node-red input binding for smartagriculture-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var SocketActions = require('/root/.node-red/nodes/socketServer/SocketActions');
    var WsEventHandler = require('/root/.node-red/nodes/socketServer/WsEventHandler');
    var SocketServer = require('/root/.node-red/nodes/socketServer/SocketServer');
    var nodeName = "smartagriculture_humidity";

    // The main node definition - most things happen in here
    function SmartAgriculturehumidityNode(n) {

        //console.log(server)

        //var wss = require('./socketServer/SocketServer')(RED);
        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.deviceid = n.deviceid;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        var msg = {};
        msg.deviceid = this.deviceid;

        if (!this.deviceid == ''){
            this.status({fill:"gray",shape:"ring",text:"disconnected"});
            var ws = new WsEventHandler(node,'ws://localhost:8081/?role=node&sensorId='+node.deviceid+"&node_type="+nodeName);

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
                    type:SocketActions.NODE_DISCONNECT,
                    data:{
                        disconnected: true
                    }
                }
                ws.getSocket().send(JSON.stringify(_data));

            });





/*            ws.on('open', function open() {
                //ws.send(JSON.stringify({message: 'something'}));
                console.log("connected to server")

            });

            ws.on('message', function (data, flags) {

                var data = JSON.parse(data);
                var _data = {
                    payload : data
                }
                if(data.type === SocketActions.SENSOR_DISCONNECT){
                    console.log("Sensor disconnected")
                    node.status({fill:"gray",shape:"ring",text:"disconnected"});
                    node.send([null,null,_data]);
                }
                if(data.type === SocketActions.SENSOR_CONNECT){
                    console.log("Sensor connected")
                    node.status({fill:"green",shape:"ring",text:"connected"});
                    node.send([null,null,_data]);
                }
                else
                    node.send([_data,null,null]);
                // flags.binary will be set if a binary data is received.
                // flags.masked will be set if the data was masked.
            });

            ws.on('close', function close() {
                console.log("disconnected");
            });*/
        }
        else{
            console.log("RED")
            this.status({fill:"red",shape:"ring",text:"No ID specified"});
        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, SmartAgriculturehumidityNode);

}
