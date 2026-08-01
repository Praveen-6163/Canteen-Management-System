import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (name) {
      const existing = await Category.findOne({ name });
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      category.name = name;
    }
    if (description !== undefined) {
      category.description = description;
    }
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
