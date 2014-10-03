 var browserify = require('browserify'),
     fs = require('fs');
 module.exports = function(RED) {
    "use strict";
    var fs = require("fs");
    function BrowserifyNode(n) {
        RED.nodes.createNode(this,n);
        this.filein = n.filein;
        this.fileout = n.fileout;

        var node = this;
        this.on("input",function(msg) {

            var b = browserify({debug:true});
            try{	
                b.add(node.filein)
                .bundle({debug:true}, function(err, src){
                    if(node.fileout){
		    	
                        fs.writeFileSync(node.fileout, src);
                    }
                    msg.payload = src||err;
                    node.send(msg);
                });
            }catch(e){
	    	msg.payload = e;
	    	node.send(msg);
	    }

        });
    }

    RED.nodes.registerType("browserify", BrowserifyNode);
};
