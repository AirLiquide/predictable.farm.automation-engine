// node-red input binding for sensor-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    var nodeName = "weather_temperature";
    var Weather = require('../../../src/utils/Weather');


    // The main node definition - most things happen in here
    function WeatherTemperature(n) {


        //console.log(server)

        //var wss = require(__dirname+'/../../src/utils/SocketServer')(RED);
        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.delay = parseInt(n.delay); //convert seconds to milliseconds.
        // maybe add an option to choose between milliseconds, seconds, minutes

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        console.log(node)


        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
    
        if (this.delay !== "") {
            Weather.registerNode(this, nodeName, n);
        }

        this.on("close", function () {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
            Weather.removeNode(this,nodeName)
        });

    }


    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(nodeName, WeatherTemperature);

};
