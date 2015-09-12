var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
app.engine('jade', require('jade').__express)
app.set('view engine', 'jade')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var user = []

var routes = require('./app/userCtrl')(app);
var socketIo = require('./app/socketIo')(io,user);
var db = require('./db/db')


app.get('/', function(req, res){
   res.sendFile(__dirname + '/public/view/index.html');
});
app.set('port', (process.env.PORT || 5000));
app.use("/js", express.static(__dirname + '/public/js'));


// Connection URL. This is where your mongodb server is running.
var url = process.env.MONGOHQ_URL;

db.connect(url, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.',err)
    process.exit(1)
  } else {
    http.listen(app.get('port'), function(){
      console.log('listening on *:5000 ||',app.get('port'));
    });
    }
});
  

