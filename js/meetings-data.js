// Shared meetings data source — fetches upcoming events from a public
// Google Calendar and maps them into [date, time, location, focus] rows,
// used by both meetings.html (full table) and index.html (upcoming
// preview). Because the Calendar API is asked for events from "now"
// forward, past events fall out of the response automatically — no
// manual row cleanup needed like the old spreadsheet approach.
//
// Setup:
// 1. In Google Calendar, create (or pick) the calendar to use for MACTE
//    meetings. Under that calendar's Settings > "Access permissions",
//    check "Make available to public" (this shares event times/titles;
//    leave "See only free/busy" off if you want the details visible).
// 2. On that same settings page, copy the "Calendar ID" (looks like an
//    email address, e.g. abc123@group.calendar.google.com) into
//    CALENDAR_ID below.
// 3. In Google Cloud Console, create/select a project, enable the
//    "Google Calendar API", then create an API key under Credentials.
//    Restrict the key (Application restrictions > Websites) to this
//    site's domain so it can't be reused elsewhere.
// 4. Paste that key into CALENDAR_API_KEY below.

// ****************************************************************
// **  TODO BEFORE GOING LIVE: this API key is currently UNRESTRICTED.  **
// **  Go to Cloud Console > APIs & Services > Credentials > this key,  **
// **  under "Website restrictions" click Add and enter the real site  **
// **  domain (e.g. mackmusial.github.io/* or macte.us/*), then Save.  **
// **  Until that's done, anyone who copies this key from the page     **
// **  source can use it from anywhere, burning your API quota.        **
// ****************************************************************
const CALENDAR_ID = "mackmusial@gmail.com";
const CALENDAR_API_KEY = "AIzaSyDIvO7UjO3tzn2u36vA-lzbAENG9vEpg_4";
const CALENDAR_MAX_EVENTS = 25;

function formatEventDateTime(event) {
  if (event.start.date) {
    // All-day event — parse as local time so the date doesn't shift a
    // day back/forward depending on the visitor's timezone offset.
    const start = new Date(event.start.date + "T00:00:00");
    return {
      date: start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      time: "All day",
    };
  }

  const start = new Date(event.start.dateTime);
  return {
    date: start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    time: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function eventToRow(event) {
  const { date, time } = formatEventDateTime(event);
  return [date, time, event.location || "", event.summary || ""];
}

function fetchMeetings() {
  const timeMin = encodeURIComponent(new Date().toISOString());
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
    `?key=${CALENDAR_API_KEY}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=${CALENDAR_MAX_EVENTS}`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Calendar request failed");
      return response.json();
    })
    .then((data) => (data.items || []).map(eventToRow));
}

window.MacteMeetings = { fetchMeetings };
