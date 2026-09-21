// Renders the officer cards on executive-board.html from a published Google
// Sheet, so officers can update the board without touching HTML. Setup and
// the officer-facing rules are in README.md, "Part 4 — The executive board sheet and headshots".

// Paste the sheet's published CSV link here (must end in output=csv).
const BOARD_SHEET_CSV_URL = "";

// Columns are found by header name, not position, so officers can reorder
// columns or add their own (e.g. "Notes") without breaking the page.
const BOARD_COLUMNS = ["role", "name", "title", "institution", "photo"];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("board-grid");
  const notice = document.getElementById("board-notice");
  if (!grid || !notice) return;

  if (!BOARD_SHEET_CSV_URL) {
    notice.textContent = "The executive board list isn't connected yet.";
    return;
  }

  fetch(BOARD_SHEET_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Sheet request failed");
      return response.text();
    })
    .then((text) => {
      const [header = [], ...rows] = parseCSV(text);
      const members = rows.map((row) => toMember(header, row)).filter((member) => member.name);

      if (members.length === 0) {
        notice.textContent = "No board members are listed right now.";
        return;
      }

      grid.replaceChildren(...members.map(renderCard));
      notice.hidden = true;
    })
    .catch(() => {
      notice.textContent = "The executive board couldn't be loaded right now. Please check back later.";
    });
});

function toMember(header, row) {
  const headings = header.map((cell) => cell.trim().toLowerCase());
  const member = {};
  BOARD_COLUMNS.forEach((column) => {
    const index = headings.indexOf(column);
    member[column] = index === -1 ? "" : (row[index] || "").trim();
  });
  return member;
}

function renderCard(member) {
  const card = document.createElement("div");
  card.className = "card board-card";

  const role = document.createElement("h3");
  role.textContent = member.role;

  const details = document.createElement("p");
  const name = document.createElement("strong");
  name.textContent = member.name;
  details.appendChild(name);
  [member.title, member.institution].filter(Boolean).forEach((line) => {
    details.appendChild(document.createElement("br"));
    details.appendChild(document.createTextNode(line));
  });

  card.append(renderPhoto(member), role, details);
  return card;
}

function renderPhoto(member) {
  const src = photoSource(member.photo);
  if (!src) return renderInitials(member.name);

  const img = document.createElement("img");
  img.className = "board-photo";
  img.alt = "Headshot of " + member.name;
  img.loading = "lazy";
  // A private or deleted Drive file fails here; show initials instead of a broken image.
  img.addEventListener("error", () => img.replaceWith(renderInitials(member.name)), { once: true });
  img.src = src;
  return img;
}

// Officers paste a normal Drive share link, which points at Drive's viewer page
// rather than the image itself; the thumbnail endpoint serves the actual image.
function photoSource(link) {
  if (!link) return "";
  const driveId = link.includes("drive.google.com") && (link.match(/\/d\/([\w-]+)/) || link.match(/[?&]id=([\w-]+)/));
  if (driveId) return "https://drive.google.com/thumbnail?id=" + driveId[1] + "&sz=w400";
  return /^https?:\/\//i.test(link) ? link : "";
}

function renderInitials(name) {
  const avatar = document.createElement("div");
  avatar.className = "board-avatar";
  avatar.setAttribute("aria-hidden", "true");
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0] || "";
  const last = words.length > 1 ? words[words.length - 1] : "";
  avatar.textContent = (first.charAt(0) + last.charAt(0)).toUpperCase();
  return avatar;
}
