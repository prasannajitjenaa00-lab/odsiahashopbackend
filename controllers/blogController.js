import { Blog } from '../models/index.js'
import mongoose from 'mongoose'

// Helper to generate slugs
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '')             // Trim - from end
}

// @desc  Get all blogs (with filter/search/pagination)
// @route GET /api/blogs
export const getBlogs = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query
    const query = {}

    if (category && category !== 'All') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Blog.countDocuments(query)
    const blogs = await Blog.find(query)
      .sort({ publishDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({
      blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching blogs' })
  }
}

// @desc  Get single blog by slug (includes related blogs)
// @route GET /api/blogs/post/:slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const blog = await Blog.findOne({ slug: slug.toLowerCase() })

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    // Get 3 related blogs from the same category (excluding current)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id }
    })
      .sort({ publishDate: -1 })
      .limit(3)

    res.json({ blog, related: relatedBlogs })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching blog details' })
  }
}

// @desc  Create blog (Admin Only)
// @route POST /api/blogs
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      shortDescription,
      content,
      image,
      tags,
      author,
      publishDate,
      metaTitle,
      metaDescription
    } = req.body

    if (!title || !category || !shortDescription || !content || !image) {
      return res.status(400).json({ message: 'Please provide all required fields: title, category, shortDescription, content, image' })
    }

    // Generate or clean slug
    let blogSlug = slug ? slugify(slug) : slugify(title)

    // Check if slug is unique
    let slugExists = await Blog.findOne({ slug: blogSlug })
    let count = 1
    while (slugExists) {
      blogSlug = `${slugify(slug ? slug : title)}-${count}`
      slugExists = await Blog.findOne({ slug: blogSlug })
      count++
    }

    // Process tags
    let processedTags = []
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(t => t.trim()).filter(Boolean)
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    const blog = new Blog({
      title,
      slug: blogSlug,
      category,
      shortDescription,
      content,
      image,
      tags: processedTags,
      author: author || 'OdishaShop',
      publishDate: publishDate || new Date(),
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription
    })

    const createdBlog = await blog.save()
    res.status(201).json(createdBlog)
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error creating blog post' })
  }
}

// @desc  Update blog (Admin Only)
// @route PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid blog ID' })
    }

    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    const {
      title,
      slug,
      category,
      shortDescription,
      content,
      image,
      tags,
      author,
      publishDate,
      metaTitle,
      metaDescription
    } = req.body

    if (title) blog.title = title
    if (category) blog.category = category
    if (shortDescription) blog.shortDescription = shortDescription
    if (content) blog.content = content
    if (image) blog.image = image
    if (author) blog.author = author
    if (publishDate) blog.publishDate = publishDate
    if (metaTitle) blog.metaTitle = metaTitle
    if (metaDescription) blog.metaDescription = metaDescription

    // Handle slug updates
    if (slug || title) {
      let targetSlug = slug ? slugify(slug) : slugify(title || blog.title)
      if (targetSlug !== blog.slug) {
        let slugExists = await Blog.findOne({ slug: targetSlug, _id: { $ne: id } })
        let count = 1
        while (slugExists) {
          targetSlug = `${slugify(slug ? slug : (title || blog.title))}-${count}`
          slugExists = await Blog.findOne({ slug: targetSlug, _id: { $ne: id } })
          count++
        }
        blog.slug = targetSlug
      }
    }

    // Handle tags updates
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        blog.tags = tags.map(t => t.trim()).filter(Boolean)
      } else if (typeof tags === 'string') {
        blog.tags = tags.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    const updatedBlog = await blog.save()
    res.json(updatedBlog)
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error updating blog post' })
  }
}

// @desc  Delete blog (Admin Only)
// @route DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid blog ID' })
    }

    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    res.json({ message: 'Blog post deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error deleting blog post' })
  }
}
