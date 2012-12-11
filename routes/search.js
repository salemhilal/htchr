var models = require('../db/models.js')
  , User = models.User
  , Event = models.Event
  , Place = models.Place;

module.exports = {
  view: function(req, res) {
    res.render('search');
  },

  query_JSON: function (req, res) {
    var query = req.body.query;
    // Check if empty query. We don't want those.
    if(!query || !query.replace(/ /g, "")){
      res.end(JSON.stringify({ error: "empty query string" }));
    } else {
      var result  = {};
      var close   = new RegExp("\\b" + query, "gi");
      var far     = new RegExp(query, "gi");

      var friends = [];
      var i=0;
      for(frnd in req.user.friends){
        friends[i] = req.user.friends[frnd].id + "";
        i++;
      }
      friends[i] = req.user.fbID;

      // Nested queries for close and far matches.
      // Better matches are placed higher up in the search list.
      Event.find({name: close}).where('ownerFbID').in(friends).exec(function(err2, close){
        result.close = close;

        Event.find({name: far}).nin(close).where('ownerFbID').in(friends).exec(function(err3, far){
          result.far = (err3 ? [] : far);
          res.end(JSON.stringify(result));
        });
      });
    }
  }
}