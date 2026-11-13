// Shared meetings data source — fetches and parses the Google Sheet CSV
// used by both meetings.html (full table) and index.html (upcoming preview).
// To update the source sheet: File > Share > Publish to web on the sheet,
// choose the meetings tab, format "Comma-separated values (.csv)", then
// paste the resulting link below. Columns must be Date, Time, Location,
// Focus (in that order) with a header row.

//change the URL below to a published CSV link from google sheets for a different sheet
const MEETINGS_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIcN1zj1Ip6TkEdrn9QF2b9C2Tau7_x23nNrNMOHGJz36bkffB7WQxcy2Oh3CfWLiN7yuTL0zf2NlT/pub?gid=0&single=true&output=csv";

function fetchMeetings() {
  return fetch(MEETINGS_SHEET_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Sheet request failed");
      return response.text();
    })
    .then((text) => parseCSV(text).slice(1)) // drop header row
    .then((rows) => rows.filter(isNotPast));
}

// Both pages list upcoming meetings, so rows dated before today are dropped
// automatically. A date the browser can't read (e.g. "TBD") is kept.
function isNotPast([date]) {
  const text = (date || "").trim();
  // A bare "2026-11-13" is read by browsers as midnight UTC, which is the
  // evening before in Michigan and would hide a meeting on the day it happens.
  // Build that form as a local date instead.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const parsed = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(text);
  if (isNaN(parsed)) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today;
}

window.MacteMeetings = { fetchMeetings };
