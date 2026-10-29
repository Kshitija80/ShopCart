const { sequelize, PurchaseOrder, Supplier, Product } = require("../models");

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.findAll({
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["order_date", "DESC"]],
    });

    return res.json({
      success: true,
      count: orders.length,
      purchase_orders: orders,
    });
  } catch (error) {
    console.error("Get purchase orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch purchase orders.",
    });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, product_id, quantity, order_date, status } = req.body;

    if (!supplier_id || !product_id || !quantity || !order_date) {
      return res.status(400).json({
        success: false,
        message: "Supplier, product, quantity and order date are required.",
      });
    }

    const supplier = await Supplier.findByPk(supplier_id);
    const product = await Product.findByPk(product_id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const purchaseOrder = await PurchaseOrder.create({
      supplier_id,
      product_id,
      quantity: Number(quantity),
      order_date,
      status: status || "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully.",
      purchase_order: purchaseOrder,
    });
  } catch (error) {
    console.error("Create purchase order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create purchase order.",
    });
  }
};

const updatePurchaseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!purchaseOrder) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    const newStatus = req.body.status;

    if (
      newStatus &&
      !["PENDING", "ORDERED", "RECEIVED", "CANCELLED"].includes(newStatus)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid purchase order status.",
      });
    }

    // Do not allow undoing a received order because stock
    // has already been added.
    if (
      purchaseOrder.status === "RECEIVED" &&
      newStatus &&
      newStatus !== "RECEIVED"
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "A received purchase order cannot be moved to another status.",
      });
    }

    if (req.body.quantity !== undefined) {
      const quantity = Number(req.body.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer.",
        });
      }

      purchaseOrder.quantity = quantity;
    }

    if (req.body.order_date !== undefined) {
      purchaseOrder.order_date = req.body.order_date;
    }

    if (newStatus) {
      purchaseOrder.status = newStatus;
    }

    const oldStatus = purchaseOrder._previousDataValues.status;

    await purchaseOrder.save({ transaction });

    // When order becomes RECEIVED for first time,
    // increase inventory quantity.
    if (oldStatus !== "RECEIVED" && purchaseOrder.status === "RECEIVED") {
      const product = await Product.findByPk(purchaseOrder.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: "Product associated with this order was not found.",
        });
      }

      product.quantity += Number(purchaseOrder.quantity);

      await product.save({ transaction });
    }

    await transaction.commit();

    const updatedOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
        {
          model: Product,
          as: "product",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Purchase order updated successfully.",
      purchase_order: updatedOrder,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update purchase order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update purchase order.",
    });
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
};
