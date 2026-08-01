import Menu from '../models/Menu.js';
import Category from '../models/Category.js';

export const getMenu = async (req, res) => {
  try {
    const menuItems = await Menu.find({}).populate('category', 'name description');
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  const { name, price, category, imageURL, isAvailable } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ message: 'Name, price and category are required' });
  }
  try {
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const menuItem = await Menu.create({
      name,
      price,
      category,
      imageURL,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    const populated = await Menu.findById(menuItem._id).populate('category', 'name description');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  const { name, price, category, imageURL, isAvailable } = req.body;
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }
      menuItem.category = category;
    }
    if (name) menuItem.name = name;
    if (price !== undefined) menuItem.price = price;
    if (imageURL !== undefined) menuItem.imageURL = imageURL;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    const updated = await menuItem.save();
    const populated = await Menu.findById(updated._id).populate('category', 'name description');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
