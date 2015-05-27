$(document).ready(function() {
  var socket = io();
  var sitesAvailable = [];

  var renderCount = 0;
  var renderPage = function(id, msg) {
    var fl = (renderCount % 2  == 0) ? 'left' : 'right';
    var element_id = '#' + id;

    var template = '<div class="site">';
    template += '<iframe src="" id="' + id + '" seamless="seamless" scrolling="no" marginheight="0" marginwidth="0" width="" height="100%"></iframe>';
    template += '</div>'

    $('body').append(template)

    $(element_id).attr('src', msg[id].url);
    $(element_id).attr('width', msg[id].width);
  }

  // receives sites from server
  socket.on('sites', function(msg) {

    // remove old sites
    $('.site').remove();

    for (var key in msg) {

      if (msg.hasOwnProperty(key)) {
        renderPage(key, msg)
        sitesAvailable.push(key);
      }

    }
  });

  // socket.on('layout', function(msg) {
  //   //change layout of current iframes
  // });

});