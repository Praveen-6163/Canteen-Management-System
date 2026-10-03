import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    imageURL: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      min: 0,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

menuSchema.index({ name: 1 });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
