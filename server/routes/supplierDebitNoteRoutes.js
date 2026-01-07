const express = require("express");
const router = express.Router();
const debitNoteController = require("../controllers/supplierDebitNoteController");

// Get all debit notes
router.get("/", debitNoteController.getAllDebitNotes);

// Get debit note by ID
router.get("/:id", debitNoteController.getDebitNoteById);

// Create new debit note
router.post("/", debitNoteController.createDebitNote);

// Update debit note
router.put("/:id", debitNoteController.updateDebitNote);

// Delete debit note
router.delete("/:id", debitNoteController.deleteDebitNote);

// Get debit notes by supplier
router.get(
  "/supplier/:supplierId",
  debitNoteController.getDebitNotesBySupplier
);

// Get debit notes by status
router.get("/status/:status", debitNoteController.getDebitNotesByStatus);

// Get debit notes summary
router.get("/summary/overview", debitNoteController.getDebitNotesSummary);

// Search debit notes
router.get("/search/all", debitNoteController.searchDebitNotes);

// Cancel debit note
router.put("/:id/cancel", debitNoteController.cancelDebitNote);

// Mark as settled
router.put("/:id/settle", debitNoteController.markAsSettled);

// Get recent debit notes
router.get("/recent/all", debitNoteController.getRecentDebitNotes);

// Get debit notes by purchase order
router.get(
  "/purchase-order/:poNumber",
  debitNoteController.getDebitNotesByPurchaseOrder
);

module.exports = router;
