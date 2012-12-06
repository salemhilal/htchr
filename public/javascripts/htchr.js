// TODO: make this less FUCKING SHAMELESSLY HACKY
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
    console.log('new page init');

    //get accessToken and current User's friends
    $.getJSON('/users/current.json', function(profile) {
        var accessToken = profile.accessToken;
        $.getJSON('https://graph.facebook.com/me/friends?access_token=' + accessToken,
            function(friends) {
                var template = "<option value=<%= friend_id %>><%= friend_name %> </option>";
                _.each(friends.data, function(hFriend) {
                    var templated = _.template(friendTemplate, {
                        friend_id : hFriend.id,
                        friend_name : hFriend.name
                    });
                          
                    $("#friendList").append(templated);
                });
            $("#friendList").trigger("change");

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
    });

    //Wipe the location field if an invalid location appears.
    $("#eventLoc").live("blur", function(){
        console.log("blur");
        if(place.geometry === undefined){
            console.log("blur2");
            //For some reason, JQM won't wipe the text field
            //inside this function call. So, we push our wipe
            //request to the top of the stack and cross our fingers.
            setTimeout(function () {$("#eventLoc").val("")}, 0);
        }
    });

    //Bind a verifier to the submit button.
    $("#submitEvent").live("tap", function(){
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
            var lat = place.geometry.location["$a"];
            var lng = place.geometry.location["ab"];
            // TODO: incorporate this into the post data
            // will be done after some location stuff is set up on
            // the server side
            // - Matt

            var dateTime = new Date(date + " " + time + ":00");

            var placeData = {
                name : place.name,
                address : place.formatted_address,
                phoneNumber : place.formatted_phone_number,
                lat : lat,
                lng : lng,
                googleData: JSON.stringify(place)
            };

            var eventData = {
                name: name,
                description: "",
                startTime: dateTime,
                isPrivate: isPrivate === "on" 
            };

            var reqData = { 
                placeData : placeData,
                eventData : eventData
            };

            // TODO: MAKE THE REQUEST URL DYNAMIC OR SHIT WILL HIT THE FAN IN DEPLOYMENT
            // will take care of this - Matt
            $.post('http://localhost:3000/events/new', reqData, function (data) {
                $("#successPopup").bind("popupafterclose", function(){
                    window.location.href = "/events/feed";
                });
                $("#successPopup").popup("open");
            });
        }
    });
}

function feedPageInit () {
    console.log('feed init');

    //Creat an li template.
    var liTemplate = 
        '<li>' + 
            '<a href="<%= event_url %>">' +
                '<h3><%= user_name %> ' +
                    '<small>created the event</small> '+ 
                    '<%= event_name %>' +
                '</h3>' +
            '</a>' +
        '</li>'
    
    //Grab the feeds server-side and render them.
    $.getJSON('/events/feed.json', function (data) {
        $("#feedList").html("");
        console.log("wiped");
        // console.log(data);
        console.log(data);
        _.each(data.data, function (hEvent) {

            var eventLi = _.template(liTemplate, {
                user_name: hEvent.ownerName,
                event_name: hEvent.name,
                event_url: "/events/" + hEvent._id
            });

            $("#feedList").append(eventLi).listview('refresh'); 
            console.log("appended");
            
        });
    });
}

function viewPageInit () {
    console.log('view init');

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

    $("#search").live("tap", function(){
        var body = { query: $("#searchbox").val() };
        $.post("/search", body, function(response) {
            data = JSON.parse(response);
            console.log(data);
            $("#searchResults").html("");
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
    else if (path.length === 32) {
        viewPageInit();
    }

});