var mongoose = require('mongoose')
  , db = mongoose.createConnection('mongodb://localhost/htchr')
  , schemas = require('./schemas.js');

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  // console.log("connected.");
});

var User = db.model('Users', schemas.userSchema);
var Place = db.model('Places', schemas.placeSchema);
var Event = db.model('Events', schemas.eventSchema);

var matt = new User({
  userID: 1,
  name: "Matt Schallert",
  email: "mattschallert@gmail.com"
});

var dima = new User({
  userID: 2,
  name: "Dima Ivanyuk",
  email: "dimaivanyuk@gmail.com"
});

var salem = new User({
  userID: 3,
  name: "Salem Hilal",
  email: "salemhilal@gmail.com"
});

// matt.save(); dima.save(); salem.save();

var costcoTrip = new Event({
  eventID: 1,
  owner: {
    id: 1,
    name: "Matt Schallert"
  },
  name: "Costco Trip",
  description: "Going to Costco",
  startTime: new Date(2012, 11, 29, 12, 00, 00, 00)
});

costcoTrip.save();

db.close();