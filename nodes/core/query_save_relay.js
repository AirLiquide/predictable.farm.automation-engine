// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var CassandraConnection = require(__dirname + '/socketServer/CassandraConnection');

    // The main node definition - most things happen in here
    function QuerySaveRelayNode(n) {
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

        var socket_io_data = {
            'device_id': null,
            'sensor_type': null,
            'sensor_id': null,
            'sensor_value': null
        };

        this.on('input', function (msg) {
            var regex = /^relay\d+/g;

            var aKeys = Object.keys(socket_io_data).sort();
            var bKeys = Object.keys(msg.payload).sort();
            var isValid = ( (JSON.stringify(aKeys) === JSON.stringify(bKeys))
            && (msg.payload.sensor_value == 0 || msg.payload.sensor_value == 1)
            && (regex.test(msg.payload.sensor_type) ) );

            var checkRes = function (res) {

            }

            if (isValid) {
                var query = "INSERT INTO predictablefarm.relaystate " +
                    "(device_id, sensor_type,sensor_id, sensor_value, last_update)" +
                    "VALUES( \'%device_id%\',\'%sensor_type%\', \'%sensor_id%\',%sensor_value%, dateof(now()) ) " +
                    "USING TIMESTAMP;";

                query = query.replace(/%device_id%/, msg.payload['device_id'])
                    .replace(/%sensor_type%/, msg.payload['sensor_type'])
                    .replace(/%sensor_id%/, msg.payload['sensor_id'])
                    .replace(/%sensor_value%/, msg.payload['sensor_value']);

                CassandraConnection.exectQuery(query, msg, checkRes);
            }
            else {
                node.error("Invalid data given, please check your flow.")
            }

        });

        this.on("close", function () {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("query_save_relay", QuerySaveRelayNode);

}
