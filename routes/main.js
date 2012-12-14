module.exports = {
  home: function(req, res) {
    if(req.user){
      res.redirect('/events/feed');
    } else {
      res.render('landing');
    }
  },

  login: function (req, res) {
    res.render('login', { user: req.user });
  },

  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  }
};