const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sale = sequelize.define(
    "Sale",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      invoice_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      gst_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "sales",
      timestamps: false,
    },
  );

  return Sale;
};
