var sleep = require('sleep');
var fs = require('fs');
var content;
var device_dir = "/sys/bus/w1/devices";

var devices = [];

while(1) {
	devices = fs.readdirSync(device_dir);

	for(var dev in devices) {
		if(devices[dev].includes("28-")) {
			// console.log("Device: " + devices[dev]);
			content = fs.readFileSync(device_dir+"/"+devices[dev]+"/w1_slave", "utf-8");
			// console.log(content);
			var temp_match = /t=(\d+)/m;
			var temp = content.match(temp_match);
			console.log(devices[dev] + ": " + temp[1]/1000 + "\xB0"+"C");
		}
	}
	sleep.sleep(2);
}
