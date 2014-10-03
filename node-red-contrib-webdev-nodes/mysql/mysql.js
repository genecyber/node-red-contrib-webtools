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
var mysql = require('mysql');
var util = require('util');
var mustache = require('mustache');

function mysqlNode(n) {
    RED.nodes.createNode(this,n);
    
    this.arguments = n.arguments;
    this.command = n.command;
    this.server =  RED.nodes.getNode(n.server);
    this.name = n.name;
   
    var node = this;
    this.on("input", function(msg) {
		
        for(var cmd in msg.mysql){
            msg.mysql[cmd] = node.server.server.escape(msg.mysqlescape[cmd]);
        };
        
        node.server.server.query(mustache.render(node.command, msg), function(err, rows, fields){
            msg.payload = {rows:rows||err,fields:fields};
            node.send(msg);
        });    
        
    });
}


RED.nodes.registerType("mysql",mysqlNode);

function mysqlServerNode(n) {
    RED.nodes.createNode(this,n);
    
    this.host = n.host;
    this.port = n.port;
    this.user = n.un;
    this.password = n.pw;
    this.connectionLimit = n.connectionLimit||10;
    
    this.server =  mysql.createPool(this);   
    
}

RED.nodes.registerType("mysql-server",mysqlServerNode);

