const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SaleItem = sequelize.define(
    "SaleItem",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      sale_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      price_at_sale: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "sale_items",
      timestamps: false,
    },
  );

  return SaleItem;
};
