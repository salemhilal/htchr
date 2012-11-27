// Modules
var express = require('express')
  , http = require('http')
  , path = require('path')
  , myUtil = require('./myUtil.js')
  , passport = require('passport');

// Routes
var routes = require('./routes');

var app = express();

// Setup passport
myUtil.setupPassport(passport);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('8a8bd6c033c7a4e97f4e5994b291b43d'));
  app.use(express.session());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.main.home);

app.get('/login', routes.main.login);

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  routes.dummmy // request gets redirected to facebook
);

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  routes.auth.callback
);

app.get('/logout', routes.main.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
