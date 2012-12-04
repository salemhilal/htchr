// Modules
var http = require('http')
  , express = require('express')
  , passport = require('passport')
  , myUtil = require('./myUtil.js')

  , routes = require('./routes')

  , mongoose = require('mongoose');

// SET IT UP
var app = express();
myUtil.setupPassport(passport);
myUtil.configureApp(app, express, passport);
mongoose.connect('mongodb://localhost/htchr');

// Routes
app.get('/', routes.main.home);
app.get('/login', routes.main.login);
app.get('/logout', routes.main.logout);

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  routes.dummmy // request gets redirected to facebook
);
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  routes.auth.callback
);

app.get('/events/new', routes.events.new_GET);
app.post('/events/new', routes.events.new_POST);

app.get('/events/feed', routes.events.feed_GET);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
