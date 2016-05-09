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
    var slip = require('slip');

    function OSC(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        node.path = n.path;
        node.slip = n.slip;
        node.metadata = n.metadata;

        node.on("input", function(msg) {

            function decode() {
                msg.raw = osc.readPacket(msg.payload, {"metadata": node.metadata, "unpackSingleArgs": true});
                if (msg.raw.packets) {
                    msg.topic = "bundle";
                    msg.payload = msg.raw.packets;
                } else {
                    msg.topic = msg.raw.address;
                    msg.payload = msg.raw.args;
                }
            }

            // When we get a Buffer
            if (Buffer.isBuffer(msg.payload))
            {
                if (node.slip) {
                    var decoder = new slip.Decoder({
                        onMessage: function (m) {
                            msg.payload = m;
                            decode();
                        }
                    });
                    decoder.decode(msg.payload);
                } else {
                    decode();
                }
            // When we get an Object
            } else {
                var path;
                if (node.path === "") {
                    if (msg.topic === "" && !msg.payload.packets) {
                        node.error("OSC Path is empty, please provide a path using msg.topic");
                        return;
                    } else {
                        path = msg.topic;
                    }
                } else {
                    path = node.path;
                    msg.topic = path;
                }

                var packet;
                // If we receive a bundle
                if (msg.payload.packets) {
                    packet = msg.payload;
                    packet.timeTag = osc.timeTag(msg.payload.timeTag);
                } else {
                    packet = {address: path, args: msg.payload};
                }

                msg.payload = new Buffer(osc.writePacket(packet));
                if (node.slip) {
                    msg.payload = new Buffer(slip.encode(msg.payload));
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
