// HTTP PORTION

var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	// console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}


//FOR JOINING A SPECIFIC ROOM
//the client sends a request for what room they want to join

var theRoom; //store room name
var questNum=0; //store how many questions have been asked
// attach Socket.io to our HTTP server
var io = require('socket.io').listen(httpServer);

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
	// console.log('someone connected');
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', function(data) {
    	//join the specific room that the client choose
        socket.join(data);

        theRoom = data;
        console.log("someone connected to room " + theRoom);

        var greeting = 'welcome to room ' + theRoom + '!';

        io.sockets.in(theRoom).emit('message', greeting);
    });

    socket.on('chatmessage', function(data) {
		// Data comes in as whatever was sent, including objects
		console.log("Received: 'chatmessage' " + data);
		
		// Send it to all of the clients
		io.sockets.in(theRoom).emit('chatmessage', data);
	});

	socket.on('quizmessage', function(data) {
		// Data comes in as whatever was sent, including objects
		console.log("Received: 'chatmessage' " + data);
		
		// Send it to all of the clients
		io.sockets.in(theRoom).emit('quizmessage', {
			'data': data,
			'questNum': questNum
		});
		//Increase the number of questions asked
		questNum++;
	});

	socket.on('expectedans', function(data){
		console.log("Received expected ans: "+ data);
		io.sockets.in(theRoom).emit('receiveexpectedans',data);
	});

	socket.on('correct', function(data){
		// console.log(data);
		// send info on question answered correctly and who answered it
		socket.broadcast.in(theRoom).emit('correctans', data);
	})
});
