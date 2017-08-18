/**
 * Created by Brice Culas on 15/08/2017.
 */


/**
 * Created by admin on 01/03/2017.
 */

"use strict";

var CassandraConnection = require('./CassandraConnection');

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;

/*
false for manual
true for automatic
 */

class RelayStateHandler {
    constructor() {

        this.devices = {};
        this.initialized = false;

        var check = function () {
            if (CassandraConnection.connected){
                this.initRelays();
            }
            else{
                setTimeout(check.bind(this),1000);
            }
        };

        setTimeout(check.bind(this),1000);

        return this;
    }

    addRelay(deviceID,relay,value){
        if (this.initialized){
            if (!this.devices[deviceID]){
                this.devices[deviceID] = {};
            }

            if(typeof this.devices[deviceID][relay] == 'undefined'){
                var v = (typeof value == 'undefined')?false:(value == 1);
                this.devices[deviceID][relay] = v || false;
                CassandraConnection.addNewRelayState({
                    device_id: deviceID,
                    sensor_type : relay
                })
                console.log("added new Relay State :",deviceID,relay)
                console.log(this.devices)
            }

            //console.log(this.devices)
        }
    }

    updateRelay(deviceID,relay,value){


        console.log(this.devices);

        if (this.hasRelayState(deviceID,relay)){
            var v = (value == 1);
            //console.log(this.devices[deviceID][relay],v,(this.devices[deviceID][relay] == v));
            if ( !(this.devices[deviceID][relay] == v) ){ //
                this.devices[deviceID][relay] = v;
                CassandraConnection.updateRelay({
                    sensor_value : value,
                    device_id: deviceID,
                    sensor_type : relay,
                })

                console.log("Updated new Relay State :",deviceID,relay,value);
                console.log(this.devices)
            }
        }
        else{
            this.addRelay(deviceID,relay,value)
        }

    }

    initRelays(){
        var t = this;

        CassandraConnection.getAllRelayState(function (res) {

            res.forEach(function (el) {
                var id = el.device_id;
                if(!t.devices[id]){
                    t.devices[id] = {}
                }

                t.devices[id][el.sensor_type] = (el.sensor_value == 1);

            });

            t.initialized = true
        })
    }

    getRelayState(deviceID,relay){
        if (this.devices[deviceID] && this.devices[deviceID][relay])
            return this.devices[deviceID][relay];
        else
            return null;
    }

    hasRelayState(deviceID,relay){
        return (!(typeof this.devices[deviceID] == 'undefined') && !(typeof this.devices[deviceID][relay] == 'undefined'))
    }



}

function getInstance() {
    if (instance == null) instance = new RelayStateHandler();
    return instance;
}

module.exports = getInstance();
