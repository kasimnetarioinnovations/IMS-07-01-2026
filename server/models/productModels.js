const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },

    hsn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HSN",
      required: true,
    },

    itemBarcode: { type: String },

    purchasePrice: Number,
    sellingPrice: Number,
    mrp: Number,
    tax: String,
    size: String,
    color: String,
    openingQuantity: Number,
    minStockToMaintain: Number,
    discountAmount: Number,
    // discountPercent: Number,
    discountType: String,

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    lotDetails: {
      lotNo: String,
      lotmrp: String,
      fabricBatchNo: String,
      productionDate: String,
      designCode: String,
      quantity: Number,
      size: String,
      color: String,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
