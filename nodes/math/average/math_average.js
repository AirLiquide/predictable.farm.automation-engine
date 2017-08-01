// node-red input binding for math_average;

module.exports = function (RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    var schedule = require('node-schedule');

    // The main node definition - most things happen in here
    function MathAverageNode(n) {

        // Create a RED node
        RED.nodes.createNode(this, n);

        // Store local copies of the node configuration (as defined in the .html)
        this.amount = n.amount;
        this.delayType = n.delayType;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
        node.path = n.path;
        node.wholemsg = (n.wholemsg === "true");

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....

        this.sendAverage = function(){
            var total = 0;
            for(var i = 0; i < table.length; i++) {
                total += table[i];
            }
            var avg = total / table.length;
            var msg ={
                payload : avg,
                sender: node.id
            }
            table =[];
            node.send(msg);
        }

        if (!(this.amount == '' || this.delayType=='')){
            var table = [];

                this.on('input', function (msg) {

                    var data;

                    if (msg.payload.sensor_value)
                        data = msg.payload.sensor_value;
                    else
                        data = msg.payload;

                    if (typeof data == 'number'){
                        table.push(data);
                    }
                    else if (!isNaN(data)){ //if string that can be converted to number

                        table.push(Number.parseFloat(data));
                    }
                    else if(Array.isArray(data)){
                        var valid = true;
                        data.forEach(function (m){
                            if (!typeof data == 'number')
                            {
                                valid = false;
                            }
                        });
                        if (valid){
                            data.forEach(function (m){
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
                    if(this.delayType == 'values'){
                        if (table.length >= node.amount){
                            node.sendAverage()
                        }
                    }

                });
                if (this.delayType == 'seconds'){
                    var timing = '*/'+node.amount +' * * * * *';
                    node.job = schedule.scheduleJob(timing, function(){
                        node.sendAverage()
                    });
                }
                else if (this.delayType == 'minutes'){
                    var timing = '*/'+node.amount +' * * * *';
                    node.job = schedule.scheduleJob(timing, function(){
                        node.sendAverage()
                    });

                }
                else if (this.delayType == 'hours'){
                    var timing = '* */'+node.amount +' * * *';
                    node.job = schedule.scheduleJob(timing, function(){
                        node.sendAverage()
                    });
                }


            this.on("close", function () {
                // Called when the node is shutdown - eg on redeploy.
                // Allows ports to be closed, connections dropped etc.
                // eg: node.client.disconnect();
                node.job.cancel();
            });
        }
        else{

        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("math_average", MathAverageNode);

}
