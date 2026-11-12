# 🪙 ایم اقبال جیولرز - Gold & Jewellery Receipt Management System
### (M Iqbal Jewellers - Receipt System)

A full-stack, single-repository receipt system tailored specifically to match the **M Iqbal Jewellers (ایم اقبال جیولرز)** receipt pad, powered by **React (JavaScript)**, **Node.js (Express)**, and **PostgreSQL (LocalDB)**.

---

## 📸 Client Receipt Matching Details

Based on your uploaded receipt pad:
- **Header Banner**: 
  - Rich Maroon & Gold styling with jewellery artwork.
  - Title: **دلکش زیورات کا مرکز - ایم اقبال جیولرز**
  - Contact 1: `ظفر اقبال راجپوت زرگر 0301-6345657` (WhatsApp)
  - Contact 2: `احمد اقبال راجپوت زرگر 0302-6343557` (WhatsApp)
- **Metadata Fields**:
  - `نام` (Customer Name)
  - `تاریخ` (Date)
  - `پرچی نمبر` (Serial No e.g. 41)
  - `رابطہ نمبر` (Contact Number)
  - `سونا ریٹ` (Gold Rate per tola)
  - `کیریٹ سونا` (Gold Karat: 24K, 22K, 21K, 18K)
- **Ruled Body**:
  - Authentic ruled pad lines with faint **MI / M IQBAL JEWELLERS** watermark logo.
  - Supports both **Client Pad View** and **Detailed Table View**.
- **Totals**:
  - `ٹوٹل` (Total Amount)
  - `ایڈوانس` (Advance Paid)
  - `بقایا` (Baqaya / Balance Due)
  - `دستخط` (Signature line)
- **Footer**:
  - `نزد جامع مسجد فیضان مدینہ، مین بازار کنجاہ سگھرال`

---

## 🗄️ PostgreSQL Database Setup

The backend connects directly to your local PostgreSQL database:
- **Database Name**: `gold_receipt_db`
- **Connection URL**: `postgresql://mohsinabbas@127.0.0.1:5432/gold_receipt_db` (configured in `server/.env`)
- Tables (`receipts` & `receipt_items`) are automatically created on first launch with sample data!

---

## ⚡ Quick Start (One Command)

Simply run:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000/api/receipts](http://localhost:5000/api/receipts)

---

## ☁️ Vercel Deployment

1. Push to GitHub.
2. Link the repository on [Vercel](https://vercel.com).
3. Set your production `DATABASE_URL` (e.g. Neon, Supabase, or AWS RDS Postgres) in Vercel Environment Variables.
4. Deploy! `vercel.json` and `api/index.js` handle the routing automatically.
