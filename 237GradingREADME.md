#htchr
=======================
###Group Members:
Dima Ivanyuk (divanyuk)   
Matt Schallert (mschalle)    
Salem Hilal (shilal)   

=======================
###Required Features:
1. Javascript (? - they want inheritance/something, so we need to put something interesting)
2. DOM Manipulation - Populating news feed, viewing events, autocomplete (htchr.js Lines 170-260)
3. jQuery
4. jQuery Mobile - All front end minus landing page
5. AJAX : Consume API - Google Maps/Places, Facebook, Twilio (todo?)
6. AJAX : Provide API
7. node.js
8. Server-side DB (MongoDB/mongoose.js)
9. EJS templates
10. PhoneGap

======================
###General Description of Features
1. Event Feed - Provide a chronological overview of events as they are created/happening
2. View Event - Separate page for each event; has image associated with the place (Twilio) and event information
3. Create/Search - Attempt to find a similar event within the user's friendbase with the alternative to create an event
4. Facebook-Integrated - Login solely with Facebook; create corresponding events on Facebook
5. Autocomplete -
    (a) Autocompletes places using Google Places API when creating events
    (b) Autocomplete friends names when inviting users to events
6. Drivers - Keeps track of whether or not driver(s) needed and if there is one