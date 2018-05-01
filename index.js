var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set( "ipaddr", "127.0.0.1" );
app.set( "port", 8080 );

var users = [];

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

  	users.push(msg[0]);

  	io.emit('users', users);
  })

  socket.on('quit', function(msg){
  	console.log(msg + ' left the user list');
  	io.emit('quit', msg);

  	users.remove(msg);

  	io.emit('users', users);
  })
});

http.listen(3003, "127.0.0.1", function(){
  console.log('Jeoparino is running, listening on *:3003');
});

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};