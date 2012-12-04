$.getJSON('/events/feed.json', function (data) {
  _.each(data, function (hEvent) {
    // used `hEvent` instead of `event` because `event` is a javascript reserved keyword
    var eventLi = ich.eventItem({ user_name: "test user", event_name: hEvent.name });
    $("#feedList").append(eventLi).listview('refresh');
  });
});