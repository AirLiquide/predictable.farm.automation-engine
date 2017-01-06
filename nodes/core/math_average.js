// node-red input binding for smartagriculture-humidity;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");


    // The main node definition - most things happen in here
    function MathAverageNode(n) {

        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.amount = n.amount;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        if (!this.amount == ''){
            var table = [];
            this.on('input', function (msg) {
                if (typeof msg.payload == 'number'){
                    table.push(msg.payload);
                }
                else if(Array.isArray(msg.payload)){
                    var valid = true;
                    msg.payload.forEach(function (m){
                        if (!typeof msg.payload == 'number')
                        {
                            valid = false;
                        }
                    });
                    if (valid){
                        msg.payload.forEach(function (m){
                            table.push(m);
                        });
                    }
                    else{
                        node.error("All values must be a Number")
                    }
                }
                else{
                    node.error("Payload must be a Number")
                }
                if (table.length >= node.amount){
                    var total = 0;
                    for(var i = 0; i < table.length; i++) {
                        total += table[i];
                    }
                    var avg = total / table.length;
                    msg.payload = avg;
                    table =[];
                    node.send(msg)
                }


            });

            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
            });
        }
        else{

        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("math_average", MathAverageNode);

}
