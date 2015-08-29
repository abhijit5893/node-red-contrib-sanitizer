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
	'tabspace': function(a) {  return a.replace(/\t/g, "\\t"); },
	'uri': function(a) {  return encodeURI(a); },
	'htmlescape': function(a) {  return  escape(a); },
	'password': function(a) { try{
					var obj= JSON.parse(a);
					pwdSanitizer(obj);
					a=JSON.stringify(obj);
				}
				catch(err){
					node.warn("JSON cannot be parsed");
				} 
			return a; },
	'null': function(a) {  return 	a.replace(/\bnull\b/g, ""); }
      };
	
     var lenOS = {
	'windows' : 8191,
	'ubuntu' : 2097152,
	'centos' : 2621440,
	'solaris' : 1048320,
	'macosx' : 262144
     };

    function sanitizerNode(n) {
	
        RED.nodes.createNode(this,n);
	this.sanitizerType = n.sanitizerType;
	this.exportType = n.exportType;
	this.rules = n.rules || [];
	this.checkall = n.checkall;
	this.lengthRule= n.lengthRule;

        var node = this;

        this.on('input', function (msg) {
		/* The node is programmed to handle JSON as string and JSON as object as input*/
		if(msg.hasOwnProperty("payload")){
			if(typeof msg.payload == "object"){
				if((!Buffer.isBuffer(msg.payload)) && (!util.isArray(msg.payload))){
					msg.payload = JSON.stringify(msg.payload)
				}
			}
		}
		/* If JSON is improperly parsed, users are warned*/
		try{
			JSON.parse(msg.payload);
		}
		catch(err){
			node.warn("JSON is improper due to "+err);
		}
		
		/* Different types of sanitizing options. (Switch can also be used in place of if-else) */
		if(node.sanitizerType=="simple"){
			msg.payload = simpleSanitizeJSON(msg.payload);
		}
		else if(node.sanitizerType=="len"){
			var msglen= msg.payload.length;
			if (msglen > lenOS[node.lengthRule]){
				msg.payload = msg.payload.substring(0, lenOS[node.lengthRule]);
			}
			
		}
		else if(node.sanitizerType=="uri"){
			msg.payload = encodeURI(msg.payload);
		}
		else if(node.sanitizerType=="htmlescape"){
			msg.payload =escape(msg.payload);
		}
		else if(node.sanitizerType=="password"){
			try{
				var obj= JSON.parse(msg.payload);
				pwdSanitizer(obj);
				msg.payload=JSON.stringify(obj);
			}
			catch(err){
				node.warn("JSON cannot be parsed");
			}
		}
		else if(node.sanitizerType=="nll"){
			msg.payload= msg.payload.replace(/\bnull\b/g, "");
		}
		else if(node.sanitizerType=="advanced"){
			    try {
				for (var i=0; i<node.rules.length; i+=1) {
				    var rule = node.rules[i];
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
        
        /* Do nothing on close*/
        this.on("close", function() {

        });
    }
    
    /* Utility function for password sanitizer */	
    function pwdSanitizer(obj){
		var keys = Object.keys(obj);
		for (var item in keys){
		 var key = keys[item];
		 if(typeof obj[key]=="object"){
		   pwdSanitizer(obj[key]);
		 }
		 if(key == "password"|| key == "pwd" || key == "passwd"){
		    obj[key]= obj[key].replace(/./g,"#");
		  }
		 }
	}

    /* Simple Sanitizer */
    function simpleSanitizeJSON(msg){	
    	return msg.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/"/g,"\\\"").replace	(/'/g,"\\\'").replace(/\&/g, "\\&"); 
   }

    RED.nodes.registerType("sanitizer",sanitizerNode);

}

