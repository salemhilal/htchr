// Facebook app info and module imports.
var FacebookStrategy = require('passport-facebook').Strategy
  , FACEBOOK_APP_ID = "226224270843611"
  , FACEBOOK_APP_SECRET = "c06b0f2f32eaef7488805d871063accf"
  , path = require('path')
  , User = require('./db/models.js').User
  , graph = require('fbgraph')
  , request = require('request')
  , twSID = "AC4d0c86f9a7d24751b5ab01af6ba5c563"
  , twAuth = "fa13f367a1339a20172267d0554307cc"
  , twNum = "+16465026857";

module.exports = {
  configureApp: function (app, express, passport) {
    app.configure(function(){
      // Node
      app.set('port', process.env.PORT || 3000);
      app.set('views', __dirname + '/views');

      //Lets use EJS. None of that fancy Jade nonsense.
      app.set('view engine', 'ejs');

      // Express
      app.use(express.favicon());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser('8a8bd6c033c7a4e97f4e5994b291b43d'));
      app.use(express.session());

      // Passport
      app.use(passport.initialize());
      app.use(passport.session());

      app.use(app.router);
      app.use(express.static(path.join(__dirname, 'public')));
    });
    app.configure('development', function(){
      app.use(express.errorHandler());
    });
  },
  setupPassport: function (passport) {
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete Facebook profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });


    // Use the FacebookStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an access_token, refreshToken, and Facebook
    //   profile), and invoke a callback with a user object.
    passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      function(access_token, refreshToken, profile, done) {
        User.where('fbID', profile.id).findOne().exec(function (err, user) {
          // do we already have a user matching that id?
          if (user) { // yes? update their access token
            user.access_token = access_token;
            // Make sure we have a fresh copy of their friends list.
            graph.setAccessToken(access_token)
              .get("/" + profile.id + "/friends", function(err, res){
                user.friends = res.data;
                user.save();
                console.log("Updated " + user.name + "'s friendslist.")
                done(null, user);
              });
            
          } else { // no? create a new user in our db
            graph
              .setAccessToken(access_token)
              .get("/" + profile.id + "/friends", function(err, fbRes){
                user = new User({
                  fbID: profile.id,
                  name: profile.displayName,
                  email: profile.email,
                  access_token: access_token,
                  fbProfile: profile,
                  friends: fbRes.data,
                  prefs: {
                    "hash": {}, 
                    "top" : []
                  }
                });
                user.save();
                console.log("Created user profile for ", profile.displayName);
                done(null, user);
              });
          }
        });
      }
    ));
  },
  ensureAuthenticated: function(req, res, next) {
    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
  },
  sendSMS: function (recNumber, message, callback) {
    var url = "https://api.twilio.com/2010-04-01/Accounts/" + twSID + "/SMS/Messages.json";
    var auth = "Basic " + new Buffer(twSID + ":" + twAuth).toString("base64");
    var headers = {
      "Authorization": auth
    }
    var opts = {
      url: url,
      headers: headers,
      form: {
        "From": twNum,
        "To": recNumber,
        "Body": message
      }
    }
    request.post(opts, callback);
  }
}