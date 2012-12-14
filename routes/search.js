var models = require('../db/models.js')
  , User = models.User
  , Event = models.Event
  , Place = models.Place;

module.exports = {
  view: function(req, res) {
    res.render('search');
  },

  geo_JSON: function (req, res){
    console.log(req.body);
    var lng = req.body.lng;
    var lat = req.body.lat;
    if(parseFloat(lat).toString() === "NaN" || parseFloat(lng).toString() === "NaN"){
      res.end(JSON.stringify({error: "Invalid coordinates."}));
    } else {
      var result = {};
      var range = 2; //km
      var earthRadius = 6378; //km

      Place.find({ location : { $near : [lng, lat]} }).limit(3).exec(function(err, nearby){
        if(err){
          console.error("Error occurred when searching for nearby places", err);
          res.end(JSON.stringify({error: err}));
        } else{
          var places = {};
          for(i in nearby){
            places[nearby[i]._id] = nearby[i];
          }
          result.places = places;

          var friends = [];
          var i=0;
          for(frnd in req.user.friends){
            friends[i] = req.user.friends[frnd].id + "";
            i++;
          }
          friends[i] = req.user.fbID;

          Event.find().where("placeID").in(nearby.map(function(i){return i._id})).where('ownerFbID').in(friends).limit(5).exec(function(err2, nearbyEvents){
            if(err){
              console.error("Error occurred when searching for nearby events", err);
              res.end(JSON.stringify({error: err2}));
            } else{
              result.events = nearbyEvents;
              res.end(JSON.stringify(result));
            }

          });
        }

      });

    }
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