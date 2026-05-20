import { Category } from '../models/index.js'

// @desc  Get all categories
// @route GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Create category (Admin)
// @route POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage } = req.body
    if (!categoryName || !categoryImage) {
      return res.status(400).json({ message: 'Category name and image are required' })
    }

    const categoryExists = await Category.findOne({ categoryName })
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = await Category.create({ categoryName, categoryImage })
    res.status(201).json(category)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Update category (Admin)
// @route PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage } = req.body
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    if (categoryName) category.categoryName = categoryName
    if (categoryImage) category.categoryImage = categoryImage

    const updatedCategory = await category.save()
    res.json(updatedCategory)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Delete category (Admin)
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
