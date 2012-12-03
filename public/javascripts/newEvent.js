
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

$(document).bind("pageinit", function(){

    //Initialize autocomplete
    autocomplete = new google.maps.places.Autocomplete(document.getElementById("eventLoc"),{
        componentRestrictions: {country: 'us'}
    });
    console.log("Autocomplete initialized.");

    //Initialize the invalid data popup.
    $("#errorPopup").popup({
        overlayTheme: "a",
        transition: "pop"
    });

    //Request current data to bias the autocomplete's search queries.
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var bnd = 0.3;

        console.log("lat", lat);
        console.log("lng", lng);

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

});





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
        var reqData = { name: name, description: "", startTime: dateTime, isPrivate: isPrivate === "on" };

        // TODO: MAKE THE REQUEST URL DYNAMIC OR SHIT WILL HIT THE FAN IN DEPLOYMENT
        // will take care of this - Matt
        $.post('http://localhost:3000/events/new', reqData, function (data) {
            console.log(data);
        });
    }




});