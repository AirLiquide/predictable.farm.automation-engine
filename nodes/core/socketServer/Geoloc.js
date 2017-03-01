/**
 * Created by admin on 01/03/2017.
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

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var data = JSON.parse(chunk);
                geo.setLatitude(data.latitude);
                geo.setLongitude(data.longitude);
                callback();
                //console.log(lat,long);
            });
        });
        req.end();
        return this;
    }

    getLatitude(){
        return this.latitude;
    }

    getLongitude(){
        return this.longitude;
    }

    setLatitude(latitude){
        this.latitude = latitude;
    }

    setLongitude(longitude){
        this.longitude = longitude
    }





}

function getInstance(callback) {
    if (instance == null) instance = new Geoloc(callback);
    return instance;
}

module.exports = getInstance;
