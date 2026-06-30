# Region Team Data Input — Google Sheets Setup

This replaces the hardcoded `regionalSpread`, `highlights`, `issuesAndActions`,
and `trainingGlimpses` functions in `src/data/vehicles.ts` with live data the
regional team edits directly in a spreadsheet.

Vehicle **Description** (specs, tagline, model) stays hardcoded in
`vehicles.ts` — it rarely changes and isn't regional input.

## 1. Create the sheet

Create one Google Sheet named e.g. **"EKA Fleet Data"**, with 4 tabs. Use
these exact tab names and column headers (case-sensitive — the Apps Script
below reads them literally).

### Tab: `RegionalSpread`

| Vehicle | Region            | Count |
|---------|-------------------|-------|
| bus     | North             | 148   |
| bus     | West              | 96    |
| bus     | South             | 72    |
| bus     | East              | 39    |
| auto    | Metro             | 412   |
| auto    | Tier 2            | 268   |
| pickup  | Metro             | 211   |
| truck   | Highway Corridor  | 64    |

`Vehicle` must be one of: `bus`, `auto`, `pickup`, `truck` (lowercase).

### Tab: `Highlights`

| Vehicle | Label          | Value   |
|---------|----------------|---------|
| bus     | Fleet Uptime   | 98.2%   |
| bus     | CO2 Avoided    | 2.1M kg |
| auto    | Vehicles Active| 825     |

### Tab: `Issues`

| Vehicle | ID      | Title                          | Severity | Status      | Description                                  | Action                                              |
|---------|---------|---------------------------------|----------|-------------|-----------------------------------------------|------------------------------------------------------|
| bus     | BUS-01  | AC compressor noise at high load| Minor    | Resolved    | Rattling under sustained high load in summer.| Mounting dampeners replaced; firmware capped draw.   |
| auto    | AUTO-01 | Regen braking jerk at low speed | Minor    | Resolved    | Abrupt deceleration below 12 km/h.            | Regen curve smoothed via OTA below 18 km/h.          |

`Severity` must be `Minor` or `Critical`.
`Status` must be `Resolved` or `In Progress`.

### Tab: `Training`

Two sections in one tab — sessions and summary stats — distinguished by a
`Type` column:

| Vehicle | Type     | Label                       | Value/Date |
|---------|----------|------------------------------|------------|
| bus     | session  | Driver Induction — Pune      | Feb 2025   |
| bus     | session  | BMS Diagnostics Workshop     | Jan 2025   |
| bus     | stat     | Trainees                     | 450        |
| bus     | stat     | Sessions                     | 38         |
| bus     | stat     | Satisfaction                 | 94%        |

`Type` must be `session` or `stat`. For `session` rows, the last column is a
date string. For `stat` rows, it's the stat value.

## 2. Publish the sheet as a JSON API (Google Apps Script)

This is the part that turns your spreadsheet into something your app can
fetch. No separate server needed — Google hosts this for you, for free.

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Delete the default code and paste in `apps-script.gs` (next to this file).
3. Click **Deploy → New deployment**.
4. Click the gear icon next to "Select type" → choose **Web app**.
5. Settings:
   - Description: `EKA Fleet Data API`
   - Execute as: **Me**
   - Who has access: **Anyone** (this only exposes read-only data you've
     chosen to expose — the script only reads, never writes)
6. Click **Deploy**. Authorize it when prompted (your own Google account).
7. Copy the **Web app URL** it gives you — looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
8. Put that URL into your app's `.env` file as `VITE_SHEET_API_URL` (see
   `src/data/liveData.ts` for how it's used).

**Important:** every time you edit the Apps Script code itself (not the
sheet data — editing data needs no redeploy), you must create a **new
deployment** for changes to take effect, or use "Manage deployments" →
edit the existing one's version.

## 3. How often does it refresh?

`liveData.ts` polls the published URL every 60 seconds by default while the
app is open, and also refetches whenever the orbital view for a vehicle is
opened. Adjust `POLL_INTERVAL_MS` in that file if you want faster/slower.

## 4. What the regional team actually does

They open the Google Sheet (share it with their account, Editor access),
and:
- Add a new row to `Issues` when a new issue comes up
- Change a `Status` cell from `In Progress` to `Resolved`
- Update a `Count` number in `RegionalSpread` when deployment changes
- Add a new row to `Training` after a session

No code, no deploys, no waiting on you. It shows up in the app within the
polling interval automatically.
