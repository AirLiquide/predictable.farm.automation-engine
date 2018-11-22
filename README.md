Predictable Farm — Automation Engine
---

### Introduction

This engine is based on Node-RED and is the main automation automata of Predictable farm. It gets the sensor data in input, passes it through user-defined flows and computes actions to do as outputs, that are sent to the relevant actuators.

### Installation

    npm install

### Run

    node index.js

Include :
 
  - Sensor nodes
  - Relay nodes
  - function nodes
  - Dashboard nodes
  - Weather nodes

Expected format structure for Sensor nodes and dashboard nodes :

    {
      'device_id': String
      'sensor_id': String
      'sensor_value': Float
    }

Sensor nodes receive sensor values from the farm's sensors.

Function nodes available :

  - Average
  - Is more than
  - Is less than
  - Is equal to

Logic nodes available :

  - AND
  - OR

Logic nodes have auto detection of all the nodes connected to them.

Dashboard nodes are only forwarding value to the dashboard to be stored and displayed.

Weather nodes are based on the DarkSky API : https://darksky.net/dev/

Also available :

  - Socket server
  - Cassandra Database connexion
  - Weather station
  - Geoloc

Use geoloc :

    var loc = require(__dirname + '/Geoloc')(function(){
        // Do some stuff
    });

Use Weather station :

    var Weather = require(__dirname + '/socketServer/Weather');
    Weather.registerNode(this, nodeName);

### Licenses

Our work is licensed under the MIT license. See license.txt.

**This work uses sofware that is licensed under Apache License 2.0. The respective files have kept their original license notices.**
