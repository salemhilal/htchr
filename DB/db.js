var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/test');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("connected.");
});

var userSchema = new mongoose.Schema({
    userID: String,
    name: String,
    email : String
});

var placeSchema = new mongoose.Schema({
    name: String,
    location: [{lat:Number, lng:Number }],
    numEvents : Number
});

var eventSchema = new mongoose.Schema({
    eventID: String,
    owner: String,
    name: String,
    description: String,
    startTime: Date, //or maybe string would be more useful (this is what FB passes it as)
    endTime: Date,
    location: String,
    venue: String,
    privacy: String,
    updatedTime: Date,
    picture: String,
    invited: [{
        userID: String,
        rsvpStatus: String
    }],
    hasDriver: Boolean
});

var Users = db.model('Users', userSchema);
var Places = db.model('Places', placeSchema);
var Events = db.model('Events', eventSchema);
