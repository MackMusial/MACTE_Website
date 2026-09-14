// Renders the Deans of Education directory table on
// executive-board.html from the shared sheet data source
// (js/deans-data.js).
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("deans-table-body");
  const notice = document.getElementById("deans-notice");
  if (!tbody) return;

  window.MacteDeans.fetchDeans()
    .then((rows) => {
      if (rows.length === 0) {
        if (notice) notice.textContent = "No directory entries are posted right now.";
        return;
      }

      tbody.innerHTML = "";
      rows.forEach(([institution, dean, email, phone]) => {
        const tr = document.createElement("tr");
        [institution, dean, email, phone].forEach((value) => {
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
        notice.textContent = "Directory couldn't be loaded right now. Please check back later.";
      }
    });
});
