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
var util = require("util");
var http = require("follow-redirects").http;
var https = require("follow-redirects").https;
var urllib = require("url");
var express = require("express");
var getBody = require('raw-body');
var mustache = require("mustache");
var typer  = require('media-typer');
var cors = require('cors');
var jsonParser = express.json();
var urlencParser = express.urlencoded();

function rawBodyParser(req, res, next) {
    if (req._body) return next();
    req.body = "";
    req._body = true;
    getBody(req, {
        limit: '50mb',
        length: req.headers['content-length'],
        encoding: typer.parse(req.headers['content-type']).parameters.charset
    }, function (err, buf) {
        if (err) return next(err);
        req.body = buf;
        next();
    });
}


function HTTPInWeb(n)  {
        RED.nodes.createNode(this,n);
        if (RED.settings.httpNodeRoot !== false) {

            this.url = n.regex?new RegExp(n.url):n.url;
            this.regex = n.regex;
            this.method = n.method;
            this.server =  RED.nodes.getNode(n.server).server;
                  
            var node = this;

            this.errorHandler = function(err,req,res,next) {
                node.warn(err);
                res.send(500);
            };

            this.callback = function(req,res) {
                if (node.method == "post") {
                    node.send({req:req,res:res,payload:req.body});
                } else if (node.method == "get") {
                    node.send({req:req,res:res,payload:req.query});
                } else {
                    node.send({req:req,res:res});
                }
            }

            var corsHandler = function(req,res,next) { next(); }

            if (RED.settings.httpNodeCors) {
                corsHandler = cors(RED.settings.httpNodeCors);
                node.server.options(this.url,corsHandler);
            }

            if (this.method == "get") {
                node.server.get(this.url,corsHandler,this.callback,this.errorHandler);
            } else if (this.method == "post") {
                node.server.post(this.url,corsHandler,jsonParser,urlencParser,rawBodyParser,this.callback,this.errorHandler);
            } else if (this.method == "put") {
                node.server.put(this.url,corsHandler,jsonParser,urlencParser,rawBodyParser,this.callback,this.errorHandler);
            } else if (this.method == "delete") {
                node.server.delete(this.url,corsHandler,this.callback,errorHandler);
            }

            this.on("close",function() {
                var routes = node.server.routes[this.method];
                for (var i = 0; i<routes.length; i++) {
                    if (routes[i].path == this.url) {
                        routes.splice(i,1);
                        //break;
                    }
                }
                if (RED.settings.httpNodeCors) {
                    var route = node.server.route['options'];
                    for (var j = 0; j<route.length; j++) {
                        if (route[j].path == this.url) {
                            route.splice(j,1);
                            //break;
                        }
                    }
                }
            });
        } else {
            this.warn("Cannot create http-in node when httpNodeRoot set to false");
        }
    }
RED.nodes.registerType("http in web",HTTPInWeb);

function HTTPWebOut(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    this.on("input",function(msg) {
        if (msg.res) {
            if (msg.headers) {
               msg.res.set(msg.headers);
            }
            var statusCode = msg.statusCode || 200;
            if (typeof msg.payload == "object" && !Buffer.isBuffer(msg.payload)) {
                msg.res.set('content-type', 'application/json');
                msg.res.jsonp(statusCode,msg.payload);
            } else {
                if (msg.res.get('content-length') == null) {
                    var len;
                    if (msg.payload == null) {
                        len = 0;
                    } else if (typeof msg.payload == "number") {
                        len = Buffer.byteLength(""+msg.payload);
                    } else {
                        len = Buffer.byteLength(msg.payload);
                    }
                    msg.res.set('content-length', len);
                }else{
                    msg.res.set('content-length', Buffer.byteLength(msg.payload));
                }
                msg.res.send(statusCode,msg.payload);
            }
        } else {
            node.warn("No response object");
        }
    });
}
RED.nodes.registerType("http web out",HTTPWebOut);

/*Web Server Config Node*/

RED.httpServers = RED.httpServers?RED.httpServers :{};

function HttpServerNode(n) {
    RED.nodes.createNode(this,n);
        
    this.host = n.host;
    this.port = n.port;
    var id = this.host+":"+this.port;
    if (!RED.httpServers[id]) {
      RED.httpServers[id] = express();
      RED.httpServers[id].listen(this.port).on( 'error', function (e) {
            
          if (e.code == 'EADDRINUSE') {

            console.log('Address In Use: '+n.port);
          }
        });
    
    }
    this.server = RED.httpServers[id];
};

RED.nodes.registerType("http-server",HttpServerNode);
