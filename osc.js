/**
 * Copyright 2014 Nicholas Humfrey
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
    var osc = require('osc');

    function OSC(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        node.path = n.path;
        node.mode = n.mode;

        node.on("input", function(msg) {
            // When we get a Buffer
            if (Buffer.isBuffer(msg.payload))
            {
                if (node.mode == "buffer") {
                    // Do nothing
                }
                else {
                    msg.raw = osc.readPacket(msg.payload, {"metadata": false});
                    msg.topic = msg.raw.address;
                    if (msg.raw.args.length == 1) {
                        msg.payload = msg.raw.args[0];
                    } else {
                        msg.payload = msg.raw.args;
                    }
                }
            // When we get an Object
            } else {
                var path;
                if (node.path === "") {
                    if (msg.topic === "") {
                        node.error("OSC Path is empty, please provide a path using msg.topic");
                        return;
                    } else {
                        path = msg.topic;
                    }
                } else {
                    path = node.path;
                    msg.topic = path;
                }

                if (node.mode == 'object') {
                    // Do nothing
                } else {
                    var packet = {address: path, args: msg.payload};
                    msg.payload = new Buffer(osc.writePacket(packet));
                }
            }
            node.send(msg);
        });

        node.on("close", function() {
            //Tidy up things here
        });
    }
    RED.nodes.registerType("osc", OSC);
};
