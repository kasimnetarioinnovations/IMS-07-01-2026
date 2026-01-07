const RewardSystem = require('../models/Points&RewardsModel');

// Step 1: Create draft with rewardType
exports.initRewardSystem = async (req, res) => {
  try {
    const { rewardType } = req.body;

    if (!rewardType) {
      return res.status(400).json({
        success: false,
        message: 'rewardType is required',
      });
    }

    const draft = new RewardSystem({
      rewardType,
      status: 'draft',
      createdBy: req.user?._id || null,
    });

    await draft.save();

    res.status(201).json({
      success: true,
      message: 'Draft created successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Step 2: Update the latest draft and make it active
exports.completeRewardSystem = async (req, res) => {
  try {
    const {
      rewardType,
      offerName,
      amountForPoint,
      minPurchase,
      deadline,
      pointValue,
      maxEligibleAmount,
      minInvoiceValue,
    } = req.body;

    if (!rewardType || !offerName) {
      return res.status(400).json({
        success: false,
        message: 'rewardType and offerName are required',
      });
    }

    const userId = req.user?._id || null;

    // Find the most recent draft for this user and rewardType
    const draft = await RewardSystem.findOne({
      rewardType,
      createdBy: userId,
      status: 'draft',
    }).sort({ createdAt: -1 }); // latest first

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'No draft found to complete. Please start again.',
      });
    }

    // Update the draft with full details
    draft.offerName = offerName.trim();
    draft.amountForPoint = amountForPoint ? Number(amountForPoint) : undefined;
    draft.minPurchase = minPurchase ? Number(minPurchase) : undefined;
    draft.deadline = deadline ? new Date(deadline) : undefined;
    draft.pointValue = pointValue ? Number(pointValue) : undefined;
    draft.maxEligibleAmount = maxEligibleAmount ? Number(maxEligibleAmount) : undefined;
    draft.minInvoiceValue = minInvoiceValue ? Number(minInvoiceValue) : undefined;
    draft.status = 'active'; // now complete

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Reward system completed successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Complete reward error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllRewardSystems = async (req, res) => {
  try {
    const rewards = await RewardSystem.find({ status: 'active' }) // ya sabhi dikhane ke liye {}
      .sort({ createdAt: -1 });

    res.json(rewards);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
