import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['daily', 'monthly'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
