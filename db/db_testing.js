var mongoose = require('mongoose')
  , schemas = require('./schemas.js');

mongoose.connect('mongodb://localhost/htchr');

var User = mongoose.model('Users', schemas.userSchema);
var Place = mongoose.model('Places', schemas.placeSchema);
var Event = mongoose.model('Events', schemas.eventSchema);

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

var costcoTrip = new Event({
  eventID: 1,
  owner: matt.id,
  name: "Costco Trip",
  description: "Going to Costco",
  startTime: new Date(2012, 10, 29, 12, 00, 00, 00)
});

matt.save(); dima.save(); salem.save(); costcoTrip.save();

mongoose.disconnect();