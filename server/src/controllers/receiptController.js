const db = require('../db');
const { calculateItemTotal, tolaToGrams, gramsToTolaMashaRati } = require('../utils/goldCalculations');

// Format database row to clean JSON matching frontend
function formatReceipt(row, items = []) {
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
    customer: {
      name: row.customer_name,
      phone: row.customer_phone || ''
    },
    goldRate: parseFloat(row.gold_rate) || 0,
    goldKarat: row.gold_karat || '22K',
    palashWeight: parseFloat(row.palash_weight) || 0,
    items: items.map(item => ({
      id: item.id,
      description: item.description,
      karat: item.karat || row.gold_karat || '22K',
      grossWeight: parseFloat(item.gross_weight) || 0,
      wasteOrStoneWeight: parseFloat(item.waste_stone_weight) || 0,
      netWeight: parseFloat(item.net_weight) || 0,
      goldRate: parseFloat(item.gold_rate) || parseFloat(row.gold_rate) || 0,
      makingCharges: parseFloat(item.making_charges) || 0,
      total: parseFloat(item.total_amount) || 0
    })),
    summary: {
      grandTotal: parseFloat(row.total_amount) || 0,
      paidAmount: parseFloat(row.advance_amount) || 0,
      balanceDue: parseFloat(row.balance_due) || 0
    },
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

exports.getAllReceipts = async (req, res) => {
  try {
    const receiptsResult = await db.query(`
      SELECT * FROM receipts ORDER BY id DESC;
    `);

    const itemsResult = await db.query(`
      SELECT * FROM receipt_items ORDER BY id ASC;
    `);

    // Group items by receipt_id
    const itemsByReceipt = {};
    itemsResult.rows.forEach(item => {
      if (!itemsByReceipt[item.receipt_id]) {
        itemsByReceipt[item.receipt_id] = [];
      }
      itemsByReceipt[item.receipt_id].push(item);
    });

    const formatted = receiptsResult.rows.map(row => 
      formatReceipt(row, itemsByReceipt[row.id] || [])
    );

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));

    let receiptResult;
    if (isNum) {
      receiptResult = await db.query(
        `SELECT * FROM receipts WHERE id = $1 OR receipt_number = $2 LIMIT 1;`,
        [parseInt(id, 10), String(id)]
      );
    } else {
      receiptResult = await db.query(
        `SELECT * FROM receipts WHERE receipt_number = $1 LIMIT 1;`,
        [String(id)]
      );
    }

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const receiptRow = receiptResult.rows[0];
    const itemsResult = await db.query(
      `SELECT * FROM receipt_items WHERE receipt_id = $1 ORDER BY id ASC;`,
      [receiptRow.id]
    );

    res.json({ success: true, data: formatReceipt(receiptRow, itemsResult.rows) });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createReceipt = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      receiptNumber,
      date,
      customer,
      goldRate,
      goldKarat,
      palashWeight = 0,
      items = [],
      summary = {},
      notes = ''
    } = req.body;

    const customerName = (customer?.name || '').trim() || 'عام گاہک';
    const customerPhone = customer?.phone || '';

    await client.query('BEGIN');

    // Generate receipt number if not provided
    let finalReceiptNumber = (receiptNumber || '').trim();
    if (!finalReceiptNumber) {
      const maxRes = await client.query(`
        SELECT COALESCE(MAX(
          CASE WHEN receipt_number ~ '^[0-9]+$' THEN receipt_number::bigint ELSE 0 END
        ), 0) + 1 AS next_num FROM receipts;
      `);
      finalReceiptNumber = `${maxRes.rows[0]?.next_num || 1}`;
    }

    const insertReceiptQuery = `
      INSERT INTO receipts (
        receipt_number, date, customer_name, customer_phone,
        gold_rate, gold_karat, palash_weight, total_amount, advance_amount, balance_due, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const receiptValues = [
      finalReceiptNumber,
      date || new Date().toISOString().split('T')[0],
      customerName,
      customerPhone,
      parseFloat(goldRate) || 0,
      goldKarat || '22K',
      parseFloat(palashWeight) || 0,
      parseFloat(summary.grandTotal) || 0,
      parseFloat(summary.paidAmount) || 0,
      parseFloat(summary.balanceDue) || 0,
      notes || ''
    ];

    const receiptResult = await client.query(insertReceiptQuery, receiptValues);
    const createdReceipt = receiptResult.rows[0];

    // Insert only items that have description or weight
    const validItems = (items || []).filter(
      it => (it.description && it.description.trim() !== '') || (parseFloat(it.weight || it.netWeight || it.grossWeight) > 0)
    );

    const createdItems = [];
    for (const item of validItems) {
      const w = parseFloat(item.weight || item.netWeight || item.grossWeight) || 0;
      const itemRes = await client.query(`
        INSERT INTO receipt_items (
          receipt_id, description, karat, gross_weight, waste_stone_weight,
          net_weight, gold_rate, making_charges, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `, [
        createdReceipt.id,
        item.description || 'گولڈ آئٹم',
        item.karat || goldKarat || '22K',
        w,
        parseFloat(item.wasteOrStoneWeight) || 0,
        w,
        parseFloat(item.goldRate) || parseFloat(goldRate) || 0,
        parseFloat(item.makingCharges) || 0,
        parseFloat(item.total) || 0
      ]);
      createdItems.push(itemRes.rows[0]);
    }

    await client.query('COMMIT');

    const formatted = formatReceipt(createdReceipt, createdItems);
    res.status(201).json({ success: true, message: 'Receipt saved in PostgreSQL', data: formatted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

exports.updateReceipt = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return res.status(400).json({ success: false, message: 'Invalid receipt ID' });
    }

    const {
      receiptNumber,
      date,
      customer,
      goldRate,
      goldKarat,
      palashWeight = 0,
      items = [],
      summary = {},
      notes = ''
    } = req.body;

    const customerName = (customer?.name || '').trim() || 'عام گاہک';
    const customerPhone = customer?.phone || '';

    await client.query('BEGIN');

    // 1. Update receipts table
    const updateQuery = `
      UPDATE receipts SET
        receipt_number = COALESCE($1, receipt_number),
        date = $2,
        customer_name = $3,
        customer_phone = $4,
        gold_rate = $5,
        gold_karat = $6,
        palash_weight = $7,
        total_amount = $8,
        advance_amount = $9,
        balance_due = $10,
        notes = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *;
    `;

    const values = [
      receiptNumber || `${numId}`,
      date || new Date().toISOString().split('T')[0],
      customerName,
      customerPhone,
      parseFloat(goldRate) || 0,
      goldKarat || '22K',
      parseFloat(palashWeight) || 0,
      parseFloat(summary.grandTotal) || 0,
      parseFloat(summary.paidAmount) || 0,
      parseFloat(summary.balanceDue) || 0,
      notes || '',
      numId
    ];

    const receiptResult = await client.query(updateQuery, values);
    if (receiptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    const updatedReceipt = receiptResult.rows[0];

    // 2. Replace receipt_items for this receipt
    await client.query('DELETE FROM receipt_items WHERE receipt_id = $1;', [numId]);

    const createdItems = [];
    const validItems = (items || []).filter(
      it => (it.description && it.description.trim() !== '') || (parseFloat(it.weight || it.netWeight || it.grossWeight) > 0)
    );

    for (const item of validItems) {
      const w = parseFloat(item.weight || item.netWeight || item.grossWeight) || 0;
      const itemRes = await client.query(`
        INSERT INTO receipt_items (
          receipt_id, description, karat, gross_weight, waste_stone_weight,
          net_weight, gold_rate, making_charges, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `, [
        numId,
        item.description || 'گولڈ آئٹم',
        item.karat || goldKarat || '22K',
        w,
        parseFloat(item.wasteOrStoneWeight) || 0,
        w,
        parseFloat(item.goldRate) || parseFloat(goldRate) || 0,
        parseFloat(item.makingCharges) || 0,
        parseFloat(item.total) || 0
      ]);
      createdItems.push(itemRes.rows[0]);
    }

    await client.query('COMMIT');

    const formatted = formatReceipt(updatedReceipt, createdItems);
    res.json({ success: true, message: 'Receipt updated successfully in PostgreSQL', data: formatted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      return res.json({ success: true, message: 'Receipt cleared' });
    }

    // Always delete by numeric DB id ONLY — never by receipt_number to avoid bulk deletes
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      // If non-numeric id passed, treat as already deleted
      return res.json({ success: true, message: 'Receipt not found, already removed', id });
    }

    const result = await db.query(
      'DELETE FROM receipts WHERE id = $1 RETURNING id;',
      [numId]
    );

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
      id: result.rows[0]?.id || numId
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
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
