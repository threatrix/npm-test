// 
// Onkyo Amp contoller for Alexa
//
// Variable Section
var net = require('net');

// get a reference to your required module
var onkyo = require('./onkyo');
var config = onkyo.config;



// Main conroller section. Will call out to onkyo device and execute command.
exports.controller=(intent) => {

	var result = "<speak>Sorry Master, I don't understand your command.</speak>";
	
	// Based on the intent obtain code and value to send to Onkyo
	var cmdBlk = config.onkyo.intents[intent.name];
	
	if (cmdBlk) {
		var cmd = cmdBlk.command;
		var param = null;
		// Intent specfic logic to process slot values
		if (intent.name == "volumeIntent") {
			var volume = "00";
			if (intent.slots.volLevel && intent.slots.volLevel.value) {
				console.log ("!!! I am Here !!!");
				// fill slot values into parmas
				// value cannot be over 80 Dec for TXNR509 or 50 HEX
				volume = parseInt(intent.slots.volLevel.value) % (config.onkyo.maxVolume + 1);
				param = (volume.toString(16)).toUpperCase(); // convert to Hex
			}
			else if (intent.slots.volUpDown) {
					console.log(intent.slots.volUpDown);
					param = cmdBlk[intent.slots.volUpDown.value];
					console.log("*** " + param + " ***");
			}
		}
		else if (intent.name == "powerIntent") {
			param = cmdBlk[intent.slots.powerSlot.value];
		} else if (intent.name == "switchIntent") {
			param = cmdBlk[intent.slots.switchSlot.value];
		} else if (intent.name == "modeIntent") {
			param = cmdBlk[intent.slots.modeSlot.value];
		} else if (intent.name == "muteIntent") {
			param = cmdBlk[intent.slots.muteSlot.value];
		} else if (intent.name == "switchIntent") {
			param = cmdBlk[intent.slots.switchSlot.value];
			console.log("------ Switch Intent ------");
			if(!param) {
				// Were there any resolutions
				console.log('***param: ' + intent.slots.switchSlot.resolutions.resolutionsPerAuthority);
				param = cmdBlk[intent.slots.switchSlot.resolutions.resolutionsPerAuthority[0].values[0].value];
			}
		}
		
		if ( cmd && param) {
			var message = "!1" + cmd + String("00" + param).slice(-2);

			// Make sure to follow Onkyo Serial protocol
			var packet = "ISCP\x00\x00\x00\x10\x00\x00\x00" +
				String.fromCharCode(message.length + 1) +
				"\x01\x00\x00\x00" +
				message + 
				"\x0D";

			var client = new net.Socket();
			
			// config is defined in the global scope and initilized in onkyo.js
			client.connect(config.onkyo.port, config.onkyo.device, function() {
				// for debug only
				console.log('CONNECTED TO: ' + config.onkyo.device+ ':' + config.onkyo.port);		
				console.log("Sending Message: " + packet);

				// Write a message to the socket as soon as the client is 
				// connected, the server will receive it as message 
				// from the client 
				client.write(packet);
			});

			// Add a 'data' event handler for the client socket
			// data is what the reciever sent to this socket
			client.on('data', function(data) {
				console.log ('****************');
				console.log('Status: ' + data); // for debug only
				console.log ('****************');
				// Close the client socket completely
				client.destroy();	
			});

			// Add a 'close' event handler for the client socket
			client.on('close', function() {
				console.log('Connection closed');
			});
			result =  "<speak>Done Master!</speak>";
		}
	}
	return result;	
}
