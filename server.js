var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;

var path = require('path');

app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

var _last_coffee_timestamp = null;

// List of the sites which will be displayed
var sites_available = {
  lb: { url: "http://lb2.mconf.org/dashboard", width: '70%'},
  jenkins: { url: "http://mconf-jenkins.inf.ufrgs.br/view/viewMonitor/", width: '30%'}
}

// Web sockets communication
io.on('connection', function(socket){
  console.log('a user connected');

  io.emit('sites', sites_available);

  var ct = 'No Coffee';
  if (_last_coffee_timestamp) {
    ct = _last_coffee_timestamp.toTimeString();
  }

  io.emit('coffee_update', {coffee_time: ct});

  socket.on('set_layout', function(msg) {
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// Server main view
app.get('/', function(req, res){
   res.render('index.html');
});

//
// API section
// ----------------
var _check_parameters = function(param_obj, param_list) {
  var suc = true;

  if (param_list == null)
    return suc

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

  ls_sites: {
    description: 'List all available sites',
    execute: function(req, res) {
      res.end(JSON.stringify(sites_available));
    }
  },

  ls: {
    description: 'List all available commands',
    execute: function(req, res) {
      var keys = Object.keys(commands);
      res.end(JSON.stringify(keys));
    }
  },

  help: {
    description: 'Print help for a specific command',
    params: ['cmd'],

    execute: function(req, res) {
      if (commands.hasOwnProperty(req.query.cmd)) {
        commands[req.query.cmd].params = commands[req.query.cmd].params || [];
        var method = commands[req.query.cmd].method || 'GET';
        var cmd = req.query.cmd;

        var str = cmd + '\n' + '--------' + '\n\n';
        str += method + ' /api/' + cmd + '/\n';
        str += 'PARAMS: ' + JSON.stringify(commands[cmd].params) + '\n\n';
        str += commands[cmd].description + '\n';

        res.end(str);
      } else {
        res.sendStatus(400);
      }
    }
  },

  activate_lb: {
    description: 'Ugly way to activate the lb bypassing the login screen',
    params: [],
    execute: function(req, res) {
      exec('DISPLAY=:0.0 xdotool mousemove 500 115 click 1')
      res.end()
    }
  },

  coffee_timestamp: {
    description: 'When was this coffee prepared?',
    execute: function(req, res) {
      res.end(_last_coffee_timestamp.toTimeString());
    }
  },

  set_coffee_timestamp: {
    description: 'Let the world know when coffee has last been prepared. \nTime param is optional, it will use current time if not present.',
    params: [],
    method: 'POST',
    execute: function(req, res) {
      _last_coffee_timestamp = new Date;

      io.emit('coffee_update', {coffee_time: _last_coffee_timestamp.toTimeString()});

      res.sendStatus(200);
    }
  }
}

// Api get requests
app.get('/api/:cmd', function(req, res){

  var cmd = req.params.cmd;
  if (commands.hasOwnProperty(cmd) &&
      _check_parameters(req.query, commands[cmd].params) &&
      commands[req.params.cmd].method == null || commands[req.params.cmd].method == 'GET') {
    commands[req.params.cmd].execute(req, res)
  } else {
    res.write('Invalid Parameters')
    res.sendStatus(400);
  }

});

// Api post requests
app.post('/api/:cmd', function(req, res){

  var cmd = req.params.cmd;
  if (commands.hasOwnProperty(cmd) &&
      _check_parameters(req.query, commands[cmd].params) &&
      commands[req.params.cmd].method == 'POST') {
    commands[req.params.cmd].execute(req, res)
  } else {
    res.write('Invalid Parameters')
    res.sendStatus(400);
  }

});

// Initialize server
var port = process.argv[2] || 3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});