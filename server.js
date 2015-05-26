var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var path = require('path');

app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

var sites_available = {
  lb: { url: "http://lb2.mconf.org/login", width: 750},
  jenkins: { url: "http://mconf-jenkins.inf.ufrgs.br:8080/view/Monitor", width: 600}
}

io.on('connection', function(socket){
  console.log('a user connected');

  io.emit('sites', sites_available);

  socket.on('set_current', function(msg) {

    io.emit('current', msg.current);
  });

  socket.on('set_layout', function(msg) {

  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.get('/', function(req, res){
   res.render('index.html');
});

var port = process.argv[2] || 3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});