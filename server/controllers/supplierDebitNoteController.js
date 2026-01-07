const SupplierDebitNote = require('../models/SupplierDebitNoteModal');
const Supplier = require('../models/supplierModel');
const mongoose = require('mongoose');

// Get all debit notes
exports.getAllDebitNotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      status,
      supplierId,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (status && status !== 'all') query.status = status;
    if (supplierId) query.supplierId = supplierId;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [debitNotes, totalCount] = await Promise.all([
      SupplierDebitNote.find(query)
        .populate('supplierId', 'name company phone email gstin')
        .populate('invoiceId', 'invoiceNumber')
        .populate('items.productId', 'productName sku hsnCode')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SupplierDebitNote.countDocuments(query)
    ]);

    res.json({
      success: true,
      debitNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all debit notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debit notes'
    });
  }
};

// Get debit note by ID
exports.getDebitNoteById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid debit note ID format"
      });
    }

    const debitNote = await SupplierDebitNote.findById(req.params.id)
      .populate('supplierId')
      .populate('invoiceId')
      .populate('items.productId', 'productName sku hsnCode unit')
      .populate('createdBy', 'firstName lastName email');

    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: "Debit note not found"
      });
    }

    res.json({
      success: true,
      debitNote
    });
  } catch (error) {
    console.error('Get debit note by ID error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch debit note"
    });
  }
};

// Create new debit note
exports.createDebitNote = async (req, res) => {
  try {
    const debitNoteNumber = await SupplierDebitNote.generateDebitNoteNumber();
    
    // Get supplier details
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found"
      });
    }

    const debitNoteData = {
      ...req.body,
      debitNoteNumber,
      supplierName: supplier.supplierName || supplier.name || supplier.company,
      phone: req.body.phone || supplier.phone,
      email: req.body.email || supplier.email,
      address: req.body.address || supplier.address
    };

    const debitNote = new SupplierDebitNote(debitNoteData);
    const savedDebitNote = await debitNote.save();

    // Update supplier's payable amount if debit note is issued
    if (req.body.status === 'issued' && req.body.supplierId) {
      await Supplier.findByIdAndUpdate(req.body.supplierId, {
        $inc: { 
          totalPayable: req.body.totalAmount, // Increases payable amount
          creditBalance: req.body.totalAmount  // Credit balance increases
        },
        $push: {
          debitNotes: {
            debitNoteId: savedDebitNote._id,
            amount: req.body.totalAmount,
            date: new Date()
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Debit note created successfully",
      debitNote: savedDebitNote
    });
  } catch (error) {
    console.error('Create debit note error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate debit note number"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create debit note"
    });
  }
};

// Update debit note
exports.updateDebitNote = async (req, res) => {
  try {
    const debitNote = await SupplierDebitNote.findById(req.params.id);
    
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: "Debit note not found"
      });
    }

    // Check if debit note can be updated
    if (debitNote.status === 'settled') {
      return res.status(400).json({
        success: false,
        error: "Cannot update a settled debit note"
      });
    }

    // Calculate difference if total amount changed
    const oldAmount = debitNote.totalAmount;
    const newAmount = req.body.totalAmount || oldAmount;
    const amountDifference = newAmount - oldAmount;

    // If status is changing from issued to something else, adjust supplier balance
    if (req.body.status && req.body.status !== 'issued' && debitNote.status === 'issued') {
      await Supplier.findByIdAndUpdate(debitNote.supplierId, {
        $inc: { 
          totalPayable: -oldAmount,
          creditBalance: -oldAmount
        }
      });
    }

    // If status is changing to issued, adjust supplier balance
    if (req.body.status === 'issued' && debitNote.status !== 'issued') {
      await Supplier.findByIdAndUpdate(debitNote.supplierId, {
        $inc: { 
          totalPayable: newAmount,
          creditBalance: newAmount
        }
      });
    }

    // If amount changed and status is issued, adjust supplier balance
    if (amountDifference !== 0 && debitNote.status === 'issued') {
      await Supplier.findByIdAndUpdate(debitNote.supplierId, {
        $inc: { 
          totalPayable: amountDifference,
          creditBalance: amountDifference
        }
      });
    }

    const updatedDebitNote = await SupplierDebitNote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Debit note updated successfully",
      debitNote: updatedDebitNote
    });
  } catch (error) {
    console.error('Update debit note error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update debit note"
    });
  }
};

// Delete debit note
exports.deleteDebitNote = async (req, res) => {
  try {
    const debitNote = await SupplierDebitNote.findById(req.params.id);
    
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: "Debit note not found"
      });
    }

    if (debitNote.status === 'settled') {
      return res.status(400).json({
        success: false,
        error: "Cannot delete a settled debit note"
      });
    }

    // Revert supplier payable amount if debit note was issued
    if (debitNote.status === 'issued' && debitNote.supplierId) {
      await Supplier.findByIdAndUpdate(debitNote.supplierId, {
        $inc: { 
          totalPayable: -debitNote.totalAmount,
          creditBalance: -debitNote.totalAmount
        }
      });
    }

    await debitNote.deleteOne();
    
    res.json({
      success: true,
      message: 'Debit note deleted successfully'
    });
  } catch (error) {
    console.error('Delete debit note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete debit note'
    });
  }
};

// Get debit notes by supplier
exports.getDebitNotesBySupplier = async (req, res) => {
  try {
    const debitNotes = await SupplierDebitNote.find({ supplierId: req.params.supplierId })
      .populate('invoiceId', 'invoiceNumber date')
      .sort({ date: -1 });

    // Calculate summary
    const summary = {
      totalAmount: 0,
      issuedAmount: 0,
      settledAmount: 0,
      draftAmount: 0
    };

    debitNotes.forEach(dn => {
      summary.totalAmount += dn.totalAmount;
      if (dn.status === 'issued') summary.issuedAmount += dn.totalAmount;
      if (dn.status === 'settled') summary.settledAmount += dn.totalAmount;
      if (dn.status === 'draft') summary.draftAmount += dn.totalAmount;
    });

    res.json({
      success: true,
      debitNotes,
      summary
    });
  } catch (error) {
    console.error('Get debit notes by supplier error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debit notes'
    });
  }
};

// Get debit notes by status
exports.getDebitNotesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['draft', 'issued', 'settled', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const debitNotes = await SupplierDebitNote.find({ status })
      .populate('supplierId', 'name company')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      debitNotes
    });
  } catch (error) {
    console.error('Get debit notes by status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debit notes'
    });
  }
};

// Search debit notes
exports.searchDebitNotes = async (req, res) => {
  try {
    const { 
      query, 
      startDate, 
      endDate, 
      status,
      supplierId,
      reason,
      minAmount,
      maxAmount 
    } = req.query;
    
    let searchCriteria = {};
    
    // Text search
    if (query) {
      searchCriteria.$or = [
        { debitNoteNumber: { $regex: query, $options: 'i' } },
        { supplierName: { $regex: query, $options: 'i' } },
        { purchaseOrderNo: { $regex: query, $options: 'i' } },
        { grnNo: { $regex: query, $options: 'i' } }
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
    
    // Supplier filter
    if (supplierId) {
      searchCriteria.supplierId = supplierId;
    }
    
    // Reason filter
    if (reason && reason !== 'all') {
      searchCriteria.reason = reason;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      searchCriteria.totalAmount = {};
      if (minAmount) searchCriteria.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) searchCriteria.totalAmount.$lte = parseFloat(maxAmount);
    }
    
    const debitNotes = await SupplierDebitNote.find(searchCriteria)
      .populate('supplierId', 'name email phone company')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      debitNotes,
      count: debitNotes.length
    });
  } catch (error) {
    console.error('Search debit notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search debit notes'
    });
  }
};

// Cancel debit note
exports.cancelDebitNote = async (req, res) => {
  try {
    const debitNote = await SupplierDebitNote.findById(req.params.id);
    
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: 'Debit note not found'
      });
    }
    
    if (debitNote.status === 'settled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a settled debit note'
      });
    }
    
    if (debitNote.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Debit note is already cancelled'
      });
    }
    
    // Revert supplier payable amount if debit note was issued
    if (debitNote.status === 'issued' && debitNote.supplierId) {
      await Supplier.findByIdAndUpdate(debitNote.supplierId, {
        $inc: { 
          totalPayable: -debitNote.totalAmount,
          creditBalance: -debitNote.totalAmount
        }
      });
    }
    
    debitNote.status = 'cancelled';
    await debitNote.save();
    
    res.json({
      success: true,
      message: 'Debit note cancelled successfully',
      debitNote
    });
  } catch (error) {
    console.error('Cancel debit note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel debit note'
    });
  }
};

// Mark debit note as settled
exports.markAsSettled = async (req, res) => {
  try {
    const debitNote = await SupplierDebitNote.findById(req.params.id);
    
    if (!debitNote) {
      return res.status(404).json({
        success: false,
        error: 'Debit note not found'
      });
    }
    
    if (debitNote.status !== 'issued') {
      return res.status(400).json({
        success: false,
        error: 'Only issued debit notes can be marked as settled'
      });
    }
    
    // Update supplier's payable amount
    await Supplier.findByIdAndUpdate(debitNote.supplierId, {
      $inc: { 
        totalPayable: -debitNote.totalAmount,
        creditBalance: -debitNote.totalAmount
      }
    });
    
    debitNote.status = 'settled';
    debitNote.settledDate = new Date();
    await debitNote.save();
    
    res.json({
      success: true,
      message: 'Debit note marked as settled successfully',
      debitNote
    });
  } catch (error) {
    console.error('Mark as settled error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark debit note as settled'
    });
  }
};

// Get recent debit notes
exports.getRecentDebitNotes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const debitNotes = await SupplierDebitNote.find()
      .populate('supplierId', 'name company')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      debitNotes
    });
  } catch (error) {
    console.error('Get recent debit notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent debit notes'
    });
  }
};

// Get debit notes summary
exports.getDebitNotesSummary = async (req, res) => {
  try {
    const { startDate, endDate, supplierId } = req.query;
    
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    if (supplierId) {
      matchStage.supplierId = new mongoose.Types.ObjectId(supplierId);
    }

    const summary = await SupplierDebitNote.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalStats = {
      totalCount: summary.reduce((sum, item) => sum + item.count, 0),
      totalAmount: summary.reduce((sum, item) => sum + item.totalAmount, 0),
      byStatus: summary.reduce((acc, item) => {
        acc[item._id] = { count: item.count, amount: item.totalAmount };
        return acc;
      }, {})
    };

    res.json({
      success: true,
      summary: totalStats
    });
  } catch (error) {
    console.error('Get debit notes summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debit notes summary'
    });
  }
};

// Get debit notes by purchase order
exports.getDebitNotesByPurchaseOrder = async (req, res) => {
  try {
    const debitNotes = await SupplierDebitNote.find({ 
      purchaseOrderNo: req.params.poNumber 
    })
    .populate('supplierId', 'name company')
    .sort({ date: -1 });

    res.json({
      success: true,
      debitNotes
    });
  } catch (error) {
    console.error('Get debit notes by purchase order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debit notes'
    });
  }
};