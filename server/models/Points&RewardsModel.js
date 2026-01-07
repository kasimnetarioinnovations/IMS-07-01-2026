// const mongoose = require('mongoose');

// const RewardSystemSchema = new mongoose.Schema({
//   rewardType: {
//     type: String,
//     required: true,
//     enum: ['points', 'cashback', 'referral', 'tiered'],
//   },
//   offerName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   // Reward earning rules
//   amountForPoint: { type: Number },      // ₹X spent = 1 point
//   minPurchase: { type: Number },         // minimum order value to earn points
//   deadline: { type: Date },              // offer expiry

//   // Redeem rules
//   pointValue: { type: Number },          // 1 point = ₹X
//   maxEligibleAmount: { type: Number },   // max amount that can be redeemed with points
//   minInvoiceValue: { type: Number },     // min invoice value to allow redemption

//   status: {
//     type: String,
//     enum: ['draft', 'active', 'expired'],
//     default: 'active',
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',    // assuming you have a User model
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   shareLink: {
//     type: String,
//   },
//   isDelete: {
//       type: Boolean,
//       default: false,
//     },
// });

// RewardSystemSchema.pre('save', function (next) {
//   if (!this.shareLink) {
//     this.shareLink = `https://yourapp.com/rewards/${this._id}`;
//   }
//   next();
// });

// module.exports = mongoose.model('RewardSystem', RewardSystemSchema);


// models/RewardSystem.js
const mongoose = require('mongoose');

const RewardSystemSchema = new mongoose.Schema({
  rewardType: {
    type: String,
    required: true,
    enum: ['points', 'cashback', 'referral', 'tiered'],
  },
  offerName: { type: String, trim: true },
  amountForPoint: { type: Number },
  minPurchase: { type: Number },
  deadline: { type: Date },
  pointValue: { type: Number },
  maxEligibleAmount: { type: Number },
  minInvoiceValue: { type: Number },
  status: {
    type: String,
    enum: ['draft', 'active', 'expired'],
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,  // comment out if no auth yet
  },
  createdAt: { type: Date, default: Date.now },
  shareLink: { type: String },
  isDelete: { type: Boolean, default: false },
});

RewardSystemSchema.pre('save', function (next) {
  if (this.isNew && !this.shareLink) {
    this.shareLink = `https://yourapp.com/rewards/${this._id}`;
  }
  next();
});

module.exports = mongoose.model('RewardSystem', RewardSystemSchema);