'use strict';

/**
 * Google Sheets Controller
 * Replaces PostgreSQL with Google Sheets as data store
 * 
 * Sheet columns (A-N):
 * A=ID, B=پرچی نمبر, C=تاریخ, D=گاہک کا نام, E=رابطہ نمبر,
 * F=سونا ریٹ, G=کیریٹ سونا, H=پالش وزن, I=کل وزن,
 * J=زیورات تفصیل, K=کل قیمت, L=جمع رقم, M=بقایا, N=نوٹس
 */

const { getSheetsClient } = require('../sheetsClient');
const { calculateItemTotal, tolaToGrams, gramsToTolaMashaRati } = require('../utils/goldCalculations');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_TAB = process.env.SHEET_TAB || 'پرچیاں ریکارڈ';
const HEADERS = [
  'ID', 'پرچی نمبر', 'تاریخ', 'گاہک کا نام', 'رابطہ نمبر',
  'سونا ریٹ', 'کیریٹ سونا', 'پالش وزن', 'کل وزن',
  'زیورات تفصیل', 'کل قیمت', 'جمع رقم', 'بقایا', 'نوٹس'
];
const DATA_RANGE = `${SHEET_TAB}!A2:N`;
const HEADER_RANGE = `${SHEET_TAB}!A1:N1`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Serialize items array → compact string for column J */
function serializeItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .filter(it => it.description && it.description.trim())
    .map(it => {
      const w = parseFloat(it.weight || it.netWeight || it.grossWeight) || 0;
      const mc = parseFloat(it.makingCharges) || 0;
      const total = parseFloat(it.total) || 0;
      return `${it.description}|${w}|${it.karat || ''}|${mc}|${total}`;
    })
    .join(';;');
}

/** Parse column J string → items array */
function parseItems(str = '') {
  if (!str || str.trim() === '') return [];
  return str.split(';;').map((part, idx) => {
    const [description, weight, karat, makingCharges, total] = part.split('|');
    const w = parseFloat(weight) || 0;
    return {
      id: idx + 1,
      description: description || 'گولڈ آئٹم',
      karat: karat || '22K',
      grossWeight: w,
      wasteOrStoneWeight: 0,
      netWeight: w,
      goldRate: 0,
      makingCharges: parseFloat(makingCharges) || 0,
      total: parseFloat(total) || 0
    };
  });
}

/** Convert sheet row array → receipt object */
function rowToReceipt(row) {
  const [id, receiptNumber, date, customerName, customerPhone,
    goldRate, goldKarat, palashWeight, totalWeight,
    itemsStr, grandTotal, paidAmount, balanceDue, notes] = row;

  return {
    id: parseInt(id) || 0,
    receiptNumber: receiptNumber || '',
    date: date || '',
    customer: {
      name: customerName || '',
      phone: customerPhone || ''
    },
    goldRate: parseFloat(goldRate) || 0,
    goldKarat: goldKarat || '22K',
    palashWeight: parseFloat(palashWeight) || 0,
    items: parseItems(itemsStr),
    summary: {
      grandTotal: parseFloat(grandTotal) || 0,
      paidAmount: parseFloat(paidAmount) || 0,
      balanceDue: parseFloat(balanceDue) || 0
    },
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
}

/** Convert receipt data → sheet row array */
function receiptToRow(id, body) {
  const {
    receiptNumber = '',
    date = '',
    customer = {},
    goldRate = 0,
    goldKarat = '22K',
    palashWeight = 0,
    items = [],
    summary = {},
    notes = ''
  } = body;

  const customerName = (customer.name || '').trim() || 'عام گاہک';
  const customerPhone = customer.phone || '';
  const totalWeight = items.reduce((sum, it) => sum + (parseFloat(it.weight || it.netWeight || it.grossWeight) || 0), 0);

  return [
    String(id),
    String(receiptNumber || id),
    date || new Date().toISOString().split('T')[0],
    customerName,
    customerPhone,
    String(parseFloat(goldRate) || 0),
    goldKarat || '22K',
    String(parseFloat(palashWeight) || 0),
    String(totalWeight),
    serializeItems(items),
    String(parseFloat(summary.grandTotal) || 0),
    String(parseFloat(summary.paidAmount) || 0),
    String(parseFloat(summary.balanceDue) || 0),
    notes || ''
  ];
}

/** Ensure header row exists */
async function ensureHeaders(sheets) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: HEADER_RANGE
    });
    const existing = (res.data.values || [])[0] || [];
    if (existing.length < HEADERS.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: HEADER_RANGE,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] }
      });
    }
  } catch (e) {
    // ignore header check errors
  }
}

/** Read all data rows and return { rows, nextId } */
async function readAllRows(sheets) {
  await ensureHeaders(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: DATA_RANGE,
    valueRenderOption: 'UNFORMATTED_VALUE'
  });
  const rows = res.data.values || [];
  // Find max ID to generate next
  let maxId = 0;
  rows.forEach(row => {
    const id = parseInt(row[0]) || 0;
    if (id > maxId) maxId = id;
  });
  return { rows, nextId: maxId + 1 };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

exports.getAllReceipts = async (req, res) => {
  try {
    const sheets = getSheetsClient();
    const { rows } = await readAllRows(sheets);
    const receipts = rows
      .filter(row => row && row[0]) // skip empty rows
      .map(rowToReceipt)
      .reverse(); // newest first
    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error) {
    console.error('getAllReceipts error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const sheets = getSheetsClient();
    const { rows } = await readAllRows(sheets);

    const row = rows.find(r => r[0] === id || r[0] === parseInt(id) || r[1] === id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'پرچی نہیں ملی' });
    }
    res.json({ success: true, data: rowToReceipt(row) });
  } catch (error) {
    console.error('getReceiptById error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createReceipt = async (req, res) => {
  try {
    const sheets = getSheetsClient();
    const { rows, nextId } = await readAllRows(sheets);

    // Auto receipt number if not provided
    let receiptNumber = (req.body.receiptNumber || '').trim();
    if (!receiptNumber) {
      receiptNumber = String(nextId);
    }

    const newRow = receiptToRow(nextId, { ...req.body, receiptNumber });

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [newRow] }
    });

    res.json({
      success: true,
      message: 'پرچی محفوظ ہو گئی ✅',
      data: rowToReceipt(newRow)
    });
  } catch (error) {
    console.error('createReceipt error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const sheets = getSheetsClient();
    const { rows } = await readAllRows(sheets);

    // Find row index (1-based, +2 for header and 1-based API)
    const rowIdx = rows.findIndex(r => String(r[0]) === String(id) || String(r[1]) === String(id));
    if (rowIdx === -1) {
      return res.status(404).json({ success: false, message: 'پرچی نہیں ملی' });
    }

    const sheetRowNumber = rowIdx + 2; // +1 for header, +1 for 1-based index
    const numericId = parseInt(rows[rowIdx][0]) || parseInt(id);
    const updatedRow = receiptToRow(numericId, req.body);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TAB}!A${sheetRowNumber}:N${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] }
    });

    res.json({
      success: true,
      message: 'پرچی اپڈیٹ ہو گئی ✅',
      data: rowToReceipt(updatedRow)
    });
  } catch (error) {
    console.error('updateReceipt error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      return res.json({ success: true, message: 'پرچی صاف کر دی' });
    }

    const sheets = getSheetsClient();
    const { rows } = await readAllRows(sheets);

    const rowIdx = rows.findIndex(r => String(r[0]) === String(id));
    if (rowIdx === -1) {
      return res.json({ success: true, message: 'پرچی پہلے سے ہٹا دی گئی', id });
    }

    const sheetRowNumber = rowIdx + 2; // +1 header, +1 for 1-based

    // Get sheet ID (gid) for the tab
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetMeta = spreadsheet.data.sheets.find(
      s => s.properties.title === SHEET_TAB
    );
    const sheetId = sheetMeta ? sheetMeta.properties.sheetId : 0;

    // Delete the row using batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: sheetRowNumber - 1, // 0-based
              endIndex: sheetRowNumber        // exclusive
            }
          }
        }]
      }
    });

    res.json({ success: true, message: 'پرچی حذف ہو گئی ✅', id });
  } catch (error) {
    console.error('deleteReceipt error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.calculateQuickTotal = (req, res) => {
  try {
    const result = calculateItemTotal(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.convertUnits = (req, res) => {
  try {
    const { tola, masha, rati, grams } = req.query;
    if (grams !== undefined) {
      return res.json({ success: true, data: gramsToTolaMashaRati(grams) });
    }
    const calculatedGrams = tolaToGrams(tola || 0, masha || 0, rati || 0);
    res.json({ success: true, data: { grams: calculatedGrams } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

