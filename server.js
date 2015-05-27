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
  lb: { url: "http://lb2.mconf.org/dashboard", width: '70%'},
  jenkins: { url: "http://mconf-jenkins.inf.ufrgs.br:8080/view/Monitor", width: '30%'}
}

io.on('connection', function(socket){
  console.log('a user connected');

  io.emit('sites', sites_available);

  socket.on('set_layout', function(msg) {
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.get('/', function(req, res){
   res.render('index.html');
});

// Api section
var _check_parameters = function(param_obj, param_list) {
  var suc = true;
  for (var i = 0; i < param_list.length; i++) {
    suc = suc && param_obj.hasOwnProperty(param_list[i]);
  }
  return suc;
}

var commands = {
  set: {
    params: ['id', 'width'],
    description: 'Set parameters for the display',
    execute: function(req, res) {
      if (sites_available.hasOwnProperty(req.query.id)) {
        sites_available[req.query.id].width = req.query.width;

        io.emit('sites', sites_available);
        res.sendStatus(200);
      }
      else {
        res.sendStatus(400);
      }
    }
  },

  solo: {
    params: ['id'],
    description: 'Set one site as the only one to display',
    execute: function(req, res) {
      var new_sites = {};

      if (sites_available.hasOwnProperty(req.query.id)) {
        new_sites[req.query.id] = {url: sites_available[req.query.id].url, width: '100%'};
        io.emit('sites', new_sites);
        res.sendStatus(200);
      }
      else {
        res.sendStatus(400);
      }
    }
  },

  ls: {
    description: 'List all commands',
    execute: function(req, res) {
      var keys = Object.keys(commands);
      res.end(JSON.stringify(keys));
    }
  }
}

app.get('/api/:cmd', function(req, res){

  var cmd = req.params.cmd;
  if (commands.hasOwnProperty(cmd) && _check_parameters(req.query, commands[cmd].params)) {
    commands[req.params.cmd].execute(req, res)
  } else {
    res.write('Invalid Parameters')
    res.sendStatus(400);
  }

});

var port = process.argv[2] || 3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});