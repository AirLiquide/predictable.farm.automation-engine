/**
 * Created by ilab on 23/01/17.
 */
"use strict";
var cassandra = require('cassandra-driver');



var dbConfig = {
    defaults: {
        //hosts: {value: "predictable-server"}, //don't use localhost or 127.0.0.1
        hosts: {value: 'cassandra'}, //oriented for docker sub-network
        port: {value: "9042"},
        keyspace: {value: "predictablefarm"}
    },
    credentials: {
        user: {type: ""},
        password: {type: ""}
    }
};

var instance = null;
var doConnect = null;
var tempTab = []; // tab pour reduire le nombre d'enregistrement
var nbToAverage = 10; // nb pour reduire le nombre d'enregistrement
var errPercentage = 1; //in percentage


class CassandraConnection {

    constructor() {
        this.connect();
        doConnect = this.doConnect;
        this.queries = {
            "get-switch": 'SELECT * FROM predictablefarm.relaystate WHERE device_id= ? AND sensor_type = ?',// device_id / sensor_type
            "save-switch": 'INSERT INTO predictablefarm.relaystate (device_id, sensor_type, sensor_value, last_update) ' +
            'VALUES(?, ?, ?, toTimestamp(now()))', // device_id / sensor_type /  / sensor_value
            "save-sensor": 'INSERT INTO predictablefarm.sensorLog (device_id, sensor_type, sensor_value, created_at) ' +
            'VALUES(?, ?, ?, toTimestamp(now()))', // device_id / sensor_type / sensor_value
            "get-last-dli": 'SELECT * FROM sensorlog where device_id=? and sensor_type=\'light_dli\' ORDER BY created_at DESC LIMIT 1;' // device_id / sensor_type

        };
        var t  = this;
        this.timer = setInterval(()=>{
            if (t.connected && t.batchBuffer.length!=0)
                t.saveSensorLogs()
        }, 10000);

        this.queryBatch = [];
        this.batchBuffer = [];

        this.batchSize = 225;

        return this;
    }

    connect() {
        if (!this.connected && !this.connecting) {
            this.doConnect();
        }
    };

    doConnect() {
        var t = this;
        this.connecting = true;

        var authProvider = null;
        if (dbConfig.credentials.user) {
            authProvider = new cassandra.auth.PlainTextAuthProvider(
                dbConfig.credentials.user,
                dbConfig.credentials.password
            );
        }


        // TODO: Support other port, default is 9042
        this.connection = new cassandra.Client({
            contactPoints: dbConfig.defaults.hosts.value.replace(/ /g, "").split(","),
            keyspace: dbConfig.defaults.keyspace.value
        });

        this.connection.connect(function (err) {
            t.connecting = false;
            if (err) {
                this.tick = setTimeout(doConnect.bind(t), 5000);
                console.log(err);
            } else {
                this.connected = true;
                t.connected = true;
                console.log("Connection to cassandra database done")
            }
        });

    }

    getConnection() {
        return this.connection;
    }

    exectQuery(query, params, callback) {
        var batchMode = Array.isArray(query);
        if (!batchMode && typeof query != 'string') {
            console.error("msg.topic : the query is not defined as a string or as an array of queries");
            return;
        }
        var resCallback = function (err, result) {

            if (err) {
                console.error(err);
            } else {
                callback(result.rows);
            }
        };

        if (batchMode) {
            //console.log("Batching " + query.length + " CQL queries");
            this.connection.batch(query, {prepare: true}, resCallback);
        } else {
            //console.log("Executing CQL query: ", query);
            this.connection.execute(query, params, {prepare: true}, resCallback);
        }
    }


    //designed to no be called in batch mode to ensure real time data
    getSwitch(msg,callback){
        var params = [msg.payload.device_id, msg.payload.sensor_type];
        this.exectQuery(this.queries['get-switch'],params,callback);
    }

    //designed to no be called in batch mode to ensure real time data
    saveSwitch(data,callback){
        var params = [data.device_id, data.sensor_type,data.sensor_value];
        this.exectQuery(this.queries['save-switch'],params,callback);
    }

    addQueryToSensorLogBatch(data){


      console.log(data.device_id,  data.sensor_type, data.sensor_value, typeof data.sensor_value)

      if(data.sensor_type == 'relay1' || data.sensor_type == 'relay2' || data.sensor_type == 'relay3' || data.sensor_type == 'relay4' ){
        var params = [data.device_id, data.sensor_type, data.sensor_value];
        var q = this.queries['save-sensor'];
        console.log( 'q', q, params)


        var query = {
            query : q,
            params: params
        };

        //console.log('added',data,"to batch");

        if (typeof q != 'undefined'){
            this.queryBatch.push(query);
            if (this.queryBatch.length >= this.batchSize ){
                this.batchBuffer.push(this.queryBatch);
                this.queryBatch = new Array();
            }
        }
      }
        if(tempTab[data.device_id + '-' + data.sensor_type]){
          console.log( 'if 1 ok')

          if(tempTab[data.device_id + '-' + data.sensor_type].value && tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter] ){
            console.log( 'if 2 ok')
            tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter + 1] = data.sensor_value
            tempTab[data.device_id + '-' + data.sensor_type].counter += 1;
          } else{
            console.log( 'if 2 err')
            tempTab[data.device_id + '-' + data.sensor_type].counter = 0
            tempTab[data.device_id + '-' + data.sensor_type].value = []
            tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter ] = data.sensor_value
            console.log(tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter + 1])
          }
          console.log('counter',tempTab[data.device_id + '-' + data.sensor_type].counter)
           if(tempTab[data.device_id + '-' + data.sensor_type].counter == nbToAverage){
             tempTab[data.device_id + '-' + data.sensor_type].counter = 0
             console.log( 'if 3 ok')
             var averageSum = 0;
             var i =0;
             for (i = 0; i < nbToAverage; i++) {
                averageSum =  Number(averageSum) +  Number(tempTab[data.device_id + '-' + data.sensor_type].value[i]);
              }
              console.log( 'average SUM')
              console.log(averageSum);
             var averageValue = averageSum / nbToAverage;
             var params = [data.device_id, data.sensor_type, averageValue.toString()];
             var q = this.queries['save-sensor'];
             console.log( 'q', q, params)


             var query = {
                 query : q,
                 params: params
             };

             //console.log('added',data,"to batch");

             if (typeof q != 'undefined'){
                 this.queryBatch.push(query);
                 if (this.queryBatch.length >= this.batchSize ){
                     this.batchBuffer.push(this.queryBatch);
                     this.queryBatch = new Array();
                 }
             }

           }

        }else{
          console.log( 'if 1 err')
          tempTab[data.device_id + '-' + data.sensor_type] = [];
          if(tempTab[data.device_id + '-' + data.sensor_type].value && tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter] ){
            tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter + 1] = data.sensor_value
          } else{
            tempTab[data.device_id + '-' + data.sensor_type].counter = 0
            tempTab[data.device_id + '-' + data.sensor_type].value = []
            tempTab[data.device_id + '-' + data.sensor_type].value[tempTab[data.device_id + '-' + data.sensor_type].counter + 1] = data.sensor_value
          }
           if(tempTab[data.device_id + '-' + data.sensor_type].counter == nbToAverage){
             var averageSum = 0;
             var i = 0;
             for (i = 0; i < nbToAverage; i++) {
                  averageSum =  Number(averageSum) +  Number(tempTab[data.device_id + '-' + data.sensor_type].value[i]);
              }
              console.log(averageSum);
             var averageValue = averageSum / nbToAverage;
             var params = [data.device_id, data.sensor_type, averageValue.toString()];
             var q = this.queries['save-sensor'];
             var query = {
                 query : q,
                 params: params
             };
             console.log( 'q', q, params)

             //console.log('added',data,"to batch");

             if (typeof q != 'undefined'){
                 this.queryBatch.push(query);
                 if (this.queryBatch.length >= this.batchSize ){
                     this.batchBuffer.push(this.queryBatch);
                     this.queryBatch = new Array();
                 }
             }

           }
        }


    }

    saveSensorLogs(callback){
        var t = this;

        for (var i =0; i<this.batchBuffer.length;i++){
            var batch = this.batchBuffer[i];
            t.exectQuery(batch,null,function () {
                //console.log("Saved",batch.length,"queries.");
                if (callback)
                    callback();
            });
        }

        this.batchBuffer = [];


    }

    getLastDLIValue(deviceID,callback){
        //TODO: call the database

        if (this.connected){
            this.exectQuery(this.queries['get-last-dli'],{
                    device_id:deviceID
                },
                function (res) {
                    var v = 0;
                    var date = Date.now();
                    if (res.length != 0){
                        v = Number.parseFloat(res[0].sensor_value);
                        date = new Date(res[0].created_at).getTime();
                    }

                     callback(v,date);
                })
        }
    }





}

function getInstance() {
    if (instance == null) instance = new CassandraConnection();
    return instance;
}

module.exports = getInstance();
