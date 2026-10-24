// Renders the archived documents list on resources.html from a published Google
// Sheet, so officers can post minutes and articles without touching HTML. Setup
// and the officer-facing rules are in README.md, "Part 5 — The documents sheet and PDFs".

// Paste the sheet's published CSV link here (must end in output=csv).
const DOCUMENTS_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEzhh0KIer3LhJH3mQFDhg7tod5cpWq1XZFd-6MhJQB0WrqwUMhumSQKwHktnOFEBXrSQr_EJjWj92/pub?output=csv";

// Columns are found by header name, not position, same as the board sheet.
const DOCUMENT_COLUMNS = ["title", "date", "type", "link"];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("doc-list");
  const notice = document.getElementById("doc-notice");
  if (!list || !notice) return;

  if (!DOCUMENTS_SHEET_CSV_URL) {
    notice.textContent = "The document archive isn't connected yet.";
    return;
  }

  fetch(DOCUMENTS_SHEET_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Sheet request failed");
      return response.text();
    })
    .then((text) => {
      const [header = [], ...rows] = parseCSV(text);
      const documents = rows
        .map((row) => toDocument(header, row))
        .filter((doc) => doc.title && downloadLink(doc.link));

      if (documents.length === 0) {
        notice.textContent = "No documents are posted right now.";
        return;
      }

      list.replaceChildren(...documents.map(renderDocument));
      notice.hidden = true;
    })
    .catch(() => {
      notice.textContent = "The document archive couldn't be loaded right now. Please check back later.";
    });
});

function toDocument(header, row) {
  const headings = header.map((cell) => cell.trim().toLowerCase());
  const doc = {};
  DOCUMENT_COLUMNS.forEach((column) => {
    const index = headings.indexOf(column);
    doc[column] = index === -1 ? "" : (row[index] || "").trim();
  });
  return doc;
}

function renderDocument(doc) {
  const item = document.createElement("li");

  const text = document.createElement("div");
  const name = document.createElement("div");
  name.className = "doc-name";
  name.textContent = doc.title;
  text.appendChild(name);

  const metaParts = [doc.date, doc.type].filter(Boolean);
  if (metaParts.length) {
    const meta = document.createElement("div");
    meta.className = "doc-meta";
    meta.textContent = metaParts.join(" · ");
    text.appendChild(meta);
  }

  const link = document.createElement("a");
  link.className = "doc-download btn btn-secondary";
  link.href = downloadLink(doc.link);
  link.textContent = "Download";
  link.setAttribute("aria-label", "Download " + doc.title);

  item.append(text, link);
  return item;
}

// Officers paste a normal Drive share link, which opens Drive's viewer page;
// the export address downloads the file itself. Non-Drive links (e.g. an
// article hosted elsewhere) are used as-is.
function downloadLink(link) {
  if (!link) return "";
  const driveId = link.includes("drive.google.com") && (link.match(/\/d\/([\w-]+)/) || link.match(/[?&]id=([\w-]+)/));
  if (driveId) return "https://drive.google.com/uc?export=download&id=" + driveId[1];
  return /^https?:\/\//i.test(link) ? link : "";
}
