// node-red input binding for math_inferior;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function MathInferiorEqualNode(n) {

        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.value = n.value;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        if (!this.value == ''){
            this.on('input', function (msg) {
                var data;

                if (msg.payload.sensor_value)
                    data = msg.payload.sensor_value;
                else
                    data = msg.payload;

                if (typeof data == "string"){
                    data = data.replace(',','.').replace(' ','');
                }
                this.value = this.value.replace(',','.').replace(' ','');

                if (!isNaN(data)){
                    data = Number.parseFloat(data);
                    if (data <= Number.parseFloat(this.value) ){
                        msg.sender = node.id;
                        msg.valid = true;
                        node.send(msg);
                    }
                    else{
                        node.send({valid:false,sender :node.id});
                    }
                }
                else{
                    node.error("Payload must be a Number")
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
    RED.nodes.registerType("math_inferior_equal", MathInferiorEqualNode);

}
