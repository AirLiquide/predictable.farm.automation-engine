// node-red input binding for smartagriculture-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");


    // The main node definition - most things happen in here
    function QueryPrepareNode(n) {
        var table = {
            "get-switch": "SELECT * FROM predictablefarm.relaystate WHERE device_id=\'%device_id%\' AND sensor_type = \'%sensor_type%\';",
            "save-switch": "INSERT INTO predictablefarm.relaystate (device_id, sensor_type,sensor_id, sensor_value, last_update)VALUES( \'%device_id%\',\'%sensor_type%\', \'%sensor_id%\',%sensor_value%, dateof(now()) ) USING TIMESTAMP;",
            "save-sensor": "INSERT INTO predictablefarm.sensorLog (device_id, sensor_id, sensor_type, sensor_value, created_at)VALUES(\' %device_id%\',\',%sensor_id%\',\',%sensor_type%\',\'%sensor_value%\', dateof(now()) ) USING TIMESTAMP;"
        };

        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.query = n.query;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        if (!this.query == '') {
            this.on('input', function (msg) {
                var socket_io_data = {
                    'device_id': null,
                    'sensor_type': null,
                    'sensor_id': null,
                    'sensor_value': null
                };
                var isJSON = true;
                try {
                    if (msg.payload instanceof String) {
                        msg.payload = JSON.parse(msg.payload);
                    }
                }
                catch (e) {
                    node.error("ERROR : The given JSON isn't correctly formatted : " + msg);
                    var isJSON = false;
                }

                if (isJSON) {
                    var aKeys = Object.keys(socket_io_data).sort();
                    var bKeys = Object.keys(msg.payload).sort();
                    var isValid = JSON.stringify(aKeys) === JSON.stringify(bKeys);

                    if (isValid) {
                        //replace the values according to the query.
                        //TODO : find a more optimized way maybe
                        var str = table[this.query];
                        str = str.replace(/%device_id%/, msg.payload['device_id'])
                            .replace(/%sensor_type%/, msg.payload['sensor_type'])
                            .replace(/%sensor_id%/, msg.payload['sensor_id'])
                            .replace(/%sensor_value%/, msg.payload['sensor_value']);
                        msg.topic = str;
                        node.send(msg);
                    }
                    else {
                        node.error("ERROR : wrong object given")
                    }
                }
            });

            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
            });
        }
        else {

        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("query_prepare", QueryPrepareNode);

}
