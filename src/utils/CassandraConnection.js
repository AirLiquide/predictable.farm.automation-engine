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


class CassandraConnection {

    constructor() {
        this.connect();
        doConnect = this.doConnect;
        this.queries = {
            "get-switch": 'SELECT * FROM predictablefarm.relaystate WHERE device_id= ? AND sensor_type = ?',// device_id / sensor_type
            "save-switch": 'INSERT INTO predictablefarm.relaystate (device_id, sensor_type, sensor_value, last_update) ' +
            'VALUES(?, ?, ?, toTimestamp(now()))', // device_id / sensor_type /  / sensor_value
            "save-sensor": 'INSERT INTO predictablefarm.sensorLog (device_id, sensor_type, sensor_value, created_at) ' +
            'VALUES(?, ?, ?, toTimestamp(now()))' // device_id / sensor_type / sensor_value
        };

        this.timer = setInterval(()=>{;if (this.connected && this.queryBatch.length!=0)this.saveSensorLogs()}, 10000);

        this.queryBatch = [];

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
            this.connecting = false;
            if (err) {
                this.tick = setTimeout(doConnect, 10000);
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
        var params = [data.device_id, data.sensor_type,data.sensor_value];
        var q = this.queries['save-sensor'];
        var query = {
            query : q,
            params: params
        };

        //console.log('added',data,"to batch");

        if (typeof q != 'undefined'){
            this.queryBatch.push(query);
        }
    }

    saveSensorLogs(callback){
        var t = this;
        this.exectQuery(this.queryBatch,null,function () {
            //console.log("Saved",t.queryBatch.length,"queries.");
            t.queryBatch = [];
            if (callback)
                callback();

        });

    }

    getLastDLIValue(deviceID,callback){
        //TODO: call the database

        callback(0);
    }

    initDB(){
        let query = "CREATE KEYSPACE PredictableFarm  WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 };";
        exectQuery(query,{},function (res) {
            let queries = [
                {
                    query: "a",
                    params:{}
                }
            ]
        })
    }

}

function getInstance() {
    if (instance == null) instance = new CassandraConnection();
    return instance;
}

module.exports = getInstance();
