var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set( "ipaddr", "127.0.0.1" );
app.set( "port", 8080 );

var users = {};
var usersCurrentGame = {};
var multiplier = {};
var onGoingTimer = false;
var currentPlayer = 0;
var timer = 0;

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
  	if (Object.keys(users)[currentPlayer] === mqg[0]) {
    	console.log('jebaited used by ' + msg[0] + ' at ' + + msg[1]);
    	//TODO nextPlayer();
  	} else {
  		io.emit('jebaited_failed', msg[0]);
  	}
  });

  socket.on('buzzer', function(msg){
  	io.emit('buzzer', msg);
    console.log(msg[0] + ' buzzed at ' + msg[1]);
  });

  socket.on('join', function(msg){
  	console.log(msg + ' joined the user list');
  	io.emit('joined', msg);

  	users[msg] = 0;
  	usersCurrentGame[msg] = 0;
  	multiplier[msg] = 1;

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
  	timer = 10;
  	io.emit('timer', timer);
  	onGoingTimer = true;
  	timer = 9;
  	timer();
  })

  socket.on('end_timer', function(msg){
  	console.log('Timer ended');
  	io.emit('timer_end', timer);
  	onGoingTimer = false;
  })

  socket.on('pause_timer', function(msg){
  	console.log('Timer paused');
  	io.emit('timer', timer);
  	onGoingTimer = false;
  })

  socket.on('unpause_timer', function(msg){
  	console.log('Timer unpaused');
  	io.emit('timer', timer);
  	onGoingTimer = true;
  	timer = 9;
  	timer();
  })

  socket.on('award', function(msg){
  	console.log("Awarding " + msg[1] + " points to " + msg[0]);

  	usersCurrentGame[msg[0]] += (msg[1] * multiplier[msg[0]]);

  	io.emit('users', usersCurrentGame);
  })

  socket.on('remove', function(msg){
  	console.log("Removing " + msg[1] + " points from " + msg[0]);

  	usersCurrentGame[msg[0]] -= msg[1];

  	io.emit('users', usersCurrentGame);
  })

  socket.on('end_mini_game', function(msg){
  	console.log("Ending minigame, adding points");

  	for (var i in Object.keys(users)) {
  		users[i] += usersCurrentGame[i];
  	}

  	io.emit('users', users);
  })

  socket.on('start_game', function(msg){
  	console.log("Starting game, locking new players out. GM is " + msg);

  	delete users[msg];
  	delete usersCurrentGame[msg];
  	delete multiplier[msg];

  	currentPlayer = 0;

  	io.emit('current_player', Object.keys(users)[currentPlayer]);
  	io.emit('started', msg);
  	io.emit('users', users);
  })
});

function timer() {
	if (timer < 0) {
		io.emit('timer_end', 0);
		onGoingTimer = false;
	} else {
		setTimeout(function() {
	    	io.emit('timer', timer);
	    	timer = timer - 1;
	    	timer();
	    }, 1000);
	}
}

http.listen(3003, "127.0.0.1", function(){
  console.log('Jeoparino is running, listening on *:3003');
});