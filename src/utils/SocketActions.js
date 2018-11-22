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

class SocketActions {
    static get NODE_CONNECT() {
        return "NODE_CONNECT";
    }

    static get NODE_DISCONNECT() {
        return "NODE_DISCONNECT";
    }

    static get SENSOR_CONNECT() {
        return "SENSOR_CONNECT";
    }

    static get SENSOR_DISCONNECT() {
        return "SENSOR_DISCONNECT";
    }

    static get TEST_ACTION() {
        return "TEST_ACTION";
    }

    static get TEST_EMIT_ACTION() {
        return "TEST_EMIT_ACTION";
    }

    static get SENSOR_EMIT() {
        return "sensor-emit";
    }

    static get UPDATE_DATA() {
        return "UPDATE_DATA";
    }

    static get UPDATE_RELAYSTATE() {
        return "update-relaystate";
    }


    static isValidAction(action) {
        var properties = Object.getOwnPropertyNames(SocketActions);
        //remove the native properties
        properties.splice(properties.indexOf("length"), 1);
        properties.splice(properties.indexOf("name"), 1);
        properties.splice(properties.indexOf("prototype"), 1);
        properties.splice(properties.indexOf("isValidAction"), 1);
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
