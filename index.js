var axios = require('axios');
var moment = require('moment');
var apiai = require('apiai');
require('dotenv').config()

var app       = apiai(process.env.APIAI_TOKEN);
var roomId    = process.env.ROOM;
var token     = process.env.GITTER_TOKEN;
var replied   = false;
var repText   = 'Mmmm';
var sesReplied = false;

var options = {
  baseURL:  'https://api.gitter.im/',
  url:      '/v1/rooms/' + roomId + '/chatMessages',
  method:   'get',
  headers:  {'Authorization': 'Bearer ' + token}
};

var reply = (response) => {
  axios({
    baseURL:  'https://api.gitter.im/',
    url:      '/v1/rooms/' + roomId + '/chatMessages',
    method:   'post',
    headers:  {'Authorization': 'Bearer ' + token},
    data:     {text: response}
  }).then(res => {
    if(res.status==200) {
      console.log('success');
    } else {
      console.log('failed');
    }
  })
}

function fun() {
  axios(options).then(msg => {
    var data = msg.data;
    var sentBy = data[data.length-1].fromUser.username;
    if(sentBy !== "spideythebot") {
      var sentTime = data[data.length-1].sent;
      if(moment().diff(sentTime, 'minutes')>=2 && !replied) {
        reply('Hi there. Tag me with `@spideythebot` to chat with me.');
        replied = true;
      } else if(replied && !sesReplied && data[data.length-1].text.includes('@spideythebot')) {
        if(data[data.length-1].text == '@spideythebot help') {
          reply("Are you a newcomer? You can ask me a lot of things.");
          sesReplied = true;
        } else {
          var request = app.textRequest(data[data.length-1].text, {
            sessionId: 'Session'
          });
          request.on('response', function(response) {
            reply(response.result.fulfillment.speech);
          });
          sesReplied = true;
          request.end();
        }
      } else {
        sesReplied = false;
      }
    }
  })
}

setInterval(function(){ fun(); }, 5000);
