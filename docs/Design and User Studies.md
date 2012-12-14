# Designs
----
Initially our app started off as a *totally* different concept. It was going to be more of a ride-sharing app but for friends (think Über taxi, but for friends, kinda). Before we got to coding our idea had evolved more towards what it is now, but not entirely. We kind of came up with new ideas and modified our overall concept as we made the app.

Why does this matter? Because parts our formal mockups may seem like they have *nothing* to do with our app. That's how much it changed. Anyway, see the `mockups` folder for a few of the mockup stages we went through. A lot of our design iterations were whiteboard / paper general wireframes so we didn't bother formally mocking them up, but we've included the stages we did actually mockup (we used Balsamiq Mockups).

# User Studies
--------

## User Study 12/4/2012
**Issues:**

1. People name places that don't exist in the Places API.
2. We should, if the place doesn't exist, ask them to give us an address for that place.
3. This, or we make two text fields: One for the place name (optional), and one for its address.
4. Then, we make place names an array in our places db.
5. Event back button not firing correctly. It now just redirects to /events/feed.
6. There's not a whole lot of instruction as far as what to do on the event page (I'm adding tooltips).

**Goals for next iteration:**

1. Stop fighting JQuery Mobile and just accept some of the stupid crap it does. It's making some page transitions look weird and data is being duplicated between tab loads.
2. We realized that just because we're familiar with our app and know the best way to use it, most new users will just start poking around. Make sure that it's always clear what they should be doing and what part of the app helps them accomplish that.
3. As noted, tooltips and make instructions as clear / natural for users.

## Updated Feedback 12/9/2012
**What we changed:**

1. Added more validation and feedback to event pages
2. Fixed some weird issues we had been having with JQuery Mobile (the bane of our existence) causing messy AJAX page loads
3. Changed color scheme to darker colors on lighter backgrounds. Changed the font to one from the Google Fonts library. Also, made fonts on headers and section titles remained how they were, but we made fonts in the body / instructions thinner.

**New feedback:**

1. Overall, users thought the UX had improved ("steps to create an event were more clear")
2. Event creation felt more "idiot-proof" (not quite sure what they meant but we'll take it)
3. It was easier to navigate to different parts of the app without feeling like the entire process was starting over again
4. Although users could tell how to create events / invite people to them, they didn't feel joining an event was as intuitive

**Goals for next iteration:**

1. Make joining events just as easy as creating them. We want people using our app to be social, make that easy.
2. Find whoever created JQuery Mobile and simply ask them… "why?"
3. Make sure everything is as smooth friendly across some more different devices, we've only been able to test on iPhone 4s, iPhone 5, and Galaxy S3. They're all high-powered devices with nice screens.
4. "Dumb-down" (nicely format) some of the data we display to users. Ex: format times nicely, they don't need to be too complicated


## Final Feedback 12/13/2012
**What we changed:**

1. Finished our 210 final exam, thank god
2. Tried to make joining events / changing response to events as seamless as possible, don't change the page too drastically
3. Made the app more "vertical" - try to keep actions in the center of the page or spread out across the page. I.e. don't have any buttons or information closely adjacent. It's fine when developing on a desktop browser but quickly becomes cluttered on mobile
4. Added Twilio text notifications for when events are created (we feel this falls under UX so we'll mention it here). For now text messages are sent on event creation, but we plan on working on this app past the course and one of our to-do items is to have a job queue server that every so often will check for upcoming events and sent text messages to users who have joined events that are starting soon, rather than being notified when an event is created even though it may be far off in the future.

**New feedback:**

1. "It's shiny"
2. We had someone who hadn't seen the app before use it and they didn't have trouble with it, as well as showing people who had used the app before and both groups didn't have any major complaint.

**Goals for next iteration:**

1. None… this is the last iteration. However, we do plan on working on the app in the future so we'll likely be continuing iterations along these lines.