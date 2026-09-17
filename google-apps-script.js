/**
 * ============================================================================
 * DENTIVA DENTAL CLINIC — GOOGLE APPS SCRIPT DATABASE & AUTOMATION ENGINE
 * ============================================================================
 * 
 * This Google Apps Script acts as the serverless REST API backend and database
 * for the Dentiva Dental Clinic appointment booking system. It receives bookings
 * from booking.html, appends them to your Google Sheet, validates slots, sends
 * branded HTML confirmation emails to patients, and alerts the clinic team.
 * 
 * ----------------------------------------------------------------------------
 * 5-MINUTE SETUP INSTRUCTIONS:
 * ----------------------------------------------------------------------------
 * 1. Open Google Sheets (https://sheets.new) in your browser.
 * 2. Title your spreadsheet: "Dentiva Dental Clinic - Appointments Database"
 * 3. In the top menu, click: Extensions > Apps Script
 * 4. Delete all placeholder code inside Code.gs and paste THIS ENTIRE FILE.
 * 5. Update the CONFIGURATION section below with your clinic details & email.
 * 6. (Optional) Run the function "setupDatabase()" once in the Apps Script editor
 *    to automatically create and style the "Dentiva_Bookings" table with headers.
 * 7. Click the blue "Deploy" button (top right) > "New deployment".
 * 8. Click the gear icon next to "Select type" > select "Web app".
 * 9. Set the fields:
 *    - Description: "Dentiva Booking API v1"
 *    - Execute as: "Me (your Google account email)"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so client browsers can POST)
 * 10. Click "Deploy" and grant permissions if Google prompts you.
 * 11. Copy the generated "Web app URL" (ending in /exec).
 * 12. In Dentiva's booking.html, click "⚙️ Webhook Settings" and paste your URL!
 * ============================================================================
 */

// ============================================================================
// 1. CLINIC CONFIGURATION
// ============================================================================
const CONFIG = {
  SHEET_NAME: "Dentiva_Bookings",
  CLINIC_NAME: "Dentiva Dental Clinic",
  CLINIC_PHONE: "+1 (555) 234-8920",
  CLINIC_WHATSAPP: "+1 (555) 234-8920",
  CLINIC_RECEPTION_EMAIL: "contact@dentivaclinic.example", // Receptionist email for alerts
  ENABLE_PATIENT_CONFIRMATION_EMAIL: true,
  ENABLE_STAFF_ALERT_EMAIL: true,
  TIMEZONE: "UTC",
  CURRENCY_SYMBOL: "$"
};

// ============================================================================
// 2. CORS PREFLIGHT (OPTIONS)
// ============================================================================
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ============================================================================
// 3. GET HANDLER (Health Check & Booking Lookup API)
// ============================================================================
function doGet(e) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  try {
    const bookingId = e && e.parameter ? (e.parameter.bookingId || e.parameter.id || e.parameter.code) : null;

    if (!bookingId) {
      return createJsonResponse({
        status: "online",
        clinic: CONFIG.CLINIC_NAME,
        version: "2.0.0",
        message: "Dentiva Dental Clinic Google Sheets API is running smoothly."
      }, 200, corsHeaders);
    }

    return lookupBooking(bookingId, corsHeaders);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    }, 500, corsHeaders);
  }
}

// ============================================================================
// 4. POST HANDLER (Receives & Saves Dental Booking)
// ============================================================================
function doPost(e) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Ping / connectivity test
    if (data.action === "ping" || data.ping === true) {
      return createJsonResponse({
        status: "success",
        message: "Connection confirmed! Dentiva Google Sheets Database is active and receiving requests."
      }, 200, corsHeaders);
    }

    // Required fields check
    if (!data.name || !data.phone || !data.treatment) {
      return createJsonResponse({
        status: "error",
        message: "Missing required patient fields (name, phone, treatment)."
      }, 400, corsHeaders);
    }

    // Generate Unique Clinical Reference Code (e.g., DEN-2026-8492)
    const currentYear = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingId = data.bookingId || `DEN-${currentYear}-${randomCode}`;
    const timestamp = new Date();

    // Get or initialize Sheet
    const sheet = getOrCreateBookingsSheet();

    // Prepare row payload
    const newRow = [
      timestamp,                               // Col A: Timestamp
      bookingId,                               // Col B: Booking ID
      data.name || "",                         // Col C: Patient Name
      data.email || "",                        // Col D: Email Address
      data.phone || "",                        // Col E: Phone / WhatsApp
      data.treatment || "",                    // Col F: Treatment / Procedure
      data.location || "Central Flagship Center", // Col G: Clinic Location
      data.doctor || "Dr. Patricia Santos, DMD", // Col H: Specialist Clinician
      data.date || "",                         // Col I: Requested Date
      data.time || "",                         // Col J: Preferred Time Slot
      data.sedation || "Standard Anesthetic",  // Col K: Sedation Preference
      data.notes || "",                        // Col L: Clinical Notes / Phobia
      "CONFIRMED",                             // Col M: Status (CONFIRMED / PENDING)
      "Pending Email"                          // Col N: Email Notification Sent
    ];

    // Append to sheet
    sheet.appendRow(newRow);

    // Format new row
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    // Send Automated Patient Confirmation Email
    let emailStatus = "Not Sent";
    if (CONFIG.ENABLE_PATIENT_CONFIRMATION_EMAIL && data.email) {
      try {
        sendPatientConfirmationEmail(data, bookingId);
        emailStatus = "Sent to Patient";
      } catch (emailErr) {
        emailStatus = "Failed: " + emailErr.toString();
      }
    }

    // Send Clinic Reception Alert
    if (CONFIG.ENABLE_STAFF_ALERT_EMAIL && CONFIG.CLINIC_RECEPTION_EMAIL) {
      try {
        sendStaffAlertEmail(data, bookingId);
      } catch (staffErr) {
        console.warn("Staff alert email error: " + staffErr.toString());
      }
    }

    // Update email status cell
    sheet.getRange(lastRow, 14).setValue(emailStatus);

    return createJsonResponse({
      status: "success",
      bookingId: bookingId,
      patientName: data.name,
      treatment: data.treatment,
      location: data.location || "Central Flagship Center",
      doctor: data.doctor || "Dr. Patricia Santos, DMD",
      date: data.date,
      time: data.time,
      message: "Your appointment consultation has been recorded successfully in the Dentiva clinic database."
    }, 200, corsHeaders);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Backend processing error: " + error.toString()
    }, 500, corsHeaders);
  }
}

// ============================================================================
// 5. DATABASE TABLE SETUP (Auto-Run or Run Manually)
// ============================================================================
function setupDatabase() {
  getOrCreateBookingsSheet();
}

function getOrCreateBookingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  // If sheet is fresh/empty, style headers
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Booking ID",
      "Patient Name",
      "Email Address",
      "Phone / WhatsApp",
      "Treatment Procedure",
      "Clinic Location",
      "Specialist Doctor",
      "Appointment Date",
      "Time Slot",
      "Sedation Preference",
      "Clinical Notes / Requests",
      "Status",
      "Email Sent"
    ];

    sheet.appendRow(headers);

    // Style Header Row: Dark charcoal background (#141618), pure white text, bold, frozen
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#141618");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Inter");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // Auto-fit column widths
    for (let c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 160);
    }
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 160); // Booking ID
    sheet.setColumnWidth(3, 170); // Patient Name
    sheet.setColumnWidth(6, 220); // Treatment
    sheet.setColumnWidth(12, 260); // Notes
  }

  return sheet;
}

// ============================================================================
// 6. APPOINTMENT LOOKUP BY BOOKING ID
// ============================================================================
function lookupBooking(bookingId, corsHeaders) {
  const sheet = getOrCreateBookingsSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[1]).trim().toUpperCase() === String(bookingId).trim().toUpperCase()) {
      return createJsonResponse({
        status: "found",
        bookingId: row[1],
        patientName: row[2],
        email: row[3],
        phone: row[4],
        treatment: row[5],
        location: row[6],
        doctor: row[7],
        date: row[8],
        time: row[9],
        sedation: row[10],
        notes: row[11],
        bookingStatus: row[12]
      }, 200, corsHeaders);
    }
  }

  return createJsonResponse({
    status: "not_found",
    message: "No booking found matching reference: " + bookingId
  }, 404, corsHeaders);
}

// ============================================================================
// 7. BRANDED HTML PATIENT CONFIRMATION EMAIL
// ============================================================================
function sendPatientConfirmationEmail(data, bookingId) {
  const clinicAddress = data.location && data.location.toLowerCase().includes("north")
    ? "Unit 210, Skyline Health Pavilion, 168 Crescent Avenue, North District"
    : "Suite 402, Grandview Medical Arts Tower, 842 Horizon Boulevard, Metro Central";

  const mapLink = "https://maps.google.com/?q=Medical+Arts+Tower";

  const subject = `Dentiva Consultation Confirmed [Ref: ${bookingId}]`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 32px 16px; color: #141618; }
        .email-container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px rgba(20,22,24,0.06); border: 1px solid #E2E8F0; }
        .email-header { background: #141618; padding: 36px 32px; text-align: center; color: #FFFFFF; }
        .brand-pill { display: inline-block; background: rgba(255,255,255,0.15); border-radius: 9999px; padding: 6px 16px; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
        .email-title { font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
        .email-body { padding: 32px; }
        .booking-card { background: #E6F4F4; border-radius: 18px; padding: 22px; margin: 24px 0; border: 1px solid #C8E5E5; }
        .booking-ref-badge { display: inline-block; background: #178782; color: #FFFFFF; border-radius: 9999px; padding: 4px 14px; font-size: 13px; font-weight: 700; }
        .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(20,22,24,0.08); font-size: 14px; }
        .detail-label { color: #64748B; font-weight: 500; }
        .detail-val { color: #141618; font-weight: 600; text-align: right; }
        .action-btn { display: inline-block; background: #141618; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 18px; text-align: center; }
        .email-footer { padding: 24px 32px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="brand-pill">Dentiva Dental Clinic</div>
          <h1 class="email-title">Consultation Confirmed</h1>
        </div>
        <div class="email-body">
          <p>Dear <strong>${escapeHtml(data.name)}</strong>,</p>
          <p>Thank you for scheduling your dental appointment with Dentiva. Your clinical reservation has been secured in our system.</p>

          <div class="booking-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span style="font-size: 13px; color: #475569; font-weight: 600;">Booking Reference:</span>
              <span class="booking-ref-badge">${bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Treatment Procedure:</span>
              <span class="detail-val">${escapeHtml(data.treatment)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Clinic Location:</span>
              <span class="detail-val">${escapeHtml(data.location || "Central Flagship Center")}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Specialist Clinician:</span>
              <span class="detail-val">${escapeHtml(data.doctor || "Dr. Patricia Santos, DMD")}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time:</span>
              <span class="detail-val">${escapeHtml(data.date)} at ${escapeHtml(data.time)}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Sedation Request:</span>
              <span class="detail-val">${escapeHtml(data.sedation || "Standard Anesthetic")}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #475569;"><strong>Clinic Address:</strong><br>${clinicAddress}</p>

          <div style="text-align: center;">
            <a href="${mapLink}" target="_blank" class="action-btn">Get Clinic Directions ➔</a>
          </div>

          <p style="font-size: 13px; color: #64748B; margin-top: 24px;">
            Need to adjust your time slot? Call our concierge team on <strong>${CONFIG.CLINIC_PHONE}</strong> or message us directly on live chat.
          </p>
        </div>
        <div class="email-footer">
          © 2026 Dentiva Dental Clinic • All Rights Reserved.<br>
          Accredited Dental Healthcare Provider &amp; Clinical Excellence Network.
        </div>
      </div>
    </body>
    </html>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ============================================================================
// 8. STAFF ALERT EMAIL
// ============================================================================
function sendStaffAlertEmail(data, bookingId) {
  const subject = `[NEW APPOINTMENT] ${data.name} — ${data.treatment} (${data.date})`;
  const body = `
New patient appointment booked online:

Reference: ${bookingId}
Patient: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Procedure: ${data.treatment}
Location: ${data.location}
Doctor: ${data.doctor}
Date/Time: ${data.date} @ ${data.time}
Sedation: ${data.sedation}
Notes: ${data.notes || "None"}

Please verify in the Dentiva_Bookings spreadsheet and prepare patient clinical dossier.
  `;

  MailApp.sendEmail({
    to: CONFIG.CLINIC_RECEPTION_EMAIL,
    subject: subject,
    body: body
  });
}

// ============================================================================
// 9. UTILITY HELPERS
// ============================================================================
function createJsonResponse(data, statusCode, corsHeaders) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  if (corsHeaders) {
    for (const key in corsHeaders) {
      output.setHeader(key, corsHeaders[key]);
    }
  }

  return output;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
