/**
 * Created by ilab on 23/01/17.
 */
"use strict";
var cassandra = require('cassandra-driver');
var dbConfig = {
    defaults: {
        hosts: {value: "iMac-de-admin-6"}, //don't use localhost or 127.0.0.1
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
        return this;
    }

    connect() {
        if (!this.connected && !this.connecting) {
            this.doConnect();
        }
    };

    doConnect() {
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
            keyspace: dbConfig.defaults.keyspace.value,
            authProvider: authProvider
        });

        this.connection.connect(function (err) {
            this.connecting = false;
            if (err) {
                this.tick = setTimeout(doConnect, 30000);
                console.log(err);
            } else {
                this.connected = true;
                console.log("Connection to cassandra database done")
            }
        });

    }

    getConnection() {
        return this.connection;
    }

    exectQuery(query, msg, callback) {
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
            var params = msg.payload || [];
            this.connection.execute(query, null, {prepare: true}, resCallback);
        }
    }

}

function getInstance() {
    if (instance == null) instance = new CassandraConnection();
    return instance;
}

module.exports = getInstance();
