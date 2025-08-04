//main spreadsheet
const ss = SpreadsheetApp.getActiveSpreadsheet();
const ui = SpreadsheetApp.getUi()

//sub sheets

const URLInputsSheet = ss.getSheetByName('URL Inputs');

// Cell values

const auditId = URLInputsSheet.getRange('C2').getValue()
const auditLimit = URLInputsSheet.getRange('C5').getValue()
const newStartingURLs = [...new Set(URLInputsSheet.getRange('A2:A').getValues().flat().filter(cell => cell !== ""))]
const testUTMs = '?utm_source=testSource&utm_medium=testMedium&utm_campaign=testCampaign'
const apiKey = `api_key ${URLInputsSheet.getRange('C3').getValue()}`

//ObservePoint API Call
function apiRequest(endpoint, version, token, method, payload) {
  var url = `https://api.observepoint.com/${version}${endpoint}`;
  var options = {
    'method': method,
    'headers': {
      Authorization: token
    },
    'payload': JSON.stringify(payload),
    'contentType': 'application/json'
  };
  if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH') options.payload = JSON.stringify(payload);
  var ret;
  try {
    ret = UrlFetchApp.fetch(url, options);
  } catch (e) {
    throw new Error('error in apiRequest', e);
  }
  var output;
  try {output = JSON.parse(ret);} catch (e) {output = {}};
  return output;
}
