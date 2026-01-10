const Invoice = require("../models/CustomerInvoiceModel");
const Customer = require("../models/customerModel");
const Product = require("../models/productModels");
const cloudinary = require("../utils/cloudinary/cloudinary");
const mongoose = require("mongoose");
const {
  updateCustomerDueAmount,
} = require("../controllers/customerController");
const CompanyBank = require("../models/settings/companyBankModel");

// Helper: Generate unique invoice number - MATCHING FRONTEND FORMAT
const generateInvoiceNo = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Count invoices with same prefix (INV + YYYY + MM)
  const prefix = `INV${year}${month}`;
  const count = await Invoice.countDocuments({
    invoiceNo: { $regex: `^${prefix}` },
  });

  // Generate 3-digit sequence
  const sequence = String(count + 1).padStart(3, "0");
  return `${prefix}${sequence}`;
};

// Helper: Parse FormData nested objects
const parseFormDataNested = (body) => {
  const parsed = { ...body };

  // Parse additionalDiscount
  if (
    body["additionalDiscount[pct]"] !== undefined ||
    body["additionalDiscount[amt]"] !== undefined
  ) {
    parsed.additionalDiscount = {
      pct: parseFloat(body["additionalDiscount[pct]"]) || 0,
      amt: parseFloat(body["additionalDiscount[amt]"]) || 0,
    };
  }

  // Parse additionalChargesDetails
  parsed.additionalChargesDetails = {
    shipping: parseFloat(body["additionalChargesDetails[shipping]"]) || 0,
    handling: parseFloat(body["additionalChargesDetails[handling]"]) || 0,
    packing: parseFloat(body["additionalChargesDetails[packing]"]) || 0,
    service: parseFloat(body["additionalChargesDetails[service]"]) || 0,
    other: parseFloat(body["additionalChargesDetails[other]"]) || 0,
  };

  // Parse items array from FormData bracket notation
  const items = [];
  const itemRegex = /items\[(\d+)\]\[(\w+)\]/;

  Object.keys(body).forEach((key) => {
    const match = key.match(itemRegex);
    if (match) {
      const index = parseInt(match[1]);
      const field = match[2];

      if (!items[index]) {
        items[index] = {};
      }

      // Parse numeric fields
      const numericFields = [
        "qty",
        "unitPrice",
        "taxRate",
        "taxAmount",
        "discountPct",
        "discountAmt",
        "amount",
      ];
      if (numericFields.includes(field)) {
        items[index][field] = parseFloat(body[key]) || 0;
      } else {
        items[index][field] = body[key];
      }
    }
  });

  if (items.length > 0) {
    parsed.items = items.filter((item) => item !== undefined);
  }

  return parsed;
};

// Create invoice with file uploads - NO TRANSACTION VERSION
exports.createInvoice = async (req, res) => {
  try {
    // Parse FormData first
    const parsedBody = parseFormDataNested(req.body);

    // Debug log to see what's being received
    console.log("Parsed FormData:", JSON.stringify(parsedBody, null, 2));

    // Extract fields from parsed body
    let {
      customerId,
      invoiceDate,
      dueDate,
      items = [],
      billingAddress,
      shippingAddress,
      subtotal,
      totalTax,
      totalDiscount,
      additionalDiscount = { pct: 0, amt: 0 },
      additionalCharges,
      additionalChargesDetails = {
        shipping: 0,
        handling: 0,
        packing: 0,
        service: 0,
        other: 0,
      },
      shoppingPointsUsed = 0,
      pointValue = 10,
      autoRoundOff = false,
      grandTotal,
      paidAmount = 0,
      fullyReceived = false,
      paymentMethod = "cash",
      notes = "",
      termsAndConditions = "",
    } = parsedBody;

    // Convert string booleans and numbers
    autoRoundOff = autoRoundOff === true || autoRoundOff === "true";
    fullyReceived = fullyReceived === true || fullyReceived === "true";
    paidAmount = parseFloat(paidAmount) || 0;
    shoppingPointsUsed = parseFloat(shoppingPointsUsed) || 0;
    subtotal = parseFloat(subtotal) || 0;
    totalTax = parseFloat(totalTax) || 0;
    totalDiscount = parseFloat(totalDiscount) || 0;
    grandTotal = parseFloat(grandTotal) || 0;
    additionalCharges = parseFloat(additionalCharges) || 0;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "Customer ID is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one item is required",
      });
    }

    // Validate customer exists
    const customer = await Customer.findById(customerId); // NO SESSION
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    // Validate shopping points
    if (shoppingPointsUsed > 0) {
      const availablePoints = customer.availablePoints || 0;
      if (shoppingPointsUsed > availablePoints) {
        return res.status(400).json({
          success: false,
          error: `Insufficient shopping points. Available: ${availablePoints}`,
        });
      }
    }

    // Validate products
    const validatedItems = [];
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          error: "Product ID is required for all items",
        });
      }

      const product = await Product.findById(item.productId); // NO SESSION
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`,
        });
      }

      // Use item data from frontend (already calculated)
      const validatedItem = {
        productId: item.productId,
        itemName: item.itemName || product.productName,
        hsnCode: item.hsnCode || product.hsnCode || "",
        qty: parseFloat(item.qty) || 1,
        unit: item.unit || product.unit || "Piece",
        unitPrice: parseFloat(item.unitPrice) || product.sellingPrice || 0,
        taxType: item.taxType || product.tax || "GST 0%",
        taxRate:
          parseFloat(item.taxRate) ||
          parseFloat(product.tax?.match(/\d+/)?.[0]) ||
          0,
        taxAmount: parseFloat(item.taxAmount) || 0,
        discountPct: parseFloat(item.discountPct) || 0,
        discountAmt: parseFloat(item.discountAmt) || 0,
        amount: parseFloat(item.amount) || 0,
      };

      validatedItems.push(validatedItem);
    }

    // Calculate points redeemed amount
    const pointsRedeemedAmount = shoppingPointsUsed * pointValue;

    // Generate invoice number (matching frontend format)
    const invoiceNo = await generateInvoiceNo();

    // Handle file uploads if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "invoice_attachments",
            resource_type: "auto",
          });

          attachments.push({
            url: result.secure_url,
            public_id: result.public_id,
            filename: file.originalname,
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }
    }

    // Calculate payment amounts (frontend logic)
    const finalPaidAmount = fullyReceived ? grandTotal : paidAmount;
    const dueAmount = Math.max(0, grandTotal - finalPaidAmount);
    const advanceAmount = Math.max(0, finalPaidAmount - grandTotal);

    // Determine status (frontend logic)
    let finalStatus = "draft";
    if (fullyReceived || finalPaidAmount >= grandTotal) {
      finalStatus = "paid";
    } else if (finalPaidAmount > 0) {
      finalStatus = "partial";
    }

    // Fetch default company bank (snapshot)
    const defaultBank = await CompanyBank.findOne({ isDefault: true });

    if (!defaultBank) {
      return res.status(400).json({
        success: false,
        error:
          "No default company bank account found. Please set a default bank.",
      });
    }
    // Create invoice - USING VALUES FROM FRONTEND
    const invoice = new Invoice({
      customerId,
      invoiceNo,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: dueDate
        ? new Date(dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      bankDetails: {
        bankName: defaultBank.bankName,
        accountHolderName: defaultBank.accountHolderName,
        accountNumber: defaultBank.accountNumber,
        ifsc: defaultBank.ifsc,
        branch: defaultBank.branch,
        upiId: defaultBank.upiId,
        qrCode: defaultBank.qrCode,
      },
      items: validatedItems,
      billingAddress: billingAddress || customer.address || "",
      shippingAddress:
        shippingAddress || billingAddress || customer.address || "",
      subtotal: subtotal,
      totalTax: totalTax,
      totalDiscount: totalDiscount,
      additionalDiscount: additionalDiscount,
      additionalCharges: additionalCharges,
      additionalChargesDetails: additionalChargesDetails,
      shoppingPointsUsed: shoppingPointsUsed,
      pointValue: pointValue,
      autoRoundOff: autoRoundOff,
      grandTotal: grandTotal,
      paidAmount: finalPaidAmount,
      dueAmount: dueAmount,
      advanceAmount: advanceAmount,
      fullyReceived: fullyReceived,
      paymentMethod: paymentMethod,
      status: finalStatus,
      notes: notes,
      termsAndConditions: termsAndConditions,
      attachments: attachments,
      createdBy: req.user?._id,
    });

    // Calculate round off value if needed
    if (autoRoundOff) {
      // Recalculate to get round off value
      const itemsDiscount = validatedItems.reduce(
        (sum, item) => sum + (item.discountAmt || 0),
        0
      );
      const additionalDiscountValue =
        additionalDiscount.amt +
        (subtotal * (additionalDiscount.pct || 0)) / 100;
      const totalDiscountCalc = itemsDiscount + additionalDiscountValue;

      const totalBeforeRound =
        subtotal +
        totalTax +
        additionalCharges -
        totalDiscountCalc -
        pointsRedeemedAmount;

      invoice.roundOffValue = Math.round(totalBeforeRound) - totalBeforeRound;
    }

    // Save invoice - NO SESSION
    await invoice.save();

    // Calculate points earned (1 point per ₹10 spent)
    const POINTS_RATE = 10;
    const pointsEarned =
      finalPaidAmount > 0 ? Math.floor(finalPaidAmount / POINTS_RATE) : 0;

    // Update customer points and purchase history - NO SESSION
    await Customer.findByIdAndUpdate(customerId, {
      $inc: {
        availablePoints: pointsEarned - shoppingPointsUsed,
        totalPointsEarned: pointsEarned,
        totalPointsRedeemed: shoppingPointsUsed,
        totalPurchases: 1,
        totalPurchaseAmount: grandTotal,
      },
      $set: {
        lastPurchaseDate: new Date(),
        lastPointsEarnedDate:
          pointsEarned > 0 ? new Date() : customer.lastPointsEarnedDate,
        lastPointsRedeemedDate:
          shoppingPointsUsed > 0 ? new Date() : customer.lastPointsRedeemedDate,
      },
    });

    // Update customer due amount
    await updateCustomerDueAmount(customerId);

    // Update product stock quantities
    for (const item of validatedItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: -item.qty },
        });
      }
    }

    // Populate and return response
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customerId", "name phone availablePoints")
      .populate("items.productId", "productName hsnCode");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: populatedInvoice,
      points: {
        earned: pointsEarned,
        redeemed: shoppingPointsUsed,
        net: pointsEarned - shoppingPointsUsed,
      },
    });
  } catch (err) {
    console.error("Invoice creation error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Invoice number already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Get all invoices with filters
exports.getAllInvoices = async (req, res) => {
  try {
    const {
      customerId,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Validate customerId
    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid customer ID format",
        });
      }
      filter.customerId = customerId;
    }

    // Validate status (only if provided)
    if (status) {
      const allowedStatuses = [
        "draft",
        "sent",
        "paid",
        "partial",
        "cancelled",
        "overdue",
      ];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${allowedStatuses.join(
            ", "
          )}`,
        });
      }
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid start date format",
          });
        }
        filter.invoiceDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid end date format",
          });
        }
        filter.invoiceDate.$lte = end;
      }
    }

    // Parse pagination parameters safely
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = Invoice.find(filter)
      .populate("customerId", "name phone email")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Handle search
    if (search) {
      query = Invoice.find({
        ...filter,
        invoiceNo: { $regex: search, $options: "i" },
      })
        .populate("customerId", "name phone email")
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    }

    const invoices = await query;
    const total = await Invoice.countDocuments(filter);

    // Format response
    const response = {
      success: true,
      count: invoices.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
      invoices,
    };

    // If no invoices found but search was used
    if (search && invoices.length === 0) {
      response.message = "No invoices found matching your search";
    }

    res.json(response);
  } catch (err) {
    console.error("Get invoices error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const identifier = req.params.id;
    let invoice;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      invoice = await Invoice.findById(identifier)
        .populate(
          "customerId",
          "name phone email address city state country pincode gstin"
        )
        .populate("createdBy", "firstName lastName email")
        .populate(
          "items.productId",
          "productName hsnCode sku barcode unit sellingPrice tax"
        );
    } else {
      invoice = await Invoice.findOne({ invoiceNo: identifier })
        .populate(
          "customerId",
          "name phone email address city state country pincode gstin"
        )
        .populate("createdBy", "firstName lastName email")
        .populate(
          "items.productId",
          "productName hsnCode sku barcode unit sellingPrice tax"
        );
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
        message: `No invoice found with identifier: ${identifier}`,
      });
    }

    // Calculate any missing totals (backward compatibility)
    if (!invoice.subtotal || !invoice.totalTax || !invoice.grandTotal) {
      invoice.calculateTotals();
      await invoice.save();
    }

    res.json({
      success: true,
      invoice,
      formatted: {
        invoiceDate: invoice.formattedDate,
        dueDate: invoice.formattedDueDate,
      },
    });
  } catch (err) {
    console.error("Get invoice error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid invoice ID",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Update invoice - NO TRANSACTION VERSION
exports.updateInvoice = async (req, res) => {
  try {
    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invoice ID format",
      });
    }

    const invoice = await Invoice.findById(req.params.id); // NO SESSION
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Parse FormData if exists
    let updateData = req.body;
    if (
      Object.keys(req.body).some(
        (key) => key.includes("[") && key.includes("]")
      )
    ) {
      updateData = parseFormDataNested(req.body);
    }

    // Store old values for adjustments
    const oldPointsUsed = invoice.shoppingPointsUsed;
    const oldPaidAmount = invoice.paidAmount;
    const oldStatus = invoice.status;
    const oldGrandTotal = invoice.grandTotal;

    // Update fields with validation
    const updatableFields = [
      "items",
      "billingAddress",
      "shippingAddress",
      "additionalDiscount",
      "additionalCharges",
      "additionalChargesDetails",
      "shoppingPointsUsed",
      "autoRoundOff",
      "paidAmount",
      "fullyReceived",
      "paymentMethod",
      "notes",
      "termsAndConditions",
      "status",
      "dueDate",
    ];

    updatableFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        // Convert string booleans
        if (field === "autoRoundOff" || field === "fullyReceived") {
          invoice[field] =
            updateData[field] === true || updateData[field] === "true";
        }
        // Convert numbers
        else if (["shoppingPointsUsed", "paidAmount"].includes(field)) {
          invoice[field] = parseFloat(updateData[field]) || 0;
        }
        // Parse additionalDiscount if it's a string
        else if (
          field === "additionalDiscount" &&
          typeof updateData[field] === "string"
        ) {
          try {
            invoice[field] = JSON.parse(updateData[field]);
          } catch {
            invoice[field] = { pct: 0, amt: 0 };
          }
        } else {
          invoice[field] = updateData[field];
        }
      }
    });

    // Handle shopping points adjustment
    if (updateData.shoppingPointsUsed !== undefined) {
      const newPointsUsed = parseFloat(updateData.shoppingPointsUsed) || 0;

      if (newPointsUsed !== oldPointsUsed) {
        const customer = await Customer.findById(invoice.customerId); // NO SESSION
        if (customer) {
          // Calculate point difference
          const pointsDiff = newPointsUsed - oldPointsUsed;

          // Check if customer has enough points for increase
          if (pointsDiff > 0 && (customer.availablePoints || 0) < pointsDiff) {
            return res.status(400).json({
              success: false,
              error: `Customer doesn't have enough points. Available: ${
                customer.availablePoints || 0
              }`,
            });
          }

          // Update customer points
          customer.availablePoints =
            (customer.availablePoints || 0) - pointsDiff;
          customer.usedPoints = (customer.usedPoints || 0) + pointsDiff;
          await customer.save(); // NO SESSION
        }
      }
    }

    // Recalculate totals
    invoice.calculateTotals();

    // Handle status update based on payment changes
    if (
      updateData.paidAmount !== undefined ||
      updateData.fullyReceived !== undefined
    ) {
      const newPaidAmount = invoice.paidAmount || 0;
      const newFullyReceived = invoice.fullyReceived || false;

      if (newFullyReceived || newPaidAmount >= invoice.grandTotal) {
        invoice.status = "paid";
      } else if (newPaidAmount > 0) {
        invoice.status = "partial";
      } else {
        invoice.status = "draft";
      }
    }

    // Handle file uploads if new files added
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "invoice_attachments",
          });

          invoice.attachments.push({
            url: result.secure_url,
            public_id: result.public_id,
            filename: file.originalname,
            uploadedAt: new Date(),
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
        }
      }
    }

    // Save updated invoice
    invoice.updatedAt = new Date();
    await invoice.save(); // NO SESSION
    await updateCustomerDueAmount(invoice.customerId);

    // Update customer points earned if status changed to paid/partial
    if (
      invoice.status !== oldStatus &&
      (invoice.status === "paid" || invoice.status === "partial")
    ) {
      const customer = await Customer.findById(invoice.customerId); // NO SESSION
      if (customer) {
        // Calculate points earned from payment
        const POINTS_RATE = 10;
        const pointsEarned =
          invoice.paidAmount > 0
            ? Math.floor(invoice.paidAmount / POINTS_RATE)
            : 0;

        // Update customer earned points
        customer.totalPointsEarned =
          (customer.totalPointsEarned || 0) + pointsEarned;
        customer.availablePoints =
          (customer.availablePoints || 0) + pointsEarned;
        customer.lastPointsEarnedDate = new Date();
        await customer.save(); // NO SESSION
      }
    }

    // Populate for response
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customerId", "name phone email")
      .populate("createdBy", "firstName lastName")
      .populate("items.productId", "productName hsnCode");

    res.json({
      success: true,
      message: "Invoice updated successfully",
      invoice: populatedInvoice,
      changes: {
        pointsUsed: oldPointsUsed !== invoice.shoppingPointsUsed,
        paidAmount: oldPaidAmount !== invoice.paidAmount,
        status: oldStatus !== invoice.status,
      },
    });
  } catch (err) {
    console.error("Update invoice error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Invoice number conflict",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update invoice",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Delete invoice - NO TRANSACTION VERSION
exports.deleteInvoice = async (req, res) => {
  try {
    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invoice ID format",
      });
    }

    const invoice = await Invoice.findById(req.params.id); // NO SESSION
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Store invoice data for cleanup
    const customerId = invoice.customerId;
    const shoppingPointsUsed = invoice.shoppingPointsUsed || 0;
    const paidAmount = invoice.paidAmount || 0;
    const items = invoice.items || [];

    // Return shopping points to customer
    if (shoppingPointsUsed > 0) {
      const customer = await Customer.findById(customerId); // NO SESSION
      if (customer) {
        customer.availablePoints =
          (customer.availablePoints || 0) + shoppingPointsUsed;
        customer.usedPoints = Math.max(
          0,
          (customer.usedPoints || 0) - shoppingPointsUsed
        );
        await customer.save(); // NO SESSION
      }
    }

    // Deduct earned points from customer (if invoice was paid/partial)
    if (
      paidAmount > 0 &&
      (invoice.status === "paid" || invoice.status === "partial")
    ) {
      const customer = await Customer.findById(customerId); // NO SESSION
      if (customer) {
        const POINTS_RATE = 10;
        const pointsEarned = Math.floor(paidAmount / POINTS_RATE);

        customer.availablePoints = Math.max(
          0,
          (customer.availablePoints || 0) - pointsEarned
        );
        customer.totalPointsEarned = Math.max(
          0,
          (customer.totalPointsEarned || 0) - pointsEarned
        );
        await customer.save(); // NO SESSION
      }
    }

    // Restore product stock if needed
    for (const item of items) {
      if (item.productId) {
        const product = await Product.findById(item.productId); // NO SESSION
        if (
          product &&
          product.stockQuantity !== undefined &&
          product.stockQuantity !== null
        ) {
          product.stockQuantity += item.qty || 0;
          await product.save(); // NO SESSION
        }
      }
    }

    // Update customer purchase history
    const customer = await Customer.findById(customerId); // NO SESSION
    if (customer) {
      customer.totalPurchases = Math.max(0, (customer.totalPurchases || 0) - 1);
      customer.totalPurchaseAmount = Math.max(
        0,
        (customer.totalPurchaseAmount || 0) - (invoice.grandTotal || 0)
      );

      // Recalculate average order value
      if (customer.totalPurchases > 0) {
        customer.averageOrderValue =
          customer.totalPurchaseAmount / customer.totalPurchases;
      } else {
        customer.averageOrderValue = 0;
      }

      await customer.save(); // NO SESSION
    }

    // Delete attachments from Cloudinary
    if (invoice.attachments && invoice.attachments.length > 0) {
      const deletePromises = invoice.attachments
        .filter((attachment) => attachment.public_id)
        .map((attachment) =>
          cloudinary.uploader.destroy(attachment.public_id).catch((err) => {
            console.error(
              `Failed to delete Cloudinary file ${attachment.public_id}:`,
              err.message
            );
            // Continue even if deletion fails
          })
        );

      await Promise.allSettled(deletePromises);
    }

    // Delete the invoice
    await Invoice.findByIdAndDelete(req.params.id); // NO SESSION
    await updateCustomerDueAmount(customerId);

    res.json({
      success: true,
      message: "Invoice deleted successfully",
      deleted: {
        invoiceId: req.params.id,
        invoiceNo: invoice.invoiceNo,
        pointsReturned: shoppingPointsUsed,
        stockRestored: items.length,
        attachmentsDeleted: invoice.attachments?.length || 0,
      },
    });
  } catch (err) {
    console.error("Delete invoice error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to delete invoice",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Add payment to invoice - NO TRANSACTION VERSION
exports.addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    // Validate input
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid payment amount greater than 0 is required",
      });
    }

    const paymentAmount = parseFloat(amount);

    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invoice ID format",
      });
    }

    const invoice = await Invoice.findById(req.params.id); // NO SESSION
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Check if invoice is already fully paid
    if (invoice.status === "paid" && invoice.dueAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invoice is already fully paid",
        dueAmount: invoice.dueAmount,
        paidAmount: invoice.paidAmount,
      });
    }

    // Check if payment exceeds due amount
    const remainingDue = invoice.grandTotal - invoice.paidAmount;
    if (paymentAmount > remainingDue) {
      return res.status(400).json({
        success: false,
        error: `Payment amount exceeds due amount. Due: ₹${remainingDue.toFixed(
          2
        )}`,
        dueAmount: remainingDue,
        maxPayment: remainingDue,
      });
    }

    // Store old values for comparison
    const oldPaidAmount = invoice.paidAmount;
    const oldStatus = invoice.status;
    const oldDueAmount = invoice.dueAmount;

    // Update invoice payment
    invoice.paidAmount += paymentAmount;
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;

    // Add payment note if provided
    if (notes) {
      invoice.notes = invoice.notes
        ? `${invoice.notes}\nPayment: ${notes}`
        : `Payment: ${notes}`;
    }

    // Recalculate totals and status
    invoice.calculateTotals();

    // Add payment record to payment history
    if (!invoice.paymentHistory) {
      invoice.paymentHistory = [];
    }

    invoice.paymentHistory.push({
      date: new Date(),
      amount: paymentAmount,
      method: paymentMethod || invoice.paymentMethod,
      reference: referenceNumber || "",
      notes: notes || "",
      addedBy: req.user?._id,
    });

    await invoice.save(); // NO SESSION
    await updateCustomerDueAmount(invoice.customerId);

    // Calculate points earned from this payment (1 point per ₹10)
    const POINTS_RATE = 10;
    const pointsEarned = Math.floor(paymentAmount / POINTS_RATE);

    // Update customer points if points were earned
    if (pointsEarned > 0) {
      const customer = await Customer.findById(invoice.customerId); // NO SESSION
      if (customer) {
        customer.availablePoints =
          (customer.availablePoints || 0) + pointsEarned;
        customer.totalPointsEarned =
          (customer.totalPointsEarned || 0) + pointsEarned;
        customer.lastPointsEarnedDate = new Date();

        // Update payment history
        if (!customer.paymentHistory) {
          customer.paymentHistory = [];
        }

        customer.paymentHistory.push({
          date: new Date(),
          invoiceId: invoice._id,
          invoiceNo: invoice.invoiceNo,
          amount: paymentAmount,
          pointsEarned: pointsEarned,
        });

        await customer.save(); // NO SESSION
      }
    }

    // Populate for response
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("customerId", "name phone")
      .populate("createdBy", "firstName lastName");

    res.json({
      success: true,
      message: "Payment added successfully",
      invoice: populatedInvoice,
      payment: {
        amount: paymentAmount,
        pointsEarned: pointsEarned,
        previousPaid: oldPaidAmount,
        newPaid: invoice.paidAmount,
        previousDue: oldDueAmount,
        newDue: invoice.dueAmount,
        statusChanged: oldStatus !== invoice.status,
        newStatus: invoice.status,
      },
    });
  } catch (err) {
    console.error("Add payment error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to add payment",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get invoice statistics
exports.getInvoiceStats = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      customerId,
      status,
      period = "all",
    } = req.query;

    // Build match stage
    const matchStage = {};

    // Filter by customer
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      matchStage.customerId = new mongoose.Types.ObjectId(customerId);
    }

    // Filter by status
    if (status) {
      const allowedStatuses = [
        "draft",
        "sent",
        "paid",
        "partial",
        "cancelled",
        "overdue",
      ];
      if (allowedStatuses.includes(status)) {
        matchStage.status = status;
      }
    }

    // Handle date range
    if (startDate || endDate || period !== "all") {
      matchStage.invoiceDate = {};

      // Validate and set start date
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid start date format",
          });
        }
        matchStage.invoiceDate.$gte = start;
      } else if (period !== "all") {
        // Set default start based on period
        const now = new Date();
        if (period === "today") {
          matchStage.invoiceDate.$gte = new Date(now.setHours(0, 0, 0, 0));
        } else if (period === "week") {
          matchStage.invoiceDate.$gte = new Date(
            now.setDate(now.getDate() - 7)
          );
        } else if (period === "month") {
          matchStage.invoiceDate.$gte = new Date(
            now.setMonth(now.getMonth() - 1)
          );
        } else if (period === "year") {
          matchStage.invoiceDate.$gte = new Date(
            now.setFullYear(now.getFullYear() - 1)
          );
        }
      }

      // Validate and set end date
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid end date format",
          });
        }
        matchStage.invoiceDate.$lte = end;
      }
    }

    // Main stats aggregation
    const statsPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
          totalTax: { $sum: "$totalTax" },
          totalDiscount: { $sum: "$totalDiscount" },
          totalAdditionalCharges: { $sum: "$additionalCharges" },
          totalPointsUsed: { $sum: "$shoppingPointsUsed" },
          totalPointsValue: {
            $sum: { $multiply: ["$shoppingPointsUsed", "$pointValue"] },
          },
          avgInvoiceValue: { $avg: "$grandTotal" },
          maxInvoiceValue: { $max: "$grandTotal" },
          minInvoiceValue: { $min: "$grandTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          totalInvoices: 1,
          totalAmount: { $round: ["$totalAmount", 2] },
          totalPaid: { $round: ["$totalPaid", 2] },
          totalDue: { $round: ["$totalDue", 2] },
          totalTax: { $round: ["$totalTax", 2] },
          totalDiscount: { $round: ["$totalDiscount", 2] },
          totalAdditionalCharges: { $round: ["$totalAdditionalCharges", 2] },
          totalPointsUsed: 1,
          totalPointsValue: { $round: ["$totalPointsValue", 2] },
          avgInvoiceValue: { $round: ["$avgInvoiceValue", 2] },
          maxInvoiceValue: { $round: ["$maxInvoiceValue", 2] },
          minInvoiceValue: { $round: ["$minInvoiceValue", 2] },
          paymentEfficiency: {
            $cond: {
              if: { $gt: ["$totalAmount", 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$totalPaid", "$totalAmount"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ];

    const stats = await Invoice.aggregate(statsPipeline);

    // Status-wise counts
    const statusCounts = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          status: "$_id",
          count: 1,
          totalAmount: { $round: ["$totalAmount", 2] },
          _id: 0,
        },
      },
    ]);

    // Monthly breakdown (last 12 months)
    const monthlyBreakdown = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $toString: {
                  $cond: {
                    if: { $lt: ["$_id.month", 10] },
                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                    else: { $toString: "$_id.month" },
                  },
                },
              },
            ],
          },
          count: 1,
          totalAmount: { $round: ["$totalAmount", 2] },
          totalPaid: { $round: ["$totalPaid", 2] },
        },
      },
    ]);

    // Top customers by invoice count
    const topCustomers = await Invoice.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $group: {
          _id: "$customerId",
          customerName: { $first: "$customer.name" },
          invoiceCount: { $sum: 1 },
          totalSpent: { $sum: "$grandTotal" },
          avgInvoiceValue: { $avg: "$grandTotal" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          customerName: 1,
          invoiceCount: 1,
          totalSpent: { $round: ["$totalSpent", 2] },
          avgInvoiceValue: { $round: ["$avgInvoiceValue", 2] },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        totalTax: 0,
        totalDiscount: 0,
        totalAdditionalCharges: 0,
        totalPointsUsed: 0,
        totalPointsValue: 0,
        avgInvoiceValue: 0,
        maxInvoiceValue: 0,
        minInvoiceValue: 0,
        paymentEfficiency: 0,
      },
      statusCounts,
      monthlyBreakdown,
      topCustomers,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        customerId: customerId || null,
        status: status || null,
        period: period,
      },
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get invoices by customer
exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, startDate, endDate, limit = 50 } = req.query;

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer ID format",
      });
    }

    // Build filter
    const filter = { customerId };

    // Add status filter if provided
    if (status && status !== "all") {
      filter.status = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    // Get invoices
    const invoices = await Invoice.find(filter)
      .select(
        "invoiceNo invoiceDate dueDate grandTotal paidAmount dueAmount status paymentMethod"
      )
      .sort({ invoiceDate: -1 })
      .limit(parseInt(limit));

    // Calculate summary
    const summary = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      totalDue: invoices.reduce((sum, inv) => sum + inv.dueAmount, 0),
    };

    res.json({
      success: true,
      count: invoices.length,
      summary,
      invoices,
    });
  } catch (error) {
    console.error("Get customer invoices error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer invoices",
    });
  }
};

// Get overdue invoices by customer
exports.getOverdueInvoicesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const today = new Date();

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer ID format",
      });
    }

    // Find overdue invoices (due date passed and not fully paid)
    const overdueInvoices = await Invoice.find({
      customerId,
      dueDate: { $lt: today },
      dueAmount: { $gt: 0 },
      status: { $in: ["sent", "partial"] },
    })
      .select(
        "invoiceNo invoiceDate dueDate grandTotal paidAmount dueAmount status"
      )
      .sort({ dueDate: 1 });

    // Calculate total overdue amount
    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + inv.dueAmount,
      0
    );

    res.json({
      success: true,
      count: overdueInvoices.length,
      totalOverdue,
      invoices: overdueInvoices,
    });
  } catch (error) {
    console.error("Get overdue invoices error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch overdue invoices",
    });
  }
};

// Get unpaid invoices by customer
exports.getUnpaidInvoicesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer ID format",
      });
    }

    // Find unpaid or partially paid invoices
    const unpaidInvoices = await Invoice.find({
      customerId,
      dueAmount: { $gt: 0 },
      status: { $in: ["sent", "partial"] },
    })
      .select(
        "invoiceNo invoiceDate dueDate grandTotal paidAmount dueAmount status"
      )
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: unpaidInvoices.length,
      invoices: unpaidInvoices,
    });
  } catch (error) {
    console.error("Get unpaid invoices error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch unpaid invoices",
    });
  }
};
