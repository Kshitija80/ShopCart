const { Sequelize } = require("sequelize");
const config = require("../config/config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  },
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./User")(sequelize);
db.Product = require("./Product")(sequelize);
db.Sale = require("./Sale")(sequelize);
db.SaleItem = require("./SaleItem")(sequelize);
db.Supplier = require("./Supplier")(sequelize);
db.PurchaseOrder = require("./purchaseOrder")(sequelize);

// User -> Sales
db.User.hasMany(db.Sale, {
  foreignKey: "created_by",
  as: "sales",
});

db.Sale.belongsTo(db.User, {
  foreignKey: "created_by",
  as: "creator",
});

// Sale -> Sale Items
db.Sale.hasMany(db.SaleItem, {
  foreignKey: "sale_id",
  as: "items",
  onDelete: "CASCADE",
});

db.SaleItem.belongsTo(db.Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

// Product -> Sale Items
db.Product.hasMany(db.SaleItem, {
  foreignKey: "product_id",
  as: "saleItems",
});

db.SaleItem.belongsTo(db.Product, {
  foreignKey: "product_id",
  as: "product",
});

// Supplier -> Purchase Orders
db.Supplier.hasMany(db.PurchaseOrder, {
  foreignKey: "supplier_id",
  as: "purchaseOrders",
});

db.PurchaseOrder.belongsTo(db.Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

// Product -> Purchase Orders
db.Product.hasMany(db.PurchaseOrder, {
  foreignKey: "product_id",
  as: "purchaseOrders",
});

db.PurchaseOrder.belongsTo(db.Product, {
  foreignKey: "product_id",
  as: "product",
});

module.exports = db;
