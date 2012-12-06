var models = require('../db/models.js')
	, User = models.User
	, Event = models.Event
	, Place = models.Place
	, graph = require('fbgraph');

module.exports = {
	// Get the event creation view
	new_GET: function (req, res) {
		res.render('events/new');
	},
	// Create new event
	new_POST: function (req, res) {

		// Configure the graph API module
		graph.setAccessToken(req.user.access_token);

		var placeBody = req.body.placeData;
		var eventBody = req.body.eventData;

		Place.find({name : placeBody.name}, function(err, result) {
			var makeEvent = function (placeID) {
				// a function to make and save an event given a place ID
				var uEvent = new Event({
					name: eventBody.name,
					description: eventBody.description,
					startTime: eventBody.startTime,
					owner: req.user.id,
					ownerName: req.user.name,
					isPrivate: eventBody.isPrivate == "true",
					placeID: placeID
				});
				uEvent.save(function (err, retEvent) {
					if (err) {
						console.error(err);
						res.end('false');
					}
					else {
						var fbData = {
							name: retEvent.name,
							start_time: retEvent.startTime.toISOString(),
							privacy_type: retEvent.isPrivate ? "SECRET" : "OPEN"
						}
						graph.post(req.user.fbID + '/events', fbData, function (err, fbRes) {
							if (err) { console.error(err); res.end(JSON.stringify({ error: "bad fb request" })); }
							else {
								console.log(fbRes);
								if (fbRes.id) {
									retEvent.eventID = fbRes.id;
									retEvent.save(function (err, finalEvent) { res.end(JSON.stringify(fbRes)); });
								}
							}
						});
					}
				});
			}

			if (err) {
				console.error(err);
			}

			if (result.length !== 0) {
				console.log("Place already in DB");
				makeEvent(result[0]._id);
			}
			else {
				console.log('making place');
				var uPlace = new Place({
					name : placeBody.name,
					address : placeBody.address,
					phoneNumber : placeBody.phoneNumber,
					location : {
						lng : parseFloat(placeBody.lng),
						lat : parseFloat(placeBody.lng)
					},
					numEvents : 0,
					googleData: placeBody.googleData
				});

				uPlace.save(function (err, retPlace) {
					if (err) {
						console.error(err);
					}
					else {
						console.log("place saved succesfully!");
						makeEvent(retPlace._id);
					}
				});
			}
		});
	},
	// Get event data
	event_JSON: function (req, res){
		var id = req.params.id;
		Event.findById(id, function(err, event){
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
		    if (err) { res.end(); }
	      else { res.end(JSON.stringify({data: data, time: new Date()})); }
	    });
	}
}