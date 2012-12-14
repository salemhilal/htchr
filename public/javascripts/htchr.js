// TODO: make this LESS SHAMELESSLY HACKY
var globalUser = {};
$.getJSON('/users/current.json', function (userRes) {
    globalUser = userRes;
});

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

  // Elegantly causes elem to come into view.
  function fadeslide(elem) {
    // Only animate if the element is hidden.
    if($(elem).css("display") !== "none"){
      return;
    }
    $(elem).css('opacity', 0)
      .slideDown('slow')
      .animate(
        { opacity: 1 },
        { queue: false, duration: 'slow' }
      );
  }

  //Initialize autocomplete
  autocomplete = new google.maps.places.Autocomplete(document.getElementById("eventLoc"),{
    componentRestrictions: {country: 'us'}
  });

  //Begin the event creation process.
  fadeslide(".field1");
  $(".field1 > input").focus();

  //Event name
  $(".field1").off("keyup");
  $(".field1").on("keyup", function(){
    if( $(".field1 > input").val().length >= 5){
      fadeslide(".field2");
      $(this).off("keyup");
    }
  });

  //Places
  $(".field2 > input").off("setplace");
  $(".field2 > input").on("setplace", function(){
    if(place.geometry){
      fadeslide(".field3");
      $(".field3 > input").focus();
      $.post("/search/geo", {lng: place.geometry.location.lng(), lat: place.geometry.location.lat()}, function(d){
          var data = JSON.parse(d);
          console.log("Geo query", data);

        if(!data.events || data.events.length === 0){ 
          console.log(data);
          return;
        } else {
          var liTemplate = 
            '<li>' + 
              '<a href="<%= event_url %>">' +
                '<h3><%= user_name %> ' +
                  '<small>is going to</small> '+ 
                  '<%= event_location %>' +
                '</h3>' +
                '<h5>for the event <%= event_name %> on <%= event_date %>.</h5>' + 
                '<h5>at <%= event_addr %>.</h5>' + 
              '</a>' +
            '</li>';

          _.each(data.events, function(hEvent){
            var date = new Date(hEvent.startTime).toString().split(" ").slice(0,3).join(" ");

            var eventLi = _.template(liTemplate, {
              user_name: hEvent.ownerName,
              event_name: hEvent.name,
              event_location: data.places[hEvent.placeID].name,
              event_addr: data.places[hEvent.placeID].address,
              event_date: date,
              event_url: "/events/" + hEvent._id
            });
            $("#tryThese").append(eventLi);
          });
          $("#tryThese").listview("refresh");
          $("#suggestPopup").popup("open");
        }

      });
    }
  });


  //Date
  $(".field3 > input").off("focus");
  $(".field3 > input").on("focus", function(){
    fadeslide(".field4"); // Time
    fadeslide(".field5"); // Friends
    fadeslide(".field6"); // Private
    $(this).off("focus");
  });

  //Time
  $(".field4 > input").off("focus");
  $(".field4 > input").on("focus", function(){
    fadeslide(".field7"); // Button
    $(this).off("focus");
  });


  //Initialize the error/success/suggest popups.
  $("#errorPopup").popup({
    overlayTheme: "a",
    transition: "pop"
  });       
  $("#successPopup").popup({
    overlayTheme: "a",
    transition: "pop"
  });
  $("#suggestPopup").popup({
    overlayTheme: "a",
    transition: "pop"
  });

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
    $(".field2 > input").trigger("setplace");
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

    if(name.length < 5){
      problems.push("<li>enter a <i>real</i> name (3+ letters).</li>");
      $("#eventName").addClass("error");
    }

    if(!place.geometry){
      problems.push("<li>enter a <i>valid</i> location.</li>");
      $("#eventLoc").addClass("error");
    }

    if(date === ""){
      problems.push("<li>enter a valid date.</li>");
    }

    if(time === ""){
      problems.push("<li>enter a valid time, if you could.</li>");
    }

    if(problems.length >0){
      $("#problems").html(problems.join(""));
      $("#errorPopup").popup("open");
      return;
    } else {
        $("#submitEvent").off("tap");
        $.blockUI.defaults.css = {};
        $.blockUI({ 
          overlayCSS: {
            backgroundColor: '#F9F9F9', 
            opacity: .5
          },
          message: null
        });

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
        $.unblockUI();
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

  // Create an li template.
  var liTemplate = 
    '<li>' + 
      '<a href="<%= event_url %>">' +
        '<h3><%= user_name %> ' +
          '<small>created the event</small> '+ 
          '<%= event_name %>' +
        '</h3>' +
      '</a>' +
    '</li>'

  // Create a recommended template
  var recTemplate = 
    '<li>' + 
      '<a href="<%= event_url %>">' +
        '<h3>' +
          '<small>You should check out</small> '+ 
          '<%= event_name %>' +
        '</h3>' +
      '</a>' +
    '</li>'
    
    // Grab the feeds server-side and render them.
  $.getJSON('/events/feed.json', function (data) {
    $("#feedList").html("");
    console.log("I just wiped the feed.");
    console.log("Here's the feed data:\n", data);

    // Add recommendations to the feed (if there are any).
    if(data.recommended.length > 0){
      $("#feedList").append("<li data-role='list-divider'>Recommended!</li>");
       _.each(data.recommended, function (hEvent) {
        var recLi = _.template(recTemplate, {
          event_name: hEvent.name,
          event_url: "/events/" + hEvent._id
        });
        $("#feedList").append(recLi); 
      });
      $("#feedList").listview('refresh');
      console.log("Recommendations have been added.");
    }

    // Add feed items to the feed.
    $("#feedList").append("<li data-role='list-divider'>Recent Activity</li>");
    _.each(data.data, function (hEvent) {
      var eventLi = _.template(liTemplate, {
        user_name: hEvent.ownerName,
        event_name: hEvent.name,
        event_url: "/events/" + hEvent._id
      });
      $("#feedList").append(eventLi); 
    });
    $("#feedList").listview('refresh');
    console.log("The feed is now updated.");
  });
}

function userPageInit () {
  /*doing the template rendering server side now to load faster
      but this init may come in handy later so saving it for now.

      // $('#userInfo').html("");

      var userTemplate = '<h1>Hi, my name is <%= username %> </h1>';

      $.getJSON('/users/current.json', function (user) {
          console.log("user", user);
          var templated = _.template(userTemplate, {
            username : user.name
          });
      
          // $('#userInfo').append(templated);
      }); */
}

function viewPageInit () {
  console.log('Loaded up viewPageInit().');

  var eventTemplate = 
    '<h1>Title: <%= event.name %> </h1>' +
    '<h2>Created by: <%= event.ownerName %> </h2>' +
    '<h2>Begins on <%= startTime %> </h2>'
    
  var eventId = window.location.pathname.split('/').pop();
  $.getJSON('/events/' + eventId + '.json', function (eventRes) {
    var templated = _.template(eventTemplate, {
      event: eventRes,
      startTime: new Date(eventRes.startTime)
    });
       
    $("#viewContent").append(templated);
        
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