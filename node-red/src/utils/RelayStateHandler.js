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
        this.initialized = false

        return this;
    }

    addRelay(deviceID,relay){
        if (this.initialized){
            if (!this.devices.deviceID){
                this.devices.devicesID = {};
            }

            if(!this.devices.devicesID.relay){
                this.device.devicesID.relay = true;
            }
        }
    }

    initRelays(){
        var t = this;
        CassandraConnection.getAllRelayState(function (res) {
            //todo : assign DB value to the catalog

            t.initialized = true
        })
    }

    getRelayState(deviceID,relay){
        if (this.devices.devices && this.devices.devices.relay)
            return this.devices.devices.relay;
        else
            return null;
    }

    hasRelayState(deviceID,relay){
        return (this.devices.devices && this.devices.devices.relay)
    }



}

function getInstance() {
    if (instance == null) instance = new RelayStateHandler();
    return instance;
}

module.exports = getInstance();
