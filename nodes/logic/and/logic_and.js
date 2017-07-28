// node-red input binding for logic_and;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");


    // The main node definition - most things happen in here
    function LogicAndNode(n) {

        // Create a RED node
        RED.nodes.createNode(this, n);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");
        node.entries = [];
        node.lastData = {}

        RED.nodes.eachNode(function(n){
            //if(node.wires && node.wires[0])
            //console.log(node.wires[0][0])

            if(n.wires && n.wires[0]){
                var i = n.wires[0].indexOf(node.id)
                if (i >=0){
                    node.entries.push(n.id)
                    node.lastData[n.id]= null;
                }

            }

        });

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

            this.on('input', function (msg) {

                //console.log(node.lastData[msg.sender])
                if (msg.sender && node.entries.indexOf(msg.sender) !=-1){
                    if (msg.valid){
                        node.lastData[msg.sender] = msg.payload;

                        var update = true;
                        for (var member in node.lastData) {
                            if (node.lastData[member] == null)
                                update = false;
                        }

                        if (update){
                            for (var member in node.lastData) {
                                node.lastData[member] = null;
                            }
                            node.send({
                                sender:node.id,
                                valid:true
                            });

                        }
                    }
                    else{
                        node.lastData[msg.sender] = null;
                    }
                }
                if (!msg.sender){
                    node.error("Invalid tool linked with " + node.type + " !");
                }
                //console.log(msg)
            });

            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
            });
        }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("logic_and", LogicAndNode);

}
