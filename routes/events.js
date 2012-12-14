var models = require('../db/models.js')
  , User = models.User
  , Event = models.Event
  , Place = models.Place
  , graph = require('fbgraph')
  , myUtil = require('../myUtil.js')
  , _ = require('underscore');

module.exports = {
  // Render the page to create an event
  new_GET: function (req, res) {
    res.render('events/new');
  },
  // Create new event
  new_POST: function (req, res) {
    // Configure the graph API module
    graph.setAccessToken(req.user.access_token);

    // Two main piece of info we get in the POST data
    var placeBody = req.body.placeData;
    var eventBody = req.body.eventData;

    // Check to see if the place the user entered has been used before
    Place.find({name : placeBody.name}, function(err, places) {

      // a function to make and save an event given a place ID
      var makeEvent = function (placeID, types) {
        // event we're going to store in our database
        var hEvent = new Event({
          name: eventBody.name,
          description: eventBody.description,
          startTime: eventBody.startTime,
          owner: req.user.id,
          ownerFbID: req.user.fbID,
          ownerName: req.user.name,
          isPrivate: eventBody.isPrivate == "true",
          types: types,
          placeID: placeID
        });

        // save event in our database
        hEvent.save(function (err) {
          if (err) {
            console.error(err);
            res.end('false');
          }
          else {
            // event saved, prepare POST data to send to Facebook
            var fbData = {
              name: hEvent.name,
              // start_time needs to meet facebook's spec
              start_time: hEvent.startTime.toISOString(),
              privacy_type: hEvent.isPrivate ? "SECRET" : "OPEN"
            };

            graph.post(req.user.fbID + '/events', fbData, function (err, fbRes) {
              if (err) {
                console.error(err);
                res.end(JSON.stringify({
                  error: "bad fb request"
                }));
              } else {
                // did we get an event ID back from facebook?
                if (fbRes.id) {
                  // update event document in OUR database with FB's reference ID for the event
                  hEvent.eventID = fbRes.id;
                  hEvent.save();

                  //invite friends to the event using the given ID
                  var inviteUsers = function(inviteList) {
                    var inviteString = "";
                    for (var i=0; i < inviteList.length; i++) {
                      var post = "";
                      if (i !== inviteList.length - 1) {
                        post = ",";
                      }
                      else {
                        post = "";
                      }
                      inviteString+= (inviteList[i].id + post)
                    };

                    console.log("inviteString:", inviteString);

                    //send FB request to invite the friends selected by user in event creation
                    graph.post(fbRes.id + '/invited?users=' + inviteString, function (err, result) {
                      if (err) {
                        console.error(err);
                        res.end(JSON.stringify({
                          error: "bad fb request"
                      }));
                    } else {
                      if (!result) {
                        console.log("invites unsuccessful!");
                      }
                      else {
                        console.log("invites succeeded.");
                      }
                    }
                    });
                  };

                  console.log(eventBody.toInvite);
                  _.each(eventBody.toInvite, function (user) {
                    User.findOne({"fbID": user.id}).exec(function (err, twUser) {
                      if (twUser.phoneNumber && twUser.phoneNumber.length >= 10) {
                        var num = twUser.phoneNumber;
                        var message = "Hey there! " + req.user.name + " has invited you to the event: " + eventBody.name + ". Go to http://htchr.me to respond!";
                        myUtil.sendSMS(num, message, function () {});
                      }
                    });
                  });
                  inviteUsers(eventBody.toInvite || []);


                  res.end(JSON.stringify(fbRes));
                }
                else {
                  console.log("No event ID!!!");
                }
              }
            });
          }
        });
      } // end makeEvent function

      if (err) {
        console.error(err);
      }

      // Is there already a place corresponding to our event?
      if (places.length !== 0) {
        makeEvent(places[0]._id, places[0].types);
      }
      else {
        var gData = JSON.parse(placeBody.googleData);
        // No corresponJSON.parse(placeBody.googleData);ding place, make a new one in our DB
        var hPlace = new Place({
          name : placeBody.name,
          address : placeBody.address,
          phoneNumber : placeBody.phoneNumber,
          location : {
            lng : parseFloat(placeBody.lng),
            lat : parseFloat(placeBody.lng)
          },
          numEvents : 0,
          // save all the data google sends us, because why not.
          googleData: placeBody.googleData,
          types: gData.types        
        });

        var placeTags = [];
        //console.log("hPlace:", hPlace);

        // Update the current user's preferences.
        var hash = req.user.prefs.hash || {};
        var topTypes = req.user.prefs.top || [];

        // Given a type, update the topTypes and hash.
         var updateTopTypes = function(type){
           // Type is in hash and in top, no need to update topTypes.
          if(type === topTypes[0] || type === topTypes[1] || type === topTypes[2]){
            hash[type] = hash[type] + 1;
            return;
          }

          //Update the hash.
          if(hash[type] === undefined
              || parseInt(hash[type]).toString() === "NaN"
              || hash[type] < 0){
            hash[type] = 1; // Check for errors in the hash and fix them.
          } else {
            hash[type]++;   // Increment the hash.
          }

          //Update topTypes
          if(hash[type] >= hash[topTypes[0]]      || topTypes.length === 0)
          	topTypes.splice(0,0,type);
          else if(hash[type] >= hash[topTypes[1]] || topTypes.length === 1)
          	topTypes.splice(1,0,type);
          else if(hash[type] >= hash[topTypes[2]] || topTypes.length === 2)
          	topTypes.splice(2,0,type);

          if(topTypes.length > 3) topTypes.length = 3;
        };

        for (var i=0; i<hPlace.types.length; i++) {
          updateTopTypes(hPlace.types[i]);
        }

        req.user.prefs = {hash: hash, top: topTypes};
    		console.log("req.user.prefs for " + req.user.name + " is now:", {hash: hash, top: topTypes});
        req.user.save();

        // Save the new place in our database
        hPlace.save(function (err) {
          if (err) {
            console.error(err);
          } else {
            // finally create the event based on the place id
            makeEvent(hPlace._id, hPlace.types);
          }
        });
      }
    });
  },

  // Get event data
  event_JSON: function (req, res){
    var id = req.params.id;
    Event.findById(id, function(err, event){
      if (err) {
        console.error(err);
        res.end(JSON.stringify({ error: "event lookup failed" }));
      }
      res.end(JSON.stringify(event));
    });
  },
  // Get event details view
  event_GET: function (req, res) {
    res.render('events/view');
  },
  //Get the feed view
  feed_GET: function (req, res) {
    // regular feed request, render a page
    res.render('events/feed', { user: req.user });
  },
  //Get the feed data.
  feed_JSON: function (req, res) {
    // render the feed as a JSON response
    var friends = [];
    var i=0;
    for(frnd in req.user.friends){
      friends[i] = req.user.friends[frnd].id + "";
      i++;
    }
    friends[i] = req.user.fbID;

    Event.find().sort('-createdAt').where('ownerFbID').in(friends).where('isPrivate').equals(false).limit(20).exec(function (err, data) {
      if (err) {
        console.error(err);
        res.end(JSON.stringify({ error: "event lookup failed" }));
      }
      else {
        response = {}
        response.date = new Date();
        response.data = data;

        var top = req.user.prefs.top;
        var curFbID = req.user.fbID;

        // If the user has a complete top 3...
        if(top.length === 3){
          Event.find({
            isPrivate : false,
            ownerFbID : {$ne : curFbID},
            $or: [
              {types : {$all : [top[0], top[1]]}},
              {types : {$all : [top[0], top[2]]}},
              {types : {$all : [top[1], top[2]]}}
            ]
          }).limit(3).exec(function(err, recommended){
            if(err){
              console.error("Error getting recommended: ", err);
            }
            console.log("Recommended: ", recommended);
           
            res.end(JSON.stringify({
              data: data,
              recommended : recommended,
              time: new Date()
            }));

          });
        } 
        // Otherwise, forget recs. 
        else {
          res.end(JSON.stringify({
            data: data,
            recommended : [],
            time: new Date()
          }));
        }


      }
    });
  }
}