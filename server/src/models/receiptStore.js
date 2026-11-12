/**
 * In-Memory / File Storage for Receipts
 * (Can be easily hooked to MongoDB, Supabase, PostgreSQL, or SQLite)
 */

let receipts = [
  {
    id: 'RCP-1001',
    receiptNumber: '1001',
    date: new Date().toISOString().split('T')[0],
    customer: {
      name: 'Muhammad Ali',
      phone: '+92 300 1234567',
      address: 'Shop # 12, Gold Souk, Lahore',
      cnic: '35201-1234567-1'
    },
    items: [
      {
        id: '1',
        description: 'Gold Bridal Set (Necklace + Earrings)',
        karat: '22K',
        grossWeight: 45.5,
        wasteOrStoneWeight: 3.2,
        netWeight: 42.3,
        rateType: 'per_tola',
        goldRate: 275000,
        makingCharges: 18000,
        total: 1015124
      },
      {
        id: '2',
        description: 'Gold Bangle (Kangan)',
        karat: '21K',
        grossWeight: 24.0,
        wasteOrStoneWeight: 0.0,
        netWeight: 24.0,
        rateType: 'per_tola',
        goldRate: 262000,
        makingCharges: 8500,
        total: 547746
      }
    ],
    summary: {
      subtotal: 1562870,
      makingChargesTotal: 26500,
      discount: 5000,
      oldGoldExchanged: 150000,
      grandTotal: 1407870,
      paidAmount: 1000000,
      balanceDue: 407870,
      paymentMethod: 'Cash / Bank Transfer'
    },
    notes: 'Thank you for your business! Polishing free for 1 year.',
    createdAt: new Date().toISOString()
  }
];

const ReceiptStore = {
  getAll: () => receipts,
  getById: (id) => receipts.find((r) => r.id === id || r.receiptNumber === id),
  create: (receiptData) => {
    const newReceipt = {
      id: `RCP-${Date.now().toString().slice(-4)}`,
      receiptNumber: `${receipts.length + 1001}`,
      createdAt: new Date().toISOString(),
      ...receiptData
    };
    receipts.unshift(newReceipt);
    return newReceipt;
  },
  update: (id, updateData) => {
    const index = receipts.findIndex((r) => r.id === id || r.receiptNumber === id);
    if (index === -1) return null;
    receipts[index] = { ...receipts[index], ...updateData, updatedAt: new Date().toISOString() };
    return receipts[index];
  },
  delete: (id) => {
    const index = receipts.findIndex((r) => r.id === id || r.receiptNumber === id);
    if (index === -1) return false;
    receipts.splice(index, 1);
    return true;
  }
};

module.exports = ReceiptStore;

