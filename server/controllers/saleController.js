const { Op } = require("sequelize");

const { sequelize, Sale, SaleItem, Product } = require("../models");

const GST_RATE = 18;

const generateInvoiceNumber = async () => {
  const count = await Sale.count();

  const year = new Date().getFullYear();

  const sequence = String(count + 1).padStart(4, "0");

  return `INV-${year}-${sequence}`;
};

const getSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`],
      };
    } else if (startDate) {
      where.created_at = {
        [Op.gte]: `${startDate} 00:00:00`,
      };
    } else if (endDate) {
      where.created_at = {
        [Op.lte]: `${endDate} 23:59:59`,
      };
    }

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: SaleItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "At least one product is required.",
      });
    }

    const quantities = {};

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid product ID or quantity.",
        });
      }

      quantities[productId] = (quantities[productId] || 0) + quantity;
    }

    const productIds = Object.keys(quantities).map(Number);

    const products = await Product.findAll({
      where: {
        id: {
          [Op.in]: productIds,
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (products.length !== productIds.length) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "One or more products do not exist.",
      });
    }

    let subtotal = 0;

    const saleItems = [];

    for (const product of products) {
      const quantity = quantities[product.id];

      if (product.quantity < quantity) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${product.name}. ` +
            `Available stock: ${product.quantity}.`,
        });
      }

      const price = Number(product.selling_price);

      subtotal += price * quantity;

      saleItems.push({
        product_id: product.id,
        quantity,
        price_at_sale: price,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    const gstAmount = Number(((subtotal * GST_RATE) / 100).toFixed(2));

    const totalAmount = Number((subtotal + gstAmount).toFixed(2));

    const invoiceNo = await generateInvoiceNumber();

    const sale = await Sale.create(
      {
        invoice_no: invoiceNo,
        total_amount: totalAmount,
        gst_amount: gstAmount,
        created_by: Number(req.user.id),
        created_at: new Date(),
      },
      {
        transaction,
      },
    );

    for (const item of saleItems) {
      await SaleItem.create(
        {
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale,
        },
        {
          transaction,
        },
      );

      const product = products.find((p) => p.id === item.product_id);

      product.quantity = Number(product.quantity) - item.quantity;

      await product.save({
        transaction,
      });
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Sale created successfully.",
      invoice_no: invoiceNo,
      gst_rate: GST_RATE,
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      sale_id: sale.id,
      items: saleItems,
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError.message);
    }

    console.error("CREATE SALE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSales,
  createSale,
};
