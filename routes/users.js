var models = require('../db/models.js')
  , User = models.User
  , Event = models.Event;

module.exports = {
  profile_JSON: function (req, res) {
    var id = req.params.id;
    var fbID = req.user.fbID;

    //find all events user is attending/hosting
    Event.find({$or : [{'invited.fbID': fbID}, {'ownerFbID': fbID}]}).sort('-createdAt')
         .limit(10)
         .exec(function(err, eventData) {
          if (err) {
            console.error(err);
          }
          else {
            if (id === 'current') {
              res.end(JSON.stringify({
                user: req.user,
                eventData: eventData
              }));
            }

            else {
              User.findById(id, function (err, user) {
                if (err) { res.end('error'); }
                else {
                  res.end(JSON.stringify({
                    user: user,
                    eventData: eventData
                  }));
                }
              });
            } //lookup user branch
          } //event find branch
    });


  },


  profile_GET: function (req, res) {
    res.render('users/user', { name : req.user.name });
  }

}