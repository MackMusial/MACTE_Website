/**
 * MACTE contact form backend — a copy of the script deployed in Google.
 * This file is NOT used by the website; it lives here so the code isn't
 * lost if the Google account it runs under changes hands.
 *
 * Setup:
 *  1. Create a Google Sheet owned by the MACTE account (not a personal one)
 *     with a tab named "Submissions" and a header row:
 *     Timestamp | Name | Email | Institution | Message
 *  2. On that sheet: Extensions > Apps Script, paste this file in, save.
 *  3. Deploy > New deployment > Web app.
 *     "Execute as: Me", "Who has access: Anyone". Authorize when prompted.
 *  4. Copy the /exec URL into CONTACT_ENDPOINT_URL in js/contact-form.js.
 *
 * After editing this script, Deploy > Manage deployments > edit > New version.
 * Saving alone does not update the live URL.
 */

const SHEET_NAME = "Submissions";
const NOTIFY_EMAIL = "info@macte.us";

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};

    // Bots fill the hidden field; humans never see it. Report success so the
    // bot treats it as delivered and moves on.
    if (params["bot-field"]) return jsonResponse({ result: "ok" });

    const name = (params.name || "").trim();
    const email = (params.email || "").trim();
    const institution = (params.institution || "").trim();
    const message = (params.message || "").trim();

    if (!name || !email || !message) {
      return jsonResponse({ result: "error", message: "Missing required fields." });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([new Date(), name, email, institution, message]);

    // The row is the record of note, so a failed notification must not turn a
    // saved submission into an error the visitor sees and retries.
    try {
      notify(name, email, institution, message);
    } catch (mailError) {
      console.error("Notification email failed: " + mailError);
    }

    return jsonResponse({ result: "ok" });
  } catch (error) {
    console.error(error);
    return jsonResponse({ result: "error", message: String(error) });
  }
}

function notify(name, email, institution, message) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "MACTE website contact form — " + name,
    replyTo: email,
    body: [
      "Name: " + name,
      "Email: " + email,
      "Institution: " + (institution || "(not provided)"),
      "",
      message,
    ].join("\n"),
  });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
