//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var counters = [];
var sockets = [];

io.on('connection', function (socket) {
    socket.emit('data', counters);
    
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('message', function (msg) {
      if (msg == "!UPDATE") {
        socket.emit('data', counters)
      } else {
        var values = msg.split("|");
        if (values[1] == "0") {
          if (values[0] == "") {
            socket.emit("alert", "You can't have an empty name!");
            return;
          }
        
          if (counters.findIndex(x => x.name == values[0]) != -1) {
            socket.emit("alert", "That name already exists!");
            return;
          }
        
          counters.push({name: values[0], count: 0});
          broadcast('data', counters);
        } else if (values[1] == "+") {
          counters[counters.findIndex(x => x.name == values[0])].count += 1;
          broadcast('data', counters);
        } else if (values[1] == "-") {
          counters[counters.findIndex(x => x.name == values[0])].count -= 1;
          if (counters[counters.findIndex(x => x.name == values[0])].count < 0) {
            counters[counters.findIndex(x => x.name == values[0])].count = 0;
            socket.emit("alert", "Too low!");
          }
          
          broadcast('data', counters);
        } else {
          console.warn("Unknown increment code!");
        }
      }
    });
  });

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
