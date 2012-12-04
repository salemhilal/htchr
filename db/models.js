var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  userID: {
  	type: String
  },
  name: String,
  email : String,
  accessToken: String
});

var placeSchema = new Schema({
  name: String,
  address: String,
  phoneNumber: String,
  location: { lat: Number, lng: Number },
  numEvents : Number
});

var eventSchema = new Schema({
  eventID: String,
  owner: Schema.ObjectId, // points to a user in OUR database
  name: String,
  description: String,
  startTime: Date, //or maybe string would be more useful (this is what FB passes it as)
  endTime: Date,
  location: Schema.ObjectId, // points to a place in OUR database
  invited: [{
    userID: String,
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