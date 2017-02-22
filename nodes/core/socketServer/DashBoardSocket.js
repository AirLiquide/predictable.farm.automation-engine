/**
 * Created by admin on 22/02/2017.
 */
"use strict"

class DashBoardSocket{

    constructor(type){
        console.log("go")
        this.socket = require('socket.io-client')('http://127.0.0.1:80/');
        this.socket.on('connect', function(){
            console.log(type+" node connected to dashboard");
        });

        this.socket.on('connect_error', function(error){
            //console.log(error);
        });
        this.socket.emit("hello");
    }

    emit(event, data){
        this.socket.emit(event,data);
    }

    close(){

    }


}

module.exports = DashBoardSocket;