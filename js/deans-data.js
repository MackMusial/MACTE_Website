// Deans of Education directory data source — fetches and parses a
// published Google Sheet CSV for the directory table on
// executive-board.html. Use a sheet with a header row: Institution,
// Dean / Director, Email, Phone. Publish it to web (File > Share >
// Publish to web > select the tab > Comma-separated values (.csv)) and
// paste the resulting link below.
const DEANS_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkXQP03XY5rny6vMEKiRTT8wE6PKLKf_eVV-7-xD7Q2q6rd9259tziRvoa0Gdcx2SpGD0mtNtSUCBJ/pub?gid=0&single=true&output=csv";

function fetchDeans() {
  return fetch(DEANS_SHEET_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Sheet request failed");
      return response.text();
    })
    .then((text) => parseCSV(text).slice(1)); // drop header row
}

window.MacteDeans = { fetchDeans };
