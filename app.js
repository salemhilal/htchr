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

// Events
app.get('/events/new'
  , myUtil.ensureAuthenticated
  , routes.events.new_GET);
app.post('/events/new'
  , myUtil.ensureAuthenticated
  , routes.events.new_POST);
app.get('/events/:id.json'
  , myUtil.ensureAuthenticated
  , routes.events.event_JSON)
app.get('/events/'
  , myUtil.ensureAuthenticated
  ,routes.events.event_GET)

// Event Feed
app.get('/events/feed'
  , myUtil.ensureAuthenticated
  , routes.events.feed_GET);
app.get('/events/feed.json'
  , myUtil.ensureAuthenticated
  , routes.events.feed_JSON);


// ex: http://localhost:3000/users/50bda97a1ef03b743e000002.json
app.get('/users/:id.json'
  , myUtil.ensureAuthenticated,
  routes.users.profile_JSON);

// Places 
/*app.get('/places/new'
  , myUtil.ensureAuthenticated
  , routes.places.new_GET);
app.get('/places/new'
  , myUtil.ensureAuthenticated
  , routes.places.new_GET);*/


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
