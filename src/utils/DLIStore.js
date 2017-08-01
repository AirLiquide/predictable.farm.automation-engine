/**
 * Created by admin on 01/08/2017.
 */

"use strict";


/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;

var schedule = require('node-schedule');

class DLIStore {
    constructor() {

        this.map = {};
        this.job = schedule.scheduleJob('0 0 * * *', this.resetAllDLI);
        return this;
    }

    hasDLI(deviceID) {
        return (this.map[deviceID] != null);
    }

    addDLI(deviceID) {
        if (!this.map[deviceID])
            this.map[deviceID] = {
                lastValueTime: Date.now(),
                lastValue: 0,
                value: 0
            };
    }

    getDLI(deviceID) {
        var v;
        if (this.map[deviceID])
            v = this.map[deviceID].value;

        return v;
    }

    resetAllDLI() {
        var devices = Object.keys(this.map);

        devices.forEach(() => {
            this.map[device].value = 0
        })
    }

    addValueToDLI(deviceID, value,callback) {
        if (this.map[deviceID]) {

            var time = Date.now();
            var deltaT = time - this.map[deviceID].lastValueTime;

            var mult = deltaT/1000; // number of second elapsed

            var v = Number.parseFloat(value);

            var dli = (this.map[deviceID].value + (v*mult));

            this.map[deviceID].value = dli;
            this.map[deviceID].lastValueTime = time;

            callback(dli);
        }
    }
}

function getInstance() {
    if (instance == null) instance = new DLIStore();
    return instance;
}

module.exports = getInstance();
