/**
 * EKA Fleet Data API — paste this whole file into Extensions > Apps Script
 * in your Google Sheet, then deploy as a Web App (see REGION_DATA_SETUP.md).
 *
 * Reads 4 tabs — RegionalSpread, Highlights, Issues, Training — and returns
 * them as one JSON object grouped by vehicle key, shaped to match exactly
 * what src/data/liveData.ts expects on the React side.
 *
 * This script only reads. It never writes back to the sheet.
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const data = {
    regionalSpread: readRegionalSpread(ss),
    highlights: readHighlights(ss),
    issues: readIssues(ss),
    training: readTraining(ss),
    generatedAt: new Date().toISOString(),
  };

  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function sheetRows(ss, tabName) {
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map((h) => String(h).trim());
  return values.slice(1)
    .filter((row) => row.some((cell) => cell !== '' && cell !== null))
    .map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
}

function groupByVehicle(rows) {
  const grouped = {};
  rows.forEach((row) => {
    const vehicle = String(row.Vehicle || '').trim().toLowerCase();
    if (!vehicle) return;
    if (!grouped[vehicle]) grouped[vehicle] = [];
    grouped[vehicle].push(row);
  });
  return grouped;
}

function readRegionalSpread(ss) {
  const rows = sheetRows(ss, 'RegionalSpread');
  const grouped = groupByVehicle(rows);
  const result = {};
  Object.keys(grouped).forEach((vehicle) => {
    result[vehicle] = grouped[vehicle].map((r) => ({
      region: String(r.Region || '').trim(),
      count: Number(r.Count) || 0,
    }));
  });
  return result;
}

function readHighlights(ss) {
  const rows = sheetRows(ss, 'Highlights');
  const grouped = groupByVehicle(rows);
  const result = {};
  Object.keys(grouped).forEach((vehicle) => {
    result[vehicle] = grouped[vehicle].map((r) => ({
      label: String(r.Label || '').trim(),
      value: String(r.Value || '').trim(),
    }));
  });
  return result;
}

function readIssues(ss) {
  const rows = sheetRows(ss, 'Issues');
  const grouped = groupByVehicle(rows);
  const result = {};
  Object.keys(grouped).forEach((vehicle) => {
    result[vehicle] = grouped[vehicle].map((r) => ({
      id: String(r.ID || '').trim(),
      title: String(r.Title || '').trim(),
      severity: String(r.Severity || '').trim(),
      status: String(r.Status || '').trim(),
      desc: String(r.Description || '').trim(),
      action: String(r.Action || '').trim(),
    }));
  });
  return result;
}

function readTraining(ss) {
  const rows = sheetRows(ss, 'Training');
  const grouped = groupByVehicle(rows);
  const result = {};
  Object.keys(grouped).forEach((vehicle) => {
    const vehicleRows = grouped[vehicle];
    const sessions = vehicleRows
      .filter((r) => String(r.Type || '').trim().toLowerCase() === 'session')
      .map((r) => ({
        label: String(r.Label || '').trim(),
        date: String(r['Value/Date'] || '').trim(),
      }));
    const stats = vehicleRows
      .filter((r) => String(r.Type || '').trim().toLowerCase() === 'stat')
      .map((r) => ({
        label: String(r.Label || '').trim(),
        value: String(r['Value/Date'] || '').trim(),
      }));
    result[vehicle] = { sessions, stats };
  });
  return result;
}
