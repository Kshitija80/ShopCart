const { Supplier } = require("../models");

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch suppliers.",
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact, email } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      contact: contact || null,
      email: email || null,
    });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create supplier.",
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    if (req.body.name !== undefined) {
      supplier.name = req.body.name.trim();
    }

    if (req.body.contact !== undefined) {
      supplier.contact = req.body.contact;
    }

    if (req.body.email !== undefined) {
      supplier.email = req.body.email;
    }

    await supplier.save();

    return res.json({
      success: true,
      message: "Supplier updated successfully.",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update supplier.",
    });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    await supplier.destroy();

    return res.json({
      success: true,
      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete supplier. It may be linked to purchase orders.",
    });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
