var User = require('../db/models.js').User;

module.exports = {
  profile_JSON: function (req, res) {
    var id = req.params.id;
    User.findById(id, function (err, user) {
      res.end(JSON.stringify(user));
    });
  },
  profile_GET: function (req, res) {
    res.render('users/user')
  }
}