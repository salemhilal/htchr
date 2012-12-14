//Geolocation shim, a la 15-237 lecture.
var nop = function(){};
if (!navigator.geolocation) {
  navigator.geolocation = {};
}
if (!navigator.geolocation.getCurrentPosition) {
  navigator.geolocation.getCurrentPosition = nop;
}

//Google autocomplete object. Give it a global scope.
var autocomplete = {};
//The result of the places query. 
var place = {};


//Load newEventPage's scripts when the page is loaded.
function newEventPageInit () {
  console.log('Loaded up newEventPageInit().');
    //get access_token and current User's friends
    $.getJSON('/users/current.json', function(profile) {
        var access_token = profile.access_token;
        $.getJSON('https://graph.facebook.com/me/friends?access_token=' + access_token,
            function(friends) {
                var friendTags = [];
                var friendTemplate = "<option value=<%= friend_id %>><%= friend_name %> </option>";
                _.each(friends.data, function(hFriend) {
                    var templated = _.template(friendTemplate, {
                        friend_id : hFriend.id,
                        friend_name : hFriend.name
                    });

                    friendTags.push({
                        "id" : hFriend.id,
                        "name" : hFriend.name
                    });

                    $("#friendList").append(templated);
                });
            //remove all previous instances of tokenInput forms
            $(".token-input-list-facebook").remove();
            //update the friend invite list once it is populated
            $("#friendList").trigger("change");
            
            $("#friendInput").tokenInput(friendTags, {
                    theme: "facebook",
                    resultsLimit: '6',
                    preventDuplicates: true,
                    hintText: "Start typing a friend's name",
                    noResultsText: "No friends found!"
                });
    });
  });

  //Initialize autocomplete
  autocomplete = new google.maps.places.Autocomplete(document.getElementById("eventLoc"),{
    componentRestrictions: {country: 'us'}
  });

  //Initialize the error/success popups.
  $("#errorPopup").popup({
    overlayTheme: "a",
    transition: "pop"
  });       
  $("#successPopup").popup({
    overlayTheme: "a",
    transition: "pop"
  });

  //Populate some dummy data.
  var t = new Date(); 
  t.setHours(t.getHours() + 1); 
  t.setMinutes(0); 
  $("#eventTime").val(t.toTimeString().substr(0,5));

  //Request current data to bias the autocomplete's search queries.
  navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var bnd = 0.3;

    //Set the bounds to be the current location +- bnd.
    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(lat-bnd, lng-bnd),
      new google.maps.LatLng(lat+bnd, lng+bnd));

      //Pass them bounds to the autocomplete so our search is biased.
    autocomplete.setBounds(bounds);
  });

    //Watch for resolved autocomplete locations
  google.maps.event.addListener(autocomplete, 'place_changed', function(){
    place = autocomplete.getPlace();
    console.log("The user just picked a place:\n", place);
  });

    //Wipe the location field if an invalid location appears.
  $("#event.loc").off("blur");
  $("#eventLoc").on("blur", function(){
    if(place.geometry === undefined){
      // For some reason, JQM won't wipe the text field
      // inside this function call. So, we push our wipe
      // request to the top of the stack and cross our fingers.
      // Oh JQM, how we love thee. Let us count the ways. 
      // One. 
      setTimeout(function () {$("#eventLoc").val("")}, 0);
    }
  });

  //Bind a verifier to the submit button.
  $("#submitEvent").off("tap");
  $("#submitEvent").on("tap", function(){
    var problems = []

    //Verify everything's alright. 
    var name = $("#eventName").val();
    var date = $("#eventDate").val();
    var time = $("#eventTime").val();
    var isPrivate = $("#eventPrivate").val();

    if(name.length < 3){
      problems.push("<li>enter a <i>real</i> name (3+ letters).</li>");
      $("#eventName").addClass("error");
    }

    if(!place.geometry){
      problems.push("<li>enter a <i>valid</i> location.</li>");
      $("#eventLoc").addClass("error");
    }

    if(date === ""){
      problems.push("<li>enter a valid date, please.</li>");
    }

    if(time === ""){
      problems.push("<li>enter a valid time, if you could.</li>");
    }

    if(problems.length >0){
      $("#problems").html(problems.join(""));
      $("#errorPopup").popup("open");
      return;
    } else {

      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      var dateTime = new Date(date + " " + time + ":00");

      var placeData = {
        name : place.name,
        address : place.formatted_address,
        phoneNumber : place.formatted_phone_number,
        lat : lat,
        lng : lng,
        googleData: JSON.stringify(place)
      };

      var friendsToInvite = $("#friendInput").tokenInput("get"); //each item is an object of form {id: x, name:y}

      var eventData = {
        name: name,
        description: "",
        startTime: dateTime,
        isPrivate: isPrivate === "on",
        toInvite: friendsToInvite
      };

      var reqData = {
        placeData : placeData,
        eventData : eventData
      };

      // TODO: MAKE THE REQUEST URL DYNAMIC OR SHIT WILL HIT THE FAN IN DEPLOYMENT
      // will take care of this - Matt
      $.post('http://localhost:3000/events/new', reqData, function (data) {
        $("#successPopup").off("popupafterclose")
        $("#successPopup").on("popupafterclose", function(){
          window.location.href = "/events/feed";
        });
        $("#successPopup").popup("open");
      });
    }
  });
}

function feedPageInit () {
  console.log('Loaded up feedPageInit().');

  // Creat an li template.
  var liTemplate = 
    '<li>' + 
      '<a href="<%= event_url %>">' +
        '<h3><%= user_name %> ' +
          '<small>created the event</small> '+ 
          '<%= event_name %>' +
        '</h3>' +
      '</a>' +
    '</li>';
    
    //Grab the feeds server-side and render them.
  $.getJSON('/events/feed.json', function (data) {
    $("#feedList").html("");
    console.log("I just wiped the feed.");
    console.log("Here's the feed data:\n", data);
    _.each(data.data, function (hEvent) {
      var eventLi = _.template(liTemplate, {
        user_name: hEvent.ownerName,
        event_name: hEvent.name,
        event_url: "/events/" + hEvent._id
      });

      $("#feedList").append(eventLi).listview('refresh');
      console.log("Just put updated the feed.");
            
    });
  });
}

function userPageInit () {
  console.log("loading userPageInit()");

  var eventTemplate =
    '<li>' +
      '<a class="eventItem" href="<%= event_url %>">' +
        '<h4> <%= event_name %>' +
        '</h4>' +
      '</a>' +
    '</li>';

  $.getJSON('/users/current.json', function (data) {
      var user = data.user;
      var eventData = data.eventData;
      _.each(eventData, function (hEvent) {
        var eventLi = _.template(eventTemplate, {
          event_name: hEvent.name,
          event_url: "/events/" + hEvent._id
        });

        if (hEvent.ownerFbID === user.fbID) {
          $("#ownedEvents").append(eventLi).listview('refresh');
        }
        else {
          var myInvite = _.find(hEvent.invited, function(invite){
            return (invite.fbID === user.fbID);
          });
          
          var status = myInvite.rsvpStatus;

          //Add the event to the appropriate listview
          if (status === "attending"){
            $("#attendEvents").append(eventLi).listview('refresh');
          }
          else if (status === "maybe"){
            $("#maybeEvents").append(eventLi).listview('refresh');
          }
          else if (status === "noreply"){
            $('#unrepliedEvents').append(eventLi).listview('refresh');
          }
          else if (status === "declined"){
            $('#declinedEvents').append(eventLi).listview('refresh');
          }
          else {
            console.log("Status is not defined correctly - check it", status);
          }
        }

      });
  });


}

function viewPageInit () {
  console.log('Loaded up viewPageInit().');

  var eventTemplate =
    '<h1>Title: <%= event.name %> </h1>' +
    '<h2>Created by: <%= event.ownerName %> </h2>' +
    '<h2>Begins on <%= startTime %> </h2>';
    
  var eventId = window.location.pathname.split('/').pop();
  $.getJSON('/events/' + eventId + '.json', function (eventRes) {
    var templated = _.template(eventTemplate, {
      event: eventRes,
      startTime: new Date(eventRes.startTime)
    });
       
    $("#viewContent").append(templated);

    $("#eventViewBack")
      .click(function() {
            history.back();
            return false;
      });
  });
}

function searchPageInit () {
  $("#searchbox").focus();

  $("#search").off("tap");
  $("#search").on("tap", function(){
    var body = { query: $("#searchbox").val() };
    $.post("/search", body, function(response) {
      data = JSON.parse(response);
      console.log("Response from POST to /search:\n", data);
      //Clear search results
      $("#searchResults").html("");

      var templated = "";

      if(data.error === "empty query string"){
        $("#searchResults").append(
          "<li style='text-align: center; display:none' class='errorList'>"
            +"<h4>You need to search for something.</h4>"
          +"</li>");
        $("#searchResults").listview("refresh");
        $(".errorList").fadeIn();
        return;
      }

      if(data.close.length + data.far.length === 0){
        $("#searchResults").append(
          "<li style='text-align: center; display:none' class='errorList'>"
            +"<h4>Your search returned no events. Try something easier. I'm only a phone.</h4>"
          +"</li>");
        $("#searchResults").listview("refresh");
        $(".errorList").fadeIn();
        return;        
      }

      var resultTemplate = '<li><a href="<%= url %>"><%= name %></a></li>'

      var exact = _.each(data.exact, function(d){
        var templated = _.template(resultTemplate, {
          url : "/events/" + d._id,
          name : d.name 
        });
        $("#searchResults").append(templated);
        $("#searchResults").listview("refresh");
      });            
      var close = _.each(data.close, function(d){
        var templated = _.template(resultTemplate, {
          url : "/events/" + d._id,
          name : d.name 
        });
        $("#searchResults").append(templated);
        $("#searchResults").listview("refresh");
      });            
      var far   = _.each(data.far, function(d){
        var templated = _.template(resultTemplate, {
          url : "/events/" + d._id,
          name : d.name 
        });
        $("#searchResults").append(templated);
        $("#searchResults").listview("refresh");
      });


    });
  });
}

$(document).bind("pagechange", function (e) {
  var path = window.location.pathname;
  if (path.indexOf('/events/feed') > -1) {
    feedPageInit();
  }
  else if (path.indexOf('/events/new') > -1) {
    newEventPageInit();
  }
  else if (path.indexOf('/search') > -1) {
    searchPageInit();
  }
  else if (path.indexOf('/users/self') > -1) {
    userPageInit();
  }
  else if (path.length === 32) {
    viewPageInit();
  }
});