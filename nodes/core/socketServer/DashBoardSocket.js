/**
 * Created by admin on 22/02/2017.
 */
"use strict"

const crypto = require('crypto');
var socketClient = require('socket.io-client');
var cloudAddress = 'http://192.168.222.197:9000';

var farmID = process.env.FARM_ID || "";
var secretKey = process.env.PREDICTABLE_KEY || "";


function encrypt(text) {
    var crypted = crypto.createHmac('sha256', secretKey).update(text).digest('hex');
    return crypted;
}

class DashBoardSocket {

    constructor(type) {
        this.socket = socketClient('http://127.0.0.1:80/');
        this.cloudSocket = socketClient(cloudAddress,{
            query: "farmId=" + farmID
        });
        this.socket.on('connect', function () {
            console.log(type + " node connected to dashboard");
        });

        this.socket.on('connect_error', function (error) {
            //console.log(error);
        });
        this.socket.emit("hello");

        var cs = this.cloudSocket;
        this.cloudSocket.on('connect', function () {

            cs.on('connect_error', function (error) {
                //console.log(error);
            });
            cs.on("authenticate", function(msg){
                var hash = encrypt(msg);
                cs.emit('authenticate', hash);

            });
            cs.on("authenticated", function(msg){
                console.log(type + " node connected to cloud dashboard");
            });
        });

    }

    emit(event, data) {
        this.socket.emit(event, data);
        this.cloudSocket.emit(event, data);
    }

    close() {

    }



}

module.exports = DashBoardSocket;