const { Op } = require("sequelize");

const { Sale, SaleItem, Product } = require("../models");

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getStartOfMonth = () => {
  const date = new Date();

  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
};

const getDashboard = async (req, res) => {
  try {
    const todayStart = getStartOfToday();
    const monthStart = getStartOfMonth();

    // Get today's sales
    const todaySales = await Sale.findAll({
      where: {
        created_at: {
          [Op.gte]: todayStart,
        },
      },
      attributes: ["id", "total_amount", "gst_amount", "created_at"],
    });

    // Get current month's sales
    const monthlySales = await Sale.findAll({
      where: {
        created_at: {
          [Op.gte]: monthStart,
        },
      },
      attributes: ["id", "total_amount", "gst_amount", "created_at"],
    });

    // Get all products and calculate low stock in JavaScript
    const allProducts = await Product.findAll({
      order: [["quantity", "ASC"]],
    });

    const lowStockProducts = allProducts.filter(
      (product) =>
        Number(product.quantity) <= Number(product.low_stock_threshold),
    );

    // Get sale items with product information
    const saleItems = await SaleItem.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "category", "selling_price"],
        },
      ],
    });

    // Calculate top products
    const productSales = {};

    for (const item of saleItems) {
      const productId = item.product_id;

      if (!productSales[productId]) {
        productSales[productId] = {
          product_id: productId,
          total_quantity: 0,
          revenue: 0,
          product: item.product,
        };
      }

      const quantity = Number(item.quantity);
      const price = Number(item.price_at_sale);

      productSales[productId].total_quantity += quantity;
      productSales[productId].revenue += quantity * price;
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5)
      .map((item) => ({
        product_id: item.product_id,
        total_quantity: item.total_quantity,
        revenue: Number(item.revenue.toFixed(2)),
        product: item.product,
      }));

    // Calculate today's revenue
    const todayRevenue = todaySales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0,
    );

    // Calculate monthly revenue
    const monthlyRevenue = monthlySales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0,
    );

    return res.json({
      success: true,
      dashboard: {
        today_sales_count: todaySales.length,

        today_revenue: Number(todayRevenue.toFixed(2)),

        monthly_sales_count: monthlySales.length,

        monthly_revenue: Number(monthlyRevenue.toFixed(2)),

        low_stock_count: lowStockProducts.length,

        low_stock_products: lowStockProducts,

        top_products: topProducts,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate dashboard report.",
    });
  }
};

const getProfitLoss = async (req, res) => {
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
              attributes: ["id", "name", "cost_price"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    let salesRevenue = 0;
    let totalCost = 0;
    let totalGST = 0;

    for (const sale of sales) {
      totalGST += Number(sale.gst_amount);

      for (const item of sale.items) {
        const quantity = Number(item.quantity);

        const sellingPrice = Number(item.price_at_sale);

        const costPrice = Number(item.product.cost_price);

        salesRevenue += sellingPrice * quantity;

        totalCost += costPrice * quantity;
      }
    }

    const grossProfit = salesRevenue - totalCost;

    return res.json({
      success: true,
      report: {
        sales_count: sales.length,

        sales_revenue: Number(salesRevenue.toFixed(2)),

        total_cost: Number(totalCost.toFixed(2)),

        gst_collected: Number(totalGST.toFixed(2)),

        gross_profit: Number(grossProfit.toFixed(2)),
      },

      sales,
    });
  } catch (error) {
    console.error("PROFIT LOSS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate profit/loss report.",
    });
  }
};

module.exports = {
  getDashboard,
  getProfitLoss,
};
