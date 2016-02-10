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

    $('#sites').append(template)

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

  socket.on('coffee_update', function(msg) {
    $('#coffee-time').html(msg.coffee_time);
  });

  // socket.on('layout', function(msg) {
  //   //change layout of current iframes
  // });

  $('#coffee-button').on('click', function(e) {
    $.ajax({
      type: "POST",
      url: '/api/set_coffee_timestamp',
      data: '',
      success: function() { console.log('Posted'); },
    });

    e.preventDefault();
  });

});