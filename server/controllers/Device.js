'use strict';
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

function Device(pinNo) {
 	//pinNo = GPIO01; io: used as input or output; pinState: LOW or HIGH
 let self = { 
    	pin: new Gpio(pinNo, 'out'),//new Gpio(pinNo, pin_for_io)
    	gpio: pinNo,
    	id: "GPIO" + pinNo,
    	state: 0 // initial state
  }
  	return self
}

function Sensor(pinNo, deviceId) {
 	 //pinNo = GPIO01; io: used as input or output; pinState: LOW or HIGH
  	let self = {
    	pin: new Gpio(pinNo, 'in', 'both'),
    	gpio: pinNo,
    	deviceId: deviceId,
    	id: "GPIO" + pinNo,
    	state: 0 // initial state
  }
  	return self
}

exports.Device = Device
exports.Sensor = Sensor
