var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set( "ipaddr", "127.0.0.1" );
app.set( "port", 8080 );

var users = [];
var onGoingTimer = false;

app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
console.log("page loaded");
});
    
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('jebaited', function(msg){
  	io.emit('jebaited', msg);
    console.log('jebaited used by ' + msg);
  });

  socket.on('buzzer', function(msg){
  	io.emit('buzzer', msg);
    console.log(msg[0] + ' buzzed at ' + msg[1]);
  });

  socket.on('join', function(msg){
  	console.log(msg + ' joined the user list');
  	io.emit('joined', msg);

  	users.push(msg);

  	io.emit('users', users);
  })

  socket.on('quit', function(msg){
  	console.log(msg + ' left the user list');
  	io.emit('quit', msg);

 	var index = users.indexOf(msg);

 	if (index > -1) {
 		users.splice(index, 1);
 	}

  	io.emit('users', users);
  })

  socket.on('start_timer', function(msg){
  	console.log('Timer started');
  	io.emit('timer', 10);
  	onGoingTimer = true;
  	timer(9);
  })
});

function timer(nextValue) {
	if (nextValue < 0 || !onGoingTimer) {
		io.emit('timer_end', 'end');
		onGoingTimer = false;
	} else {
		setTimeout(function() {
	    	io.emit('timer', nextValue);
	    	timer(nextValue - 1);
	    }, 1000);
	}
}

http.listen(3003, "127.0.0.1", function(){
  console.log('Jeoparino is running, listening on *:3003');
});