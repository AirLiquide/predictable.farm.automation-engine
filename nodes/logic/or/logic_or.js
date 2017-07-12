// node-red input binding for logic_or;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");


    // The main node definition - most things happen in here
    function LogicOrNode(n) {

        // Create a RED node
        RED.nodes.createNode(this, n);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");
        node.entries = [];

        RED.nodes.eachNode(function(n){
            //if(node.wires && node.wires[0])
            //console.log(node.wires[0][0])

            if(n.wires && n.wires[0]){
                var i = n.wires[0].indexOf(node.id);
                if (i >=0){
                    node.entries.push(n.id);
                }

            }

        });

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

            this.on('input', function (msg) {

                //console.log(node.lastData[msg.sender])
                if (msg.sender && msg.valid && node.entries.indexOf(msg.sender) !=-1){
                        node.send({
                            sender:node.id
                        });
                }
                if (!msg.sender){
                    node.alert("Invalid tool linked with " + node.type + " !");
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
    RED.nodes.registerType("logic_or", LogicOrNode);

}
