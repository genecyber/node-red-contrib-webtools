/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var redis = require('redis');
var util = require('util');
var hashFieldRE = /^([^=]+)=(.*)$/;

function RedisNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    this.arguments = n.arguments;
    this.command = n.command;
    this.server =  RED.nodes.getNode(n.server);
    var client = this.server.server;
    this.on("input", function(msg) {
		
        var rc = function(err, reply){
          
		  msg.payload = reply||err;					  
		  node.send(msg); 
		}
        
        var resolved_arguments = [];
        
        for(var i=0;i<node.arguments.length;i++){
            if(msg.payload[node.arguments[i]]){
            	resolved_arguments.push(msg.payload[node.arguments[i]]);
            }
        }
       
        var args = node.command.split(" ");
        if(args.length>1){
            resolved_arguments.unshift(args[1]);
        }
        client[args[0]](resolved_arguments, rc);
        
        this.close = function(){
          client.close(client);
        }
    });
  
}


RED.nodes.registerType("redis",RedisNode);

function RedisServerNode(n) {
    RED.nodes.createNode(this,n);
    
    this.host = n.host;
    this.port = n.port;
    
    var redisConnectionPool = function() {
      var connections = {};
      
      var obj = {
          get: function(host,port) {
              var id = host+":"+port;
              if (!connections[id]) {
                  connections[id] = redis.createClient(port,host);
                  connections[id].on("error",function(err) {
                          util.log("[redis] "+err);
                  });
                  connections[id].on("connect",function() {
                          util.log("[redis] connected to "+host+":"+port);
                  });
                  connections[id]._id = id;
                  connections[id]._nodeCount = 0;
              }
              connections[id]._nodeCount += 1;
              return connections[id];
          },
          close: function(connection) {
              connection._nodeCount -= 1;
              if (connection._nodeCount == 0) {
                  if (connection) {
                      clearTimeout(connection.retry_timer);
                      connection.end();
                  }
                  delete connections[connection._id];
              }
          }
      };
      return obj;
    }();
    
    this.server = redisConnectionPool.get(this.host, this.port);
    this.server.close = redisConnectionPool.close;
}

RED.nodes.registerType("redis-server",RedisServerNode);

