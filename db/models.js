var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  fbID: {
  	type: String
  },
  name: String,
  email : String,
  access_token: String,
  friends: [{
    name: String,
    id: Number
  }], 
  prefs: {
    top: [String], //Keep the top 3 close.
    hash: Schema.Types.Mixed //Hash types to counts
  },
  fbProfile: Schema.Types.Mixed
  events: [String] //array of eventIDs attending
});

var placeSchema = new Schema({
  name: String,
  address: String,
  phoneNumber: String,
  location: {
    type: {
      lng: Number,
      lat: Number
    },
    index: '2d'
  },
  types: [String],
  numEvents : Number,
  googleData: Schema.Types.Mixed
});

var eventSchema = new Schema({
  eventID: String, // facebook event ID
  owner: Schema.ObjectId, // points to a user in OUR database
  ownerFbID: String,
  ownerName: String,
  name: String,
  description: String,
  startTime: Date, //or maybe string would be more useful (this is what FB passes it as)
  endTime: Date,
  placeID: Schema.ObjectId, // points to a place in OUR database
  invited: [{
    fbID: String,
    rsvpStatus: String
  }],
  hasDriver: Boolean,
  createdAt: {
  	type: Date,
  	default: Date.now
  },
  isPrivate: Boolean
});

module.exports = {
	User: mongoose.model('User', userSchema),
  Place: mongoose.model('Place', placeSchema),
  Event: mongoose.model('Event', eventSchema)
}