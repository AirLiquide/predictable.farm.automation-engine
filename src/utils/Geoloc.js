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


var http = require("http");

var options = {
    host: 'freegeoip.net',
    port: 80,
    path: '/json/',
    method: 'GET'
};

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;


class Geoloc {
    constructor(callback) {


        this.latitude = null;
        this.longitude = null;


        var geo = this;

        function getGeoloc() {
            var req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //console.log(chunk)
                    try {
                        var data = JSON.parse(chunk);
                        geo.setLatitude(data.latitude);
                        geo.setLongitude(data.longitude);
                        geo.setCity(data.city);
                        console.log("Geoloc started. Located in : lat",data.latitude,"/ long :", data.longitude);
                        //console.log(lat,long);
                    }
                    catch(e){
                        console.log("Can't reach geoloc service, retrying in 30s");
                        setTimeout(getGeoloc, 30000)
                    }
                    finally {
                        callback();
                    }

                });
            });
            if (req)
                req.write('');
                req.end();
        }
        getGeoloc();

        return this;
    }

    getLatitude(){
        return this.latitude;
    }

    getLongitude(){
        return this.longitude;
    }

    getCity(){
        return this.city;
    }

    setLatitude(latitude){
        this.latitude = latitude;
    }

    setLongitude(longitude){
        this.longitude = longitude
    }

    setCity(city){
        this.city = city
    }

}

function getInstance(callback) {
    if (instance == null) instance = new Geoloc(callback);
    return instance;
}

module.exports = getInstance;
