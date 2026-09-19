// Sends the contact.html form to a Google Apps Script web app, which appends
// the message to the MACTE submissions sheet and emails info@macte.us.
// The matching server-side code and its deployment steps are in
// apps-script/contact-form.gs.

// Paste the Apps Script web app /exec URL here after deploying it.
const CONTACT_ENDPOINT_URL = "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  if (!form || !status) return;

  const submitButton = form.querySelector("button[type=submit]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!CONTACT_ENDPOINT_URL) {
      setStatus("This form isn't connected yet. Please email info@macte.us directly.", "error");
      return;
    }

    submitButton.disabled = true;
    setStatus("Sending your message…", "");

    // Sent as FormData so this stays a "simple" request. Apps Script has no
    // doOptions and can't answer a CORS preflight, which a JSON content-type
    // would trigger.
    fetch(CONTACT_ENDPOINT_URL, { method: "POST", body: new FormData(form) })
      .then((response) => response.json())
      .then((data) => {
        if (data.result !== "ok") throw new Error(data.message || "Submission failed");
        form.reset();
        setStatus("Thanks — your message was sent. An officer will follow up soon.", "success");
      })
      .catch(() => {
        setStatus(
          "Sorry, your message couldn't be sent. Please email info@macte.us directly.",
          "error"
        );
      })
      .finally(() => {
        submitButton.disabled = false;
      });
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = kind ? "form-status " + kind : "form-status";
    status.hidden = false;
  }
});
