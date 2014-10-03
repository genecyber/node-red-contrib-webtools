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
var fs = require("fs");

function FolderNode(n) {
    RED.nodes.createNode(this,n);
    this.folderpath = n.folderpath;
    this.filepath = n.filepath;
    this.fileparametername = n.fileparametername;
    this.listfiles = n.listfiles;
    this.defaultfile = n.defaultfile;	
	
    var node = this;
    this.on("input",function(msg) {
      
      var file = (n.filepath=="URL")?
      ((msg.req.url==="/")?msg.req.url+node.defaultfile:msg.req.url)
      :msg.payload[node.fileparametername];
      var filePath = "."+decodeURIComponent((node.folderpath+"/"+file).replace(/[\/\/\\\\]{2,}/g,"/").split("?")[0]);
      
      if(fs.existsSync(filePath)&&fs.lstatSync(filePath).isFile()){
            msg.res.sendfile(filePath);
      }else{
        if(node.listfiles){
         var listPath = filePath.split("/");
         listPath = listPath.splice(0,listPath.length-1).join("/");
         console.log(listPath);
         msg.res.send(JSON.stringify(fs.readdirSync(listPath)));
        }else{
         msg.res.statusCode =  "404";
         msg.res.send("<h1>File Not Found: "+filePath+"</h1>");
        }
      }
    });
}

RED.nodes.registerType("folder out",FolderNode);
