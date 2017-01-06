// node-red input binding for smartagriculture-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");


    // The main node definition - most things happen in here
    function QueryCheckRelayNode(n) {
        var table = {
            "get-switch": "SELECT * FROM predictablefarm.relaystate WHERE device_id=\'%device_id%\' AND sensor_type = \'%sensor_type%\';",
            "save-switch": "INSERT INTO predictablefarm.relaystate (device_id, sensor_type,sensor_id, sensor_value, last_update)VALUES( \'%device_id%\',\'%sensor_type%\', \'%sensor_id%\',%sensor_value%, dateof(now()) ) USING TIMESTAMP;",
            "save-sensor": "INSERT INTO predictablefarm.sensorLog (device_id, sensor_id, sensor_type, sensor_value, created_at)VALUES(\' %device_id%\',\',%sensor_id%\',\',%sensor_type%\',\'%sensor_value%\', dateof(now()) ) USING TIMESTAMP;"
        };

        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.check = n.check;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        if (!this.check == '') {
            var socket_io_data = {
                'device_id': null,
                'sensor_type': null,
                'sensor_id': null,
                'sensor_value': null
            };
            this.on('input', function (msg) {
                if (Array.isArray(msg.payload) && msg.payload.length ==1){
                    var value = msg.payload[0].sensor_value;
                    var sensor;
                    if (msg.sensor_value == 2){
                        sensor = 1;
                    }
                    else if(msg.sensor_value < 2){
                        sensor = 0;
                    }
                    var check;
                    if (node.check == 'auto'){
                        check = 1;
                    }
                    else if (node.check == 'manual'){
                        check = 0;
                    }

                    if ( (1-sensor == check) && (value == check) ){
                        msg.payload = msg.payload[0];
                        msg.payload = JSON.parse(JSON.stringify(msg.payload));//used to remove the type 'Row'
                        msg.payload.sensor_value = 1-value;
                        delete msg.payload.last_update; //not useful and will create problems
                        delete msg.topic;
                        node.send(msg);
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
    RED.nodes.registerType("query_check_relay", QueryCheckRelayNode);

}
