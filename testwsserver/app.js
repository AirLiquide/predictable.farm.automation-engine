/**
 * Created by ilab on 01/12/16.
 */

var url = require('url')
var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: 8080 });

_clients = {};
_nodes = {}; //might be removed to save memory, useful to fast iterate on nodes
_sensors = {};  //might be removed to save memory, useful to fast iterate on sensors

wss.on('connection', function connection(ws) {
    do
    var id = (1 + Math.random() * 4294967295).toString(16);
    while(_clients.hasOwnProperty(id));
    var location = url.parse(ws.upgradeReq.url, true);
    var role = location.query.role;
    console.log(role);
    var client =  {
        socket:ws,
        role : role
    }
    //TODO: add a more secure way to log clients, maybe a private crypted code ?
    if (role== ('node'||'sensor')) {
        _clients[id] = client;
        if (role == 'node')
            _nodes[id] = client;
        else
            _sensors[id] = client;
    }
    ws.on('message', function incoming(message) {
        data = JSON.parse(message)
        if (role == 'node') {
            console.log("SERVER :" ,data)
        }
        else if  (role == 'sensor'){
            //TODO :


        }
        console.log('received: %s', message);
        console.log('from:', id);
    });

    ws.on('close',function close(){
        delete _clients[id];
        _clients[id] = client;
        if (role == 'node')
            delete _nodes[id];
        else
            delete _sensors[id];
        console.log("User %s disconnected", id)
    })

    var data ={
        'message':'Bonjour',
        'value':1
    };
    ws.send(JSON.stringify(data));
});