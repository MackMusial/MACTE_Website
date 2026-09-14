// Renders the "Upcoming" preview card on index.html from the shared
// calendar data source (js/meetings-data.js). Shows the first three
// upcoming events; if the fetch fails, the placeholder list already in
// the page is left in place.
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("upcoming-list");
  if (!list) return;

  window.MacteMeetings.fetchMeetings()
    .then((rows) => {
      if (rows.length === 0) return;

      list.innerHTML = "";
      rows.slice(0, 3).forEach(([date, time, location, focus]) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = (focus || "").trim();
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" — " + (date || "").trim() + ", " + (location || "").trim()));
        list.appendChild(li);
      });
    })
    .catch(() => {
      // Leave the existing placeholder list in place.
    });
});
