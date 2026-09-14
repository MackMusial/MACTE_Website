// Renders the full meeting table on meetings.html from the shared
// calendar data source (js/meetings-data.js).
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("meetings-table-body");
  const notice = document.getElementById("meetings-notice");
  if (!tbody) return;

  window.MacteMeetings.fetchMeetings()
    .then((rows) => {
      if (rows.length === 0) {
        if (notice) notice.textContent = "No upcoming meetings are scheduled right now.";
        return;
      }

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
