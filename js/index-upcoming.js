// Renders the "Upcoming" preview card on index.html from the shared
// sheet data source (js/meetings-data.js). Shows the first three rows
// from the sheet; if the fetch fails, the placeholder list already in
// the page is left in place.
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("upcoming-list");
  if (!list) return;
//Calls the exact same fetchMeetings() function from meetings-data.js that is used in meetings.js to get the data from the Google Sheet.
  window.MacteMeetings.fetchMeetings()
  //ensure their is data to display, if not, it will leave the placeholder list in place.
    .then((rows) => {
      if (rows.length === 0) return;
      //once we know the data is real. 
      // Clear the placeholder list and populate it with the first three rows of data from the sheet.
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
