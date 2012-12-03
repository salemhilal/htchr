
//Geolocation shim, a la 15-237 lecture.
var nop = function(){};
if (!navigator.geolocation) {
    navigator.geolocation = {};
}
if (!navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition = nop;
}


var autocomplete //Google autocomplete object. Give it a global scope.

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

        //Set the bounds to be the current location +- bnd.
        var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(lat-bnd, lng-bnd),
            new google.maps.LatLng(lat+bnd, lng+bnd));

        //Pass them bounds to the autocomplete so our search is biased.
        autocomplete.setBounds(bounds);

    });

});





$("#submitEvent").live("tap", function(){
    var problems = []

    //Verify everything's alright. 
    var name = $("#eventName").val();
    var loc = $("#eventLoc").val();
    var date = $("#eventDate").val();
    var time = $("#eventTime").val();
    var isPrivate = $("#eventPriavate").val();

    if(name.length <= 3){
        problems.push("<li>enter a <i>real</i> name (3+ letters).</li>");
        $("#eventName").addClass("error");
    }

    if(loc.length <= 5){
        problems.push("<li>enter a <i>real</i> location (5+ letters).</li>");
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
    }



});