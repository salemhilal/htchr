var models = require('../db/models.js')
  , User = models.User
  , Event = models.Event;

module.exports = {
  profile_JSON: function (req, res) {
    var id = req.params.id;
    if (id === 'current') {
      res.end(JSON.stringify(req.user));
    }

    else {
      User.findById(id, function (err, user) {
        if (err) { res.end('error'); }
        else { res.end(JSON.stringify(user)); };
      });
    }
  }, 

  profile_GET: function (req, res) {
    console.log("profile_GET USER", req.user);
    var fbID = req.user.fbID;
    //find all events for which the user fbID is in the invited array of objects
    //also group them by the rsvp status on the profile page
    Event.find({ 'invited.fbID': fbID }).exec(function(err, eventData) {
      console.log("eventData\n--------------------------\n", eventData);
      if (err) {
        console.error(err);
      } else {
          res.render('users/user', { name : req.user.name, eventData : eventData });
      }
    });
  }

}