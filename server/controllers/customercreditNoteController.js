const CreditNote = require('../models/customerCreditNoteModel');
const Invoice = require('../models/invoiceModel');
const Customer = require('../models/customerModel');

// Generate credit note number
const generateCreditNoteNumber = async () => {
  const count = await CreditNote.countDocuments();
  const year = new Date().getFullYear().toString().slice(-2);
  return `CN-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

// Get all credit notes
exports.getAllCreditNotes = async (req, res) => {
  try {
    const creditNotes = await CreditNote.find()
      .populate('customerId', 'name email phone')
      .populate('invoiceId', 'invoiceNumber')
      .sort({ date: -1 });
    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get credit note by ID
exports.getCreditNoteById = async (req, res) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id)
      .populate('customerId')
      .populate('invoiceId');
    if (!creditNote) return res.status(404).json({ message: 'Credit note not found' });
    res.json(creditNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new credit note
exports.createCreditNote = async (req, res) => {
  try {
    const creditNoteNumber = await generateCreditNoteNumber();
    
    const creditNote = new CreditNote({
      ...req.body,
      creditNoteNumber
    });
    
    const savedCreditNote = await creditNote.save();
    
    // Update customer's due amount if credit note is issued
    if (req.body.status === 'issued' && req.body.customerId) {
      await Customer.findByIdAndUpdate(req.body.customerId, {
        $inc: { totalDueAmount: -req.body.totalAmount }
      });
    }
    
    res.status(201).json(savedCreditNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Apply credit note to invoice
exports.applyCreditNote = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const creditNote = await CreditNote.findById(req.params.id);
    
    if (!creditNote) return res.status(404).json({ message: 'Credit note not found' });
    if (creditNote.status !== 'issued') {
      return res.status(400).json({ message: 'Only issued credit notes can be applied' });
    }
    
    // Update invoice with credit note
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    invoice.creditNotes = invoice.creditNotes || [];
    invoice.creditNotes.push({
      creditNoteId: creditNote._id,
      amount: creditNote.totalAmount,
      date: new Date()
    });
    
    invoice.totalDue = Math.max(0, invoice.totalDue - creditNote.totalAmount);
    
    // Update credit note status
    creditNote.status = 'applied';
    creditNote.appliedToInvoice = invoiceId;
    creditNote.appliedDate = new Date();
    
    await Promise.all([invoice.save(), creditNote.save()]);
    
    res.json({ message: 'Credit note applied successfully', creditNote, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update credit note
exports.updateCreditNote = async (req, res) => {
  try {
    const creditNote = await CreditNote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(creditNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete credit note
exports.deleteCreditNote = async (req, res) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id);
    
    if (creditNote.status === 'applied') {
      return res.status(400).json({ message: 'Cannot delete applied credit note' });
    }
    
    // Revert customer due amount if credit note was issued
    if (creditNote.status === 'issued' && creditNote.customerId) {
      await Customer.findByIdAndUpdate(creditNote.customerId, {
        $inc: { totalDueAmount: creditNote.totalAmount }
      });
    }
    
    await creditNote.deleteOne();
    res.json({ message: 'Credit note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get credit notes by customer
exports.getCreditNotesByCustomer = async (req, res) => {
  try {
    const creditNotes = await CreditNote.find({ customerId: req.params.customerId })
      .sort({ date: -1 });
    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get credit notes by status
exports.getCreditNotesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['draft', 'issued', 'applied', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const creditNotes = await CreditNote.find({ status })
      .populate('customerId', 'name')
      .sort({ date: -1 });
    
    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get credit notes summary (for dashboard)
exports.getCreditNotesSummary = async (req, res) => {
  try {
    const [totalCount, issuedCount, appliedCount, totalAmount] = await Promise.all([
      CreditNote.countDocuments(),
      CreditNote.countDocuments({ status: 'issued' }),
      CreditNote.countDocuments({ status: 'applied' }),
      CreditNote.aggregate([
        { $match: { status: { $in: ['issued', 'applied'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      totalCount,
      issuedCount,
      appliedCount,
      draftCount: totalCount - issuedCount - appliedCount,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search credit notes
exports.searchCreditNotes = async (req, res) => {
  try {
    const { query, startDate, endDate, status } = req.query;
    
    let searchCriteria = {};
    
    // Text search
    if (query) {
      searchCriteria.$or = [
        { creditNoteNumber: { $regex: query, $options: 'i' } },
        { customerName: { $regex: query, $options: 'i' } },
        { 'customerId.name': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      searchCriteria.date = {};
      if (startDate) searchCriteria.date.$gte = new Date(startDate);
      if (endDate) searchCriteria.date.$lte = new Date(endDate);
    }
    
    // Status filter
    if (status && status !== 'all') {
      searchCriteria.status = status;
    }
    
    const creditNotes = await CreditNote.find(searchCriteria)
      .populate('customerId', 'name email phone')
      .sort({ date: -1 });
    
    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel credit note
exports.cancelCreditNote = async (req, res) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id);
    
    if (!creditNote) {
      return res.status(404).json({ message: 'Credit note not found' });
    }
    
    if (creditNote.status === 'applied') {
      return res.status(400).json({ message: 'Cannot cancel an applied credit note' });
    }
    
    if (creditNote.status === 'cancelled') {
      return res.status(400).json({ message: 'Credit note is already cancelled' });
    }
    
    // Revert customer due amount if credit note was issued
    if (creditNote.status === 'issued' && creditNote.customerId) {
      await Customer.findByIdAndUpdate(creditNote.customerId, {
        $inc: { totalDueAmount: creditNote.totalAmount }
      });
    }
    
    creditNote.status = 'cancelled';
    creditNote.cancelledAt = new Date();
    await creditNote.save();
    
    res.json({ message: 'Credit note cancelled successfully', creditNote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent credit notes
exports.getRecentCreditNotes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const creditNotes = await CreditNote.find()
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};