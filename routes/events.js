var models = require('../db/models.js')
	, User = models.User
	, Event = models.Event
	, Place = models.Place;

module.exports = {
	new_GET: function (req, res) {
		res.render('events/new');
	},
	new_POST: function (req, res) {
		var placeBody = req.body.placeData;
		var eventBody = req.body.eventData;

		Place.find({name : placeBody.name}, function(err, result) {
			if (err) {
				console.log("SHIT WENT WRONG MOFUCKA", err);
			}
			else if (result) {
				console.log("THIS SHITS ALREADY IN HERE");
			}
			else {
				var uPlace = new Place({
					name : placeBody.name,
					address : placeBody.address,
					phoneNumber : placeBody.phoneNumber,
					location : {lat : placeBody.lat,
								lng : placeBody.lng},
					numEvents : 0
				});

				uPlace.save(function (err, retPlace) {
					if (err) {
						console.log("place insert error", err);
					}
					else {
`					}
				});
			}


			var uEvent = new Event({
				name: eventBody.name,
				description: eventBody.description,
				startTime: eventBody.startTime,
				// get location shit working
				isPrivate: eventBody.isPrivate == "true"
			});
			
			uEvent.save(function (err, retEvent) {
				if (err) {
					console.error(err);
					res.end('false');
				}
				else {
					res.end('true');
				}
			});			

		});

	},
	feed_GET: function (req, res) {
		// regular feed request, render a page
		res.render('events/feed', { user: req.user });
	},
	feed_JSON: function (req, res) {
		// render the feed as a JSON response
		Event.find().sort('-createdAt').exec(function (err, data) {
	    if (err) { res.end(); }
      else { res.end(JSON.stringify(data)); }
    });
	}
}