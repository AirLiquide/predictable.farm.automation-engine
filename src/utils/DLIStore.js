/*
  Copyright (C) Air Liquide S.A,  2017-2018
  Author: Sébastien Lalaurette and Cyril Ferté, La Factory, Creative Foundry
  This file is part of Predictable Farm project.

  The MIT License (MIT)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
   
  See the LICENSE.txt file in this repository for more information.
*/

"use strict";


/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;

var schedule = require('node-schedule');
var CassandraConnection = require('./CassandraConnection');

class DLIStore {
    constructor() {

        this.map = {};
        this.job = schedule.scheduleJob('0 0 * * *', this.resetAllDLI);
        return this;
    }

    hasDLI(deviceID) {
        var v = (this.map[deviceID] != null);
        return v;
    }

    addDLI(deviceID) {
        var t = this;
        if (!this.map[deviceID])
            CassandraConnection.getLastDLIValue(deviceID,function (value,date) {
                t.map[deviceID] = {
                    lastValueTime: date,
                    lastValue: value,
                    value: value || 0
                };
            })
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

            var dli = (this.map[deviceID].value + (v*mult)/1000000);

            this.map[deviceID].value = dli;
            this.map[deviceID].lastValueTime = time;

            CassandraConnection.addQueryToSensorLogBatch({
                device_id: deviceID,
                sensor_type: "light_dli",
                sensor_value: dli.toString()
            });

            callback(dli);
        }
    }
}

function getInstance() {
    if (instance == null) instance = new DLIStore();
    return instance;
}

module.exports = getInstance();
