const express = require('express');
const router = express.Router();
const creditNoteController = require('../controllers/customercreditNoteController');

// Get all credit notes
router.get('/', creditNoteController.getAllCreditNotes);

// Get credit note by ID
router.get('/:id', creditNoteController.getCreditNoteById);

// Create new credit note
router.post('/', creditNoteController.createCreditNote);

// Apply credit note to invoice
router.post('/:id/apply', creditNoteController.applyCreditNote);

// Update credit note
router.put('/:id', creditNoteController.updateCreditNote);

// Delete credit note
router.delete('/:id', creditNoteController.deleteCreditNote);

// Get credit notes by customer
router.get('/customer/:customerId', creditNoteController.getCreditNotesByCustomer);

// Get credit notes by status
router.get('/status/:status', creditNoteController.getCreditNotesByStatus);

// Get credit notes summary
router.get('/summary/overview', creditNoteController.getCreditNotesSummary);

// Search credit notes
router.get('/search/all', creditNoteController.searchCreditNotes);

// Cancel credit note
router.put('/:id/cancel', creditNoteController.cancelCreditNote);

// Get recent credit notes
router.get('/recent/all', creditNoteController.getRecentCreditNotes);

module.exports = router;