#htchr
----------------------
###Group Members:
Dima Ivanyuk (divanyuk)    
Matt Schallert (mschalle)    
Salem Hilal (shilal)

**Note:** Iterative designs / user studies can be found in the `/docs` folder

----------------------

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
4. jQuery Mobile
    * Front end minus landing page
5. AJAX : Consume API
    * Google Maps/Places for geolocation
    * Facebook - hook into user profile, find friends, etc.
    * Twilio - send notifications about events
6. AJAX : Provide API
    * app.js has RESTful routes hidden behind facebook auth.
7. node.js
    * Used express throughout, taking advantage of things like express sessions, static directory mappings, and server-side view rendering
8. Server-side DB
    * MongoDB
    * Mongoose
    * db/*; querying in myUtil.js, routes/*
9. EJS templates
    * See views/*
    * ~ lines 30, 190, 230, 250
    * Also some client-side underscore templating going on
10. PhoneGap

---------------------

###General Description of Features
1. Event Feed
    * Provide a chronological overview of events as they are created/happening
    * Updated on the fly
2. View Event
    * Separate page exists for each event
    * Default image for the event is set to the Google Places image associated with the event's location
3. Facebook-Integrated
    * Login with Facebook (Passport)
    * Creates corresponding events on Facebook for each event made in htchr
    * Events viewable by default only to Facebook Friends 
4. Event Search
    * Attempt to find a similar event within the user's friendbase
    * Attempts to find nearby events if an exact match isn't found.
    * Uses event name by default, but optionally include time/date range(s)
4. Create Event
    * Alternatively, create an event if one cannot be found
    * Control privacy of your event and who to initially invite
5. Autocomplete  
    * Autocompletes places using Google Places API, biased by proximity of place to user's physical location   
    * Autocomplete friends names when inviting users to events   
6. Notifications
    * Allow users to give us their phone numbers and be notified of event invites and upcoming events
7. Event Recommendation   
    * Recommendation system attempts to pair up users and events
    * Events are recommended to users in the event feed
    * Upon event creation, htchr suggests friends to invite