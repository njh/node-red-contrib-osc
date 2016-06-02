/**
 * Copyright 2016 Nicholas Humfrey, Nathanaël Lécaudé
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

        node.currentMessage = null;

        node.slipDecoder = new slip.Decoder({
            onMessage: function (m) {
                node.currentMessage.payload = m;
                var decodedMsg = node.decode(node.currentMessage);
                node.send(decodedMsg);
            }
        });

        node.decode = function(_msg) {
            _msg.raw = osc.readPacket(_msg.payload, {"metadata": node.metadata, "unpackSingleArgs": true});
            if (_msg.raw.packets) {
                _msg.topic = "bundle";
                _msg.payload = _msg.raw.packets;
            } else {
                _msg.topic = _msg.raw.address;
                _msg.payload = _msg.raw.args;
            }
            return _msg;
        };

        node.on("input", function(msg) {
            // When we get a Buffer
            if (Buffer.isBuffer(msg.payload)) {
                if (node.slip) {
                    // We buffer the msg so the slipDecoder callback can access it
                    node.currentMessage = msg;
                    node.slipDecoder.decode(msg.payload);
                    return;
                } else {
                    msg = node.decode(msg);
                }
            // When we get an Object
            } else {
                if (node.path === "") {
                    if (msg.topic === "" && !(typeof msg.payload === 'object' && msg.payload.packets)) {
                        node.error("OSC Path is empty, please provide a path using msg.topic");
                        return;
                    }
                } else {
                    msg.topic = node.path;
                }

                var packet;
                if (msg.payload === "") {
                    packet = {address: msg.topic, args: []};
                } else if (msg.payload === null) {
                    packet = {address: msg.topic, args: {"type": "N", "value": null}};
                } else if (typeof msg.payload === 'object' && msg.payload.packets) {
                    // If we receive a bundle
                    packet = msg.payload;
                    packet.timeTag = osc.timeTag(msg.payload.timeTag);
                } else {
                    packet = {address: msg.topic, args: msg.payload};
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
