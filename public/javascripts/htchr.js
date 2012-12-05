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
    //Refresh the ich template engine.
    ich.refresh();

    //get accessToken and current User's friends
    $.getJSON('/users/current.json', function(profile) {
        var accessToken = profile.accessToken;
        $.getJSON('https://graph.facebook.com/me/friends?access_token=' + accessToken,
            function(friends) {
                _.each(friends.data, function(hFriend) {
                    var friendLi = ich.friendItem({
                            friend_id : hFriend.id,
                            friend_name : hFriend.name
                    });
                    $("#friendList").append(friendLi);
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
    //Refresh the ich template engine.
    ich.refresh();

    //Grab the feeds server-side and render them.
    $.getJSON('/events/feed.json', function (data) {
        _.each(data, function (hEvent) {
            // used `hEvent` instead of `event` because `event` is a javascript reserved keyword
            if (ich.eventItem){
                var eventLi = ich.eventItem({
                    user_name: hEvent.ownerName,
                    event_name: hEvent.name,
                    event_url: "http://localhost:3000/events/" + hEvent._id
                });
                $("#feedList").append(eventLi).listview('refresh'); 
            }

        });
    });
}

function viewPageInit () {
    console.log('view init');
    ich.refresh();
    // ich.addTemplate('eventView', '<h1>Title: {{ event.name }}</h1>\
    //     <h2>Created by: {{ event.ownerName }}</h2>\
    //     <h2>Begins on {{ startTime }}</h2>');
    var eventId = window.location.pathname.split('/').pop();
    $.getJSON('/events/' + eventId + '.json', function (eventRes) {
        if (ich.eventView) {
            // if eventView isnt a property, the item has already been rendered
            var templated = ich.eventView({
                event: eventRes,
                startTime: new Date(eventRes.startTime)
            });
            $("#viewContent").append(templated);
        }
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
    else if (path.length === 32) {
        viewPageInit();
    }

});