## Node-RED module developed fo Predictable farm ##

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
 - Is egual to

Logic nodes available :

  - AND
  - OR

Logic nodes have auto detection of all the nodes connected to them.

Dashboard nodes are only forwarding value to the dashboard to be stored and displayed

Weather nodes are based on DarkSky API : https://darksky.net/dev/

Also available :

 - Socket server
 - Cassandra Database connexion
 - Weather station
 - Geoloc

Use geoloc
`var loc = require(__dirname + '/Geoloc')(function(){
            //Do some stuff
        });`
Use Weather station

    var Weather = require(__dirname + '/socketServer/Weather');

    Weather.registerNode(this, nodeName);

Penser à faire un "npm install" après avoir clone

Documentation complète :  https://docs.google.com/document/d/1_SxayDKO30vMWrVTCxJiv7SGgChcJP5q2pF0UntlBh4/