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

      // Nested queries for exact, close, and far matches.
      // Better matches are placed higher up in the search list.
      Event.find({name: query}, function(err1, exact){
        result.exact = exact;

        Event.find({name: close}).nin(exact).exec(function(err2, close){
          result.close = close;

          Event.find({name: far}).nin(exact).nin(close).exec(function(err3, far){
            result.far = (err3 ? [] : far);
            res.end(JSON.stringify(result));
          });
        });
      });
      
    }
  }
}