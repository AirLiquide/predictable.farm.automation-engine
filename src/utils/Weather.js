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

var https = require("https");

/*  * Setting up block level variable to store class state  * , set's to null by default.  */
var instance = null;

class Weather {
    constructor() {

        this.temperatureNodes = [];
        this.dewPointNodes = [];
        this.humidityNodes = [];
        this.cloudCoverNodes = [];
        this.pressureNodes = [];
        this.ozoneNodes = [];
        this.geolocNodes = [];
        this.listLocalisation = [];
        var weather = this;

        this.loc = require(__dirname + '/Geoloc')(function(){
            // weather.checkWeather();
            console.log("Weather station started")
        });

        return this;
    }

    getTemperatureNodes(){
        return this.temperatureNodes;
    }

    getDewPointNodesNodes(){
        return this.dewPointNodes;
    }

    getHumidityNodes(){
        return this.humidityNodes;
    }

    getCloudCoverNodes(){
        return this.cloudCoverNodes;
    }

    getPressureNodes(){
        return this.pressureNodes;
    }

    getOzoneNodes(){
        return this.ozoneNodes;
    }

    getGeoLocNodes(){
        return this.geolocNodes;
    }
    getlistLocalisation(){
        return this.listLocalisation;
    }

    registerNode(node, name, data){

        if (name == "weather_temperature"){
            this.temperatureNodes.push(node);
        }
        else if (name == "weather_dew_point"){
            this.dewPointNodes.push(node);
        }
        else if (name == "weather_humidity"){
            this.humidityNodes.push(node);
        }
        else if (name == "weather_cloud_cover"){
            this.cloudCoverNodes.push(node);
        }
        else if (name == "weather_pressure"){
            this.pressureNodes.push(node);
        }
        else if (name == "weather_o3"){
            this.ozoneNodes.push(node);
        }
        else if (name == "weather_geoloc"){
            this.geolocNodes.push(node);
        }

        this.updateListLocalisation(node, data);

    }

    removeNode(node,name){
        if (name == "weather_temperature"){
            var i =this.temperatureNodes.indexOf(node);
            this.temperatureNodes.splice(i,1);
        }
        else if (name == "weather_dew_point"){
            var i =this.dewPointNodes.indexOf(node);
            this.dewPointNodes.splice(i,1);
        }
        else if (name == "weather_humidity"){
            var i =this.humidityNodes.indexOf(node);
            this.humidityNodes.splice(i,1);
            this.humidityNodes.push(node);
        }
        else if (name == "weather_cloud_cover"){
            var i =this.cloudCoverNodes.indexOf(node);
            this.cloudCoverNodes.splice(i,1);
        }
        else if (name == "weather_pressure"){
            var i =this.pressureNodes.indexOf(node);
            this.pressureNodes.splice(i,1);
        }
        else if (name == "weather_o3"){
            var i =this.ozoneNodes.indexOf(node);
            this.ozoneNodes.splice(i,1);
        }
        else if (name == "weather_geoloc"){
            var i =this.geolocNodes.indexOf(node);
            this.geolocNodes.splice(i,1);
        }
    }

    checkWeather(){
        if (this.weatherLoop) {
          console.log('clear')
          clearTimeout(this.weatherLoop);
          this.weatherLoop = 0;
          console.log(' end clear')
        }
        for (var i = 0; i < this.listLocalisation.length; i++) {
          console.log('loop connections', this.listLocalisation[i], this.listLocalisation)
            this.options = {
                hostname: 'api.darksky.net',
                port: 443,
                path: '/forecast/'+ this.listLocalisation[i].apiKey + '/'+this.listLocalisation[i].latitude+','+ this.listLocalisation[i].longitude+'?exclude=[minutely,daily,alerts,flags]&units=si',
                method: 'GET'
            };
            console.log('get', this.options)

          //console.log(options.path)

          var req = https.request(this.options, (res) => {

              var buffers = [];

              res.on('end', () => {
                  var b = Buffer.concat(buffers);
                  console.log(b)
                  var data = JSON.parse(b);

                  this.getTemperatureNodes().forEach((node) => {
                    console.log('nodeeee', node, this)
                    if(this.listLocalisation[i].latitude == node.latitude && this.listLocalisation[i].longitude == node.longitude){
                      console.log('send temp')
                      var msg = {
                          payload : data.hourly.data[node.delay].temperature
                      };

                      node.send(msg);
                    }

                  });

                  this.getDewPointNodesNodes().forEach((node) => {
                    if(this.listLocalisation[i].latitude == node.latitude && this.listLocalisation[i].longitude == node.longitude){
                      var msg = {
                          payload : data.hourly.data[node.delay].dewPoint
                      };

                      node.send(msg);
                    }
                  });

                  this.getHumidityNodes().forEach((node) => {
                    if(this.listLocalisation[i].latitude == node.latitude && this.listLocalisation[i].longitude == node.longitude){
                      var msg = {
                          payload : data.hourly.data[node.delay].humidity
                      };

                      node.send(msg);
                    }
                  });

                  this.getCloudCoverNodes().forEach((node) => {
                    if(this.listLocalisation[i].latitude == node.latitude && this.listLocalisation[i].longitude == node.longitude){
                      var msg = {
                          payload : data.hourly.data[node.delay].cloudCover
                      };

                      node.send(msg);
                    }
                  });

                  this.getPressureNodes().forEach((node) => {
                    if(this.listLocalisation[i].latitude == node.latitude && this.listLocalisation[i].longitude == node.longitude){
                      var msg = {
                          payload : data.hourly.data[node.delay].pressure
                      };

                      node.send(msg);
                    }
                  });

                  this.getOzoneNodes().forEach((node) => {
                    if(this.listLocalisation.latitude == node.latitude && this.listLocalisation.longitude == node.longitude){
                      var msg = {
                          payload : data.hourly.data[node.delay].ozone
                      };

                      node.send(msg);
                    }
                  });

                  // this.getGeoLocNodes().forEach(function(node){
                  //
                  //     var msg = {
                  //         payload : this.loc.getCity()
                  //     };
                  //
                  //     node.send(msg);
                  // });

              });

              res.on('data', (d) => {

                  buffers.push(d);

                  //console.log(JSON.parse(d));
              });
          });

          req.on('error', (e) => {
              console.error(e);
          });

          req.end();

          var w = this;

          this.weatherLoop = setTimeout(function(){w.checkWeather()},1000*60*5);
      }


    }
    updateListLocalisation(node, data){
      console.log('update : ', node)
      var counter= 0;
      for (var i = 0; i < this.listLocalisation.length; i++) {
        if (this.listLocalisation[i].includes(data.longitude) && this.listLocalisation[i].includes(data.latitude)){
          console.log('exist ')
        }else{
            console.log('+1 ')
          counter +=1;
        }
        if(counter>= listLocalisation.length){

          var newLocalisation = {
            longitude: data.longitude,
            latitude: data.latitude,
            apiKey: data.apiKey
          }
          console.log('new loc : ' , newLocalisation)
          this.listLocalisation.push(newLocalisation);
          this.checkWeather();
        }
      }
      if( this.listLocalisation.length <= 0){

        var newLocalisation = {
          longitude: data.longitude,
          latitude: data.latitude,
          apiKey: data.apiKey
        }
        console.log('new loc : ' , newLocalisation)
        this.listLocalisation.push(newLocalisation);
        this.checkWeather();
      }



    }

}

function getInstance() {
    if (instance == null) instance = new Weather();
    return instance;
}

module.exports = getInstance();
