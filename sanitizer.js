/**
 * Copyright 2015 Abhijit Suresh
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

module.exports = function(RED) {
    "use strict";
     var util = require('util');
     var operations = {
        'newline': function(a) { return a.replace(/\n/g, "\\n"); },
	'tabspace': function(a) {  return a.replace(/\t/g, "\\t") }
      };

    function sanitizerNode(n) {
	
        RED.nodes.createNode(this,n);
	this.sanitizerType = n.sanitizerType;
	this.exportType = n.exportType;
	this.rules = n.rules || [];
	this.checkall = n.checkall;

        var node = this;

        this.on('input', function (msg) {
		if(msg.hasOwnProperty("payload")){
			if(typeof msg.payload == "object"){
				if((!Buffer.isBuffer(msg.payload)) && (!util.isArray(msg.payload))){
					msg.payload = JSON.stringify(msg.payload)
				}
			}
		}
		
		if(node.sanitizerType=="simple"){
			msg.payload = simpleSanitizeJSON(msg.payload);
		}
		else if(node.sanitizerType=="escape"){
			msg.payload =escape(msg.payload);
		}
		else if(node.sanitizerType=="advanced"){
			    try {
				for (var i=0; i<node.rules.length; i+=1) {
				    var rule = node.rules[i];
				    node.warn(rule.t);
				    msg.payload = operations[rule.t](msg.payload);
				}
			    } catch(err) {
				node.warn(err);
			    }
		}


		if(typeof msg.payload == "string"){
				if(node.exportType == "string") node.send(msg);
				else if(node.exportType == "json"){
					try {
						msg.payload = JSON.parse(msg.payload);
						node.send(msg);
					    }
					    catch(e) { node.error(e.message,msg); }

				}
			}
	
        });

        this.on("close", function() {

        });
    }

    function simpleSanitizeJSON(msg){	
    	return msg.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/"/g,"\\\"").replace	(/'/g,"\\\'").replace(/\&/g, "\\&"); 
   }

    RED.nodes.registerType("sanitizer",sanitizerNode);

}

