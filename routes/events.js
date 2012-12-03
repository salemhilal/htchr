var models = require('../db/models.js')
	, User = models.User
	, Event = models.Event;

module.exports = {
	new_GET: function (req, res) {
		if(req.user){
			res.render('events/new');
		} else {
			res.redirect('/')
		}
	},
	new_POST: function (req, res) {
		var body = req.body;
		var uEvent = new Event({
			name: body.name,
			description: body.description,
			startTime: body.startTime,
			// get location shit working
			isPrivate: body.isPrivate
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
	}
}