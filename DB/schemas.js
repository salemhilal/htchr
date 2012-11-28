var mongoose = require('mongoose');

module.exports = {
	userSchema: new mongoose.Schema({
	  userID: {
	  	type: String
	  },
	  name: String,
	  email : String
	}),
	placeSchema: new mongoose.Schema({
	  name: String,
	  location: [{lat:Number, lng:Number }],
	  numEvents : Number
	}),
	eventSchema: new mongoose.Schema({
	  eventID: String,
	  owner: {
	    id: String,
	    name: String
	  },
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
	})
}