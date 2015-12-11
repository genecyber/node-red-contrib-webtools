/*Copyright 2013 IBM Corp.
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

var cors = require('cors');
var jsonParser = express.json();
var urlencParser = express.urlencoded();

function rawBodyParser(req, res, next) {
    if (req._body) return next();
    req.body = "";
    req._body = true;
    getBody(req, {
        limit: '1mb',
        length: req.headers['content-length'],
        encoding: 'utf8'
    }, function (err, buf) {
        if (err) return next(err);
        req.body = buf;
        next();
    });
}


function HTTPInRegex(n)  {
        RED.nodes.createNode(this,n);
        if (RED.settings.httpNodeRoot !== false) {

            this.url = new RegExp(n.url);
            this.method = n.method;

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
                RED.httpNode.options(this.url,corsHandler);
            }

            if (this.method == "get") {
                RED.httpNode.get(this.url,corsHandler,this.callback,this.errorHandler);
            } else if (this.method == "post") {
                RED.httpNode.post(this.url,corsHandler,jsonParser,urlencParser,rawBodyParser,this.callback,this.errorHandler);
            } else if (this.method == "put") {
                RED.httpNode.put(this.url,corsHandler,jsonParser,urlencParser,rawBodyParser,this.callback,this.errorHandler);
            } else if (this.method == "delete") {
                RED.httpNode.delete(this.url,corsHandler,this.callback,errorHandler);
            }

            this.on("close",function() {
                var routes = RED.httpNode.routes[this.method];
                for (var i = 0; i<routes.length; i++) {
                    if (routes[i].path == this.url) {
                        routes.splice(i,1);
                        //break;
                    }
                }
                if (RED.settings.httpNodeCors) {
                    var route = RED.httpNode.route['options'];
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
RED.nodes.registerType("http in regex",HTTPInRegex);
