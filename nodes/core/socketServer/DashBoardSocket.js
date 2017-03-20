/**
 * Created by admin on 22/02/2017.
 */
"use strict"

var cloudAddress = '';

class DashBoardSocket{

    constructor(type){
        this.socket = require('socket.io-client')('http://127.0.0.1:80/');
        this.cloudSocket = require('socket.io-client')(cloudAddress);
        this.socket.on('connect', function(){
            console.log(type+" node connected to dashboard");
        });

        this.socket.on('connect_error', function(error){
            //console.log(error);
        });
        this.socket.emit("hello");

        this.cloudSocket.on('connect', function(){
            console.log(type+" node connected to cloud dashboard");
        });

        this.cloudSocket.on('connect_error', function(error){
            //console.log(error);
        });
        this.cloudSocket.emit("hello");
    }

    emit(event, data){
        this.socket.emit(event,data);
    }

    close(){

    }


}

module.exports = DashBoardSocket;