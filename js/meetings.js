// Renders the full meeting table on meetings.html from the shared sheet
// data source (js/meetings-data.js).
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("meetings-table-body");
  const notice = document.getElementById("meetings-notice");
  if (!tbody) return;
//get meeting informating from meetins-data.js,
//which is the same data source used in index-upcoming.js to get the data from the Google Sheet.
  window.MacteMeetings.fetchMeetings()
    .then((rows) => {
      if (rows.length === 0) {
        if (notice) notice.textContent = "No upcoming meetings are scheduled right now.";
        return;
      }
      //building the table
      // Clear the placeholder table body and populate it with all rows of data from the sheet.
      tbody.innerHTML = "";
      rows.forEach(([date, time, location, focus]) => {
        const tr = document.createElement("tr");
        [date, time, location, focus].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = (value || "").trim();
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      if (notice) notice.style.display = "none";
    })
    .catch(() => {
      if (notice) {
        notice.textContent = "Meeting dates couldn't be loaded right now. Please check back later.";
      }
    });
});
