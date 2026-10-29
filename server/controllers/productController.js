const { Op } = require("sequelize");
const { Product } = require("../models");

const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;

    const where = {};

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (category) {
      where.category = category;
    }

    if (lowStock === "true") {
      where.quantity = {
        [Op.lte]: Product.sequelize.col("low_stock_threshold"),
      };
    }

    const products = await Product.findAll({
      where,
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      cost_price,
      selling_price,
      quantity,
      low_stock_threshold,
      expiry_date,
    } = req.body;

    if (!name || cost_price === undefined || selling_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, cost price and selling price are required.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category || null,
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      quantity: Number(quantity || 0),
      low_stock_threshold: Number(low_stock_threshold || 5),
      expiry_date: expiry_date || null,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "cost_price",
      "selling_price",
      "quantity",
      "low_stock_threshold",
      "expiry_date",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    return res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.destroy();

    return res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete product. It may already be linked to sales or purchase orders.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
