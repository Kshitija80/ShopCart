"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const ownerPassword = await bcrypt.hash("Owner@123", 10);
      const staffPassword = await bcrypt.hash("Staff@123", 10);

      await queryInterface.bulkInsert(
        "users",
        [
          {
            id: 1,
            name: "Shop Owner",
            email: "owner@shopease.com",
            password_hash: ownerPassword,
            role: "OWNER",
            created_at: new Date(),
          },
          {
            id: 2,
            name: "Shop Staff",
            email: "staff@shopease.com",
            password_hash: staffPassword,
            role: "STAFF",
            created_at: new Date(),
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        "products",
        [
          {
            id: 1,
            name: "Paracetamol 500mg",
            category: "Medicine",
            cost_price: 18.0,
            selling_price: 25.0,
            quantity: 48,
            low_stock_threshold: 10,
            expiry_date: "2027-12-31",
          },
          {
            id: 2,
            name: "Cough Syrup",
            category: "Medicine",
            cost_price: 65.0,
            selling_price: 85.0,
            quantity: 25,
            low_stock_threshold: 8,
            expiry_date: "2027-08-31",
          },
          {
            id: 3,
            name: "Toothpaste",
            category: "Personal Care",
            cost_price: 45.0,
            selling_price: 60.0,
            quantity: 34,
            low_stock_threshold: 10,
            expiry_date: null,
          },
          {
            id: 4,
            name: "Bath Soap",
            category: "Personal Care",
            cost_price: 28.0,
            selling_price: 38.0,
            quantity: 58,
            low_stock_threshold: 15,
            expiry_date: null,
          },
          {
            id: 5,
            name: "Rice 5kg",
            category: "Grocery",
            cost_price: 260.0,
            selling_price: 310.0,
            quantity: 19,
            low_stock_threshold: 5,
            expiry_date: "2027-06-30",
          },
          {
            id: 6,
            name: "Wheat Flour 5kg",
            category: "Grocery",
            cost_price: 190.0,
            selling_price: 230.0,
            quantity: 18,
            low_stock_threshold: 5,
            expiry_date: "2027-05-31",
          },
          {
            id: 7,
            name: "Cooking Oil 1L",
            category: "Grocery",
            cost_price: 110.0,
            selling_price: 135.0,
            quantity: 29,
            low_stock_threshold: 8,
            expiry_date: "2027-10-31",
          },
          {
            id: 8,
            name: "Biscuits Pack",
            category: "Snacks",
            cost_price: 20.0,
            selling_price: 30.0,
            quantity: 43,
            low_stock_threshold: 10,
            expiry_date: "2027-03-31",
          },
          {
            id: 9,
            name: "Shampoo 180ml",
            category: "Personal Care",
            cost_price: 95.0,
            selling_price: 125.0,
            quantity: 22,
            low_stock_threshold: 6,
            expiry_date: null,
          },
          {
            id: 10,
            name: "Tea Powder 250g",
            category: "Grocery",
            cost_price: 90.0,
            selling_price: 120.0,
            quantity: 27,
            low_stock_threshold: 7,
            expiry_date: "2027-09-30",
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        "suppliers",
        [
          {
            id: 1,
            name: "MediCare Distributors",
            contact: "9876543210",
            email: "medicare@example.com",
          },
          {
            id: 2,
            name: "DailyNeeds Wholesale",
            contact: "9123456780",
            email: "dailyneeds@example.com",
          },
        ],
        { transaction },
      );

      const now = new Date();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await queryInterface.bulkInsert(
        "sales",
        [
          {
            id: 1,
            invoice_no: "INV-2026-0001",
            total_amount: 186.0,
            gst_amount: 18.6,
            created_by: 1,
            created_at: twoDaysAgo,
          },
          {
            id: 2,
            invoice_no: "INV-2026-0002",
            total_amount: 310.0,
            gst_amount: 31.0,
            created_by: 2,
            created_at: yesterday,
          },
          {
            id: 3,
            invoice_no: "INV-2026-0003",
            total_amount: 315.0,
            gst_amount: 31.5,
            created_by: 1,
            created_at: now,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        "sale_items",
        [
          {
            id: 1,
            sale_id: 1,
            product_id: 1,
            quantity: 2,
            price_at_sale: 25.0,
          },
          {
            id: 2,
            sale_id: 1,
            product_id: 3,
            quantity: 1,
            price_at_sale: 60.0,
          },
          {
            id: 3,
            sale_id: 1,
            product_id: 4,
            quantity: 2,
            price_at_sale: 38.0,
          },
          {
            id: 4,
            sale_id: 2,
            product_id: 5,
            quantity: 1,
            price_at_sale: 310.0,
          },
          {
            id: 5,
            sale_id: 3,
            product_id: 7,
            quantity: 1,
            price_at_sale: 135.0,
          },
          {
            id: 6,
            sale_id: 3,
            product_id: 8,
            quantity: 2,
            price_at_sale: 30.0,
          },
          {
            id: 7,
            sale_id: 3,
            product_id: 10,
            quantity: 1,
            price_at_sale: 120.0,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        "purchase_orders",
        [
          {
            id: 1,
            supplier_id: 1,
            product_id: 1,
            quantity: 100,
            order_date: "2026-09-20",
            status: "ORDERED",
          },
          {
            id: 2,
            supplier_id: 2,
            product_id: 5,
            quantity: 50,
            order_date: "2026-09-21",
            status: "PENDING",
          },
          {
            id: 3,
            supplier_id: 2,
            product_id: 7,
            quantity: 40,
            order_date: "2026-09-22",
            status: "RECEIVED",
          },
        ],
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete("purchase_orders", null, {
        transaction,
      });

      await queryInterface.bulkDelete("sale_items", null, {
        transaction,
      });

      await queryInterface.bulkDelete("sales", null, {
        transaction,
      });

      await queryInterface.bulkDelete("suppliers", null, {
        transaction,
      });

      await queryInterface.bulkDelete("products", null, {
        transaction,
      });

      await queryInterface.bulkDelete("users", null, {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
