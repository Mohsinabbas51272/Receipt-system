const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://mohsinabbas@127.0.0.1:5432/gold_receipt_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database (gold_receipt_db)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Initialize database schema
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Receipts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id SERIAL PRIMARY KEY,
        receipt_number VARCHAR(50) NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        gold_rate NUMERIC(12, 2) DEFAULT 0,
        gold_karat VARCHAR(20) DEFAULT '22K',
        palash_weight NUMERIC(10, 3) DEFAULT 0,
        total_amount NUMERIC(12, 2) DEFAULT 0,
        advance_amount NUMERIC(12, 2) DEFAULT 0,
        balance_due NUMERIC(12, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Receipt items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipt_items (
        id SERIAL PRIMARY KEY,
        receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        karat VARCHAR(20) DEFAULT '22K',
        gross_weight NUMERIC(10, 3) DEFAULT 0,
        waste_stone_weight NUMERIC(10, 3) DEFAULT 0,
        net_weight NUMERIC(10, 3) DEFAULT 0,
        gold_rate NUMERIC(12, 2) DEFAULT 0,
        making_charges NUMERIC(12, 2) DEFAULT 0,
        total_amount NUMERIC(12, 2) DEFAULT 0
      );
    `);

    // Check if initial sample receipt exists; if not, insert initial receipt # 41 matching the photo
    const check = await client.query('SELECT COUNT(*) FROM receipts');
    if (parseInt(check.rows[0].count) === 0) {
      const sample = await client.query(`
        INSERT INTO receipts (
          receipt_number, date, customer_name, customer_phone,
          gold_rate, gold_karat, total_amount, advance_amount, balance_due, notes
        ) VALUES (
          '41', CURRENT_DATE, 'محمد احمد', '0300-1234567',
          275000, '22K', 285000, 150000, 135000, 'گولڈ بالیاں اور انگوٹھی'
        ) RETURNING id;
      `);

      const receiptId = sample.rows[0].id;
      await client.query(`
        INSERT INTO receipt_items (
          receipt_id, description, karat, gross_weight, waste_stone_weight,
          net_weight, gold_rate, making_charges, total_amount
        ) VALUES 
        ($1, 'گولڈ انگوٹھی (Ring)', '22K', 6.200, 0.200, 6.000, 275000, 4500, 145800),
        ($1, 'گولڈ بالیاں (Earrings)', '22K', 5.800, 0.000, 5.800, 275000, 4000, 139200);
      `, [receiptId]);
    }

    await client.query('COMMIT');
    console.log('PostgreSQL schema initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing PostgreSQL schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase
};

