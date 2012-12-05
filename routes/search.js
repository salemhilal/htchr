module.exports = {
  view: function(req, res) {
    res.render('search');
  },

  results_JSON: function (req, res) {
    res.render('login', { user: req.user });
  }
}