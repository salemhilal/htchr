#htchr
=======================
###Group Members:
Dima Ivanyuk (divanyuk)   
Matt Schallert (mschalle)    
Salem Hilal (shilal)   


###Required Features
1. Javascript 
    * public/javascripts/htchr.js for the frontend
    * app.js, routes/*, db/models.js for serverside
2. DOM Manipulation
    * Populating news feed
    * Viewing events
    * Autocomplete
    * htchr.js Lines 170-260
3. jQuery
    * 
4. jQuery Mobile
    * Front end minus landing page
5. AJAX : Consume API
    * Google Maps/Places
    * Facebook
    * Twilio (todo)
6. AJAX : Provide API
    * app.js has RESTful routes hidden behind facebook auth.
7. node.js
8. Server-side DB
    * MongoDB
    * Mongoose
9. EJS templates
10. PhoneGap


###General Description of Features
1. Event Feed
    * Provide a chronological overview of events as they are created/happening
2. View Event
    * Separate page exists for each event
    * Default image for the event is set to the Google Places image associated with the event's location 
3. Facebook-Integrated
    * Login with Facebook (Passport)
    * Creates corresponding events on Facebook for each event made in htchr
4. Event Search
    * Attempt to find a similar event within the user's friendbase
    * Uses name by default, but optionally include time/date range(s)
4. Create Event
    * Alternatively, create an event if one cannot be found
    * Control privacy of your event and who to initially invite
5. Autocomplete  
    * Autocompletes places using Google Places API when creating events   
    * Autocomplete friends names when inviting users to events   
6. Notifications
    * Allow the owner of an event to send push notifications to attending friends who also have htchr installed
    * Notify attendees as the event's start time approaches
7. Event Recommendation   
    * Recommend events to users based on...
        - User event history
        - Friends event history
        - Other things??