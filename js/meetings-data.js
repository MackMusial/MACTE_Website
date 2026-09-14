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
    .then((text) => parseCSV(text).slice(1)); // drop header row
}

window.MacteMeetings = { fetchMeetings };
