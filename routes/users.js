var User = require('../db/models.js').User;

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
    res.render('users/user', { name : req.user.name });
  }
}