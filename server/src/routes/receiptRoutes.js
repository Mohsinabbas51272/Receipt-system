const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/sheetsController');

// Receipt endpoints
router.get('/', receiptController.getAllReceipts);
router.get('/calculate', receiptController.calculateQuickTotal);
router.get('/convert', receiptController.convertUnits);
router.get('/:id', receiptController.getReceiptById);
router.post('/', receiptController.createReceipt);
router.put('/:id', receiptController.updateReceipt);
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router;
