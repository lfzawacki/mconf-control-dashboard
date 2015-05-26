$(document).ready(function() {
  var socket = io();
  var sitesAvailable = [];

  var renderCount = 0;
  var renderPage = function(id, msg) {
    var fl = (renderCount % 2  == 0) ? 'left' : 'right';
    var element_id = '#' + id;

    if ($(element_id).length == 0)
    {
      var template = '<div style="float:' + fl + ';">';
      template += '<iframe src="" id="' + id + '" seamless="seamless" scrolling="no" marginheight="0" marginwidth="0" width="" height="100%"></iframe>';
      template += '</div>'

      $('body').append(template)
    }

    $(element_id).attr('src', msg[id].url);
    $(element_id).attr('width', msg[id].width);
  }

  socket.on('sites', function(msg) {
    // receives sites from server
    for (var key in msg) {

      if (msg.hasOwnProperty(key)) {
        renderPage(key, msg)
        sitesAvailable.push(key);
      }

    }
  });

  socket.on('layout', function(msg) {
    //change layout of current iframes
  });

  socket.on('current', function(msg) {
    // msg.current
  });
});