var models = require('../db/models.js')
	, User = models.User
	, Event = models.Event
	, Place = models.Place
	, graph = require('fbgraph');

module.exports = {
	// Render the page to create an event
	new_GET: function (req, res) {
		res.render('events/new');
	},
	// Create new event
	new_POST: function (req, res) {
		// Configure the graph API module
		graph.setAccessToken(req.user.access_token);

		// Two main piece of info we get in the POST data
		var placeBody = req.body.placeData;
		var eventBody = req.body.eventData;

		// Check to see if the place the user entered has been used before
		Place.find({name : placeBody.name}, function(err, places) {

			// a function to make and save an event given a place ID
			var makeEvent = function (placeID) {
				// event we're going to store in our database
				var hEvent = new Event({
					name: eventBody.name,
					description: eventBody.description,
					startTime: eventBody.startTime,
					owner: req.user.id,
					ownerName: req.user.name,
					isPrivate: eventBody.isPrivate == "true",
					placeID: placeID
				});

				// save event in our database
				hEvent.save(function (err) {
					if (err) {
						console.error(err);
						res.end('false');
					}
					else {
						// event saved, prepare POST data to send to Facebook
						var fbData = {
							name: hEvent.name,
							// start_time needs to meet facebook's spec
							start_time: hEvent.startTime.toISOString(),
							privacy_type: hEvent.isPrivate ? "SECRET" : "OPEN"
						}

						graph.post(req.user.fbID + '/events', fbData, function (err, fbRes) {
							if (err) {
								console.error(err);
								res.end(JSON.stringify({
									error: "bad fb request"
								}));
							} else {
								// did we get an event ID back from facebook?
								if (fbRes.id) {
									// update event document in OUR database with FB's reference ID for the event
									hEvent.eventID = fbRes.id;
									hEvent.save();

									res.end(JSON.stringify(fbRes));
								}
							}
						});
					}
				});
			} // end makeEvent function

			if (err) {
				console.error(err);
			}

			// Is there already a place corresponding to our event?
			if (places.length !== 0) {
				makeEvent(places[0]._id);
			}
			else {
				// No corresponding place, make a new one in our DB
				var hPlace = new Place({
					name : placeBody.name,
					address : placeBody.address,
					phoneNumber : placeBody.phoneNumber,
					location : {
						lng : parseFloat(placeBody.lng),
						lat : parseFloat(placeBody.lng)
					},
					numEvents : 0,
					// save all the data google sends us for the fuck of it
					googleData: placeBody.googleData
				});

				// save the new place in our database
				hPlace.save(function (err) {
					if (err) {
						console.error(err);
					}
					else {
						// finally create the event based on the place id
						makeEvent(hPlace._id);
					}
				});
			}
		});
	},
	// Get event data
	event_JSON: function (req, res){
		var id = req.params.id;
		Event.findById(id, function(err, event){
			if (err) {
				console.error(err);
				res.end(JSON.stringify({ error: "event lookup failed" }));
			}
			res.end(JSON.stringify(event));
		});
	},
	// Get event details view
	event_GET: function (req, res) {
		res.render('events/view');
	},
	//Get the feed view
	feed_GET: function (req, res) {
		// regular feed request, render a page
		res.render('events/feed', { user: req.user });
	},
	//Get the feed data.
	feed_JSON: function (req, res) {
		// render the feed as a JSON response
		Event.find().sort('-createdAt').limit(20).exec(function (err, data) {
	    if (err) {
	    	console.error(err);
	    	res.end(JSON.stringify({ error: "event lookup failed" }));
	    }
	    else {
      	res.end(JSON.stringify({
      		data: data,
      		time: new Date()
      	}));
      }
    });
	}
}