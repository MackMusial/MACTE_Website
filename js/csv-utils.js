// Shared CSV parser used by any page that pulls data from a published
// Google Sheet CSV (see meetings-data.js).
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    //if it sees a ", it checks the next character too. Two q uotes in a row ("") is CSV's escape for a litter quote inside a quoted field.
    //So it adds one " to the field and skips ahead. A single " ends the quoted field. 
    // If it sees a comma, it adds the field to the row and starts a new field. 
    // If it sees a newline, it adds the field to the row, adds the row to the rows array, 
    // and starts a new row and field. 
    // Otherwise, its an ordenary character and it adds the character to the current field.
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      //
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
// After the loop, if there is any remaining field or row, it adds them to the rows array.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
// Finally, it filters out any empty rows (rows where all cells are empty or whitespace) and returns the resulting array of rows.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}
