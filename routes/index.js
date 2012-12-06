module.exports = {
  dummy: function (req, res) {},
  main: require('./main.js'),
  auth: require('./auth.js'),
  events: require('./events.js'),
  users: require('./users.js'),
  search: require('./search.js')
}