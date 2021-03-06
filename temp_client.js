var ip = location.host;

$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var host = 'ws://' + ip + ':31338';
    var connection = new WebSocket(host);

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
	    try {
		    var json = JSON.parse(message.data);
	    } catch(e) {
		    console.log('This doesn\'t look like a valid JSON: ', message.data);
		    return;
	    }
	    console.log(message.data);
	    var json = JSON.parse(message.data);
	    var d = new Date();
	    if(json.id == 0) {
		    temp0.innerHTML = "Sensor 0: " + json.temperature + "\xB0"+"C";
		    var img = json.device + "-daily.png?ts=" + d.getTime();
		    document.getElementById("img_temp0").src=img;
		    var img_weekly = json.device + "-weekly.png?ts=" + d.getTime();
		    document.getElementById("img_temp1").src=img_weekly;
	    }
	    if(json.id == 1) {
		    temp1.innerHTML = "Sensor 1: " + json.temperature + "\xB0"+"C";
		    var img = json.device + "-daily.png?ts=" + d.getTime();
		    document.getElementById("img_temp1").src=img;
	    }
    };
});

