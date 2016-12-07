/**
 * Created by ilab on 05/12/16.
 */


class SocketActions{
    static get NODE_CONNECT(){
        return"NODE_CONNECT";
    }

    static get NODE_DISCONNECT(){
        return"NODE_DISCONNECT";
    }

    static get SENSOR_CONNECT(){
        return"SENSOR_CONNECT";
    }

    static get SENSOR_DISCONNECT(){
        return"SENSOR_DISCONNECT";
    }

    static get TEST_ACTION(){
        return "TEST_ACTION";
    }

    static isValidAction(action){
        var properties = Object.getOwnPropertyNames(SocketActions);
        //remove the native properties
        properties.splice(properties.indexOf("length"),1);
        properties.splice(properties.indexOf("name"),1);
        properties.splice(properties.indexOf("prototype"),1);
        properties.splice(properties.indexOf("isValidAction"),1);
        return (properties.indexOf(action) != -1)
    }
}
/*var SocketActions = {
    NODE_CONNECT: "NODE_CONNECT",
    NODE_DISCONNECT: "NODE_DISCONNECT",
    SENSOR_CONNECT: "SENSOR_CONNECT",
    SENSOR_DISCONNECT: "SENSOR_DISCONNECT"
}*/

module.exports = SocketActions;