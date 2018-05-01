var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
res.sendFile(__dirname + '/html/index.html');
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
});

http.listen(3003, function(){
  console.log('Jeoparino is running, listening on *:3003');
});