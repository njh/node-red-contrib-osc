# node-red-contrib-osc

The *node-red-contrib-osc* module adds support to [Node-RED] for decoding and encoding OSC ([Open Sound Control]) messages.

This then makes it easy to bridge between other protocols, for example HTTP or MQTT.

![screenshot](https://github.com/njh/node-red-contrib-osc/raw/master/screenshot.png)

## Warning

Version 1.0 breaks backwards compatibility. The node was updated to be transport agnostic and now requires the use of the different input and output objects provided by Node-RED. To see some examples, go to the Node-RED menu under import and you should see different example flows for the new node.

In the newer version there is a single node as opposed to 2 different ones.  The node will automatically detect the input type (buffer or object) and will convert it appropriately.

## Installation

Change to your node-red installation directory and then run:

    npm install node-red-contrib-osc

You will then be able to see the new OSC node type added to Node-RED's pallet on the left.

If you need [SLIP] encapsulation (when using OSC over a Serial Port or TCP), then there please also install the [SLIP node]:

    npm install node-red-contrib-slip

And then add a SLIP decoder in front of the OSC node or a SLIP encoder after the OSC node.



Copyright and license
---------------------

Copyright 2014-2016 Nicholas Humfrey and Nathanaël Lécaudé under [the Apache 2.0 license](LICENSE).


[Node-RED]:           http://nodered.org/
[SLIP]:               http://tools.ietf.org/html/rfc1055
[SLIP Node]:          http://flows.nodered.org/node/node-red-contrib-slip
[Open Sound Control]: http://opensoundcontrol.org/introduction-osc
