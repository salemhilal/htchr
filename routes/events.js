var models = require('../db/models.js')
	, User = models.User
	, Event = models.Event;

module.exports = {
	new_GET: function (req, res) {
		res.render('events/new');
	},
	new_POST: function (req, res) {
		var body = req.body;
		var uEvent = new Event({
			name: body.name,
			description: body.description,
			startTime: body.startTime,
			// get location shit working
			isPrivate: body.isPrivate == "true"
		});
		uEvent.save(function (err, retEvent) {
			if (err) {
				console.error(err);
				res.end('false');
			}
			else {
				console.log(retEvent);
				res.end('true');
			}
		});
	},
	feed_GET: function (req, res) {
		// regular feed request, render a page
		res.render('events/feed', { user: req.user });
	},
	feed_JSON: function (req, res) {
		// render the feed as a JSON response
		Event.find().sort('createdAt').exec(function (err, data) {
	    if (err) { res.end(); }
      else { res.end(JSON.stringify(data)); }
    });
	}
}