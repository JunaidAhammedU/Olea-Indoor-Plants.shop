const categoriesModel = require("../models/categoriesModel");
const productsModel = require("../models/productsModel");
//-------------------------------------------------

const ITEMS_PER_PAGE = 10;


const loadProducts = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const { search, status, sortBy, page } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (status === "active") {
      filter.status = true;
    } else if (status === "deleted") {
      filter.status = false;
    }

    const sortOptions = {};
    if (sortBy === "name_asc") {
      sortOptions.name = 1;
    } else if (sortBy === "name_desc") {
      sortOptions.name = -1;
    } else if (sortBy === "price_asc") {
      sortOptions.price = 1;
    } else if (sortBy === "price_desc") {
      sortOptions.price = -1;
    }

    const totalCount = await productsModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const currentPage = parseInt(page) || 1;
    const skipItems = (currentPage - 1) * ITEMS_PER_PAGE;

    const productData = await productsModel
      .find(filter)
      .sort(sortOptions)
      .skip(skipItems)
      .limit(ITEMS_PER_PAGE);

    res.render("./admin/products", {
      admin,
      products: productData,
      search,
      status,
      sortBy,
      currentPage,
      totalPages,
    });
  } catch (error) {
    console.error("Error occurred while loading Load products page:", error);
    res.status(500).send("Error occurred while loading Load addProducts page.");
  }
};


// add product
const loadAddProducts = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const catData = await categoriesModel.find();
    res.render("./admin/addProducts", { admin: admin, category: catData });
  } catch (error) {
    console.error("Error occurred while loading Add products:", error);
    res.status(500).send("Error occurred while loading Add products.");
  }
};

// adding products
const AddProducts = async (req, res) => {
  try {
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      images[i] = req.files[i].filename;
    }
    const { name, productQuantity, price, description, status, category } = req.body;
    const catData = await categoriesModel.findById({_id:category});
    const productData = new productsModel({
      name,
      category:catData._id,
      productQuantity,
      description,
      price,
      status,
      images: images,
    });
    const saveProdData = await productData.save();
    if (saveProdData) {
      res.redirect("/admin/products");
    } else {
      res.redirect("/admin/addProducts");
    }
  } catch (error) {
    console.error("Error occurred while loading Adding products:", error);
    res.status(500).send("Error occurred while loading Adding products.");
  }
};

//edit product page
const loadEditProduct = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const productId = req.params.productId;
    const productData = await productsModel.findOne({ _id: productId });
    const catData = await categoriesModel.find();
    if (productData) {
      res.render("./admin/editProduct", {
        admin: admin,
        products: [productData],
        category: catData,
      });
    } else {
      console.log("Error occurred while loading Load edit products page");
    }
  } catch (error) {
    console.error(
      "Error occurred while loading Load edit products page:",
      error
    );
    res.status(500).send("Error occurred while loading Load addProducts page.");
  }
};

// Update product
const updateProducts = async (req, res) => {
  try {
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      
      [i] = req.files[i].filename;
    }

    const productId = req.params.productId;
    const { name, productQuantity, price, description, status, category } = req.body;
    const catData = await categoriesModel.findById({_id:category});
    const productData = await productsModel
      .findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            name,
            productQuantity,
            description,
            category:catData._id,
            price,
            status,
            images: images,
          },
        }
      )
      .exec();
    if (productData) {
      res.redirect("/admin/products");
    } else {
      res.status(404).send("Product not found.");
    }
  } catch (error) {
    res.status(500).send("An error occurred while updating the product.");
  }
};

// Unlist Product
const unlistProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const productData = await productsModel
      .findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            status: false,
          },
        }
      )
      .exec();
    if (productData) {
      res.redirect("/admin/products");
    } else {
      res.status(404).send("Product not found.");
    }
  } catch (error) {
    res.status(500).send("An error occurred while deleting the product.");
  }
};

// List Product
const listProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const productData = await productsModel
      .findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            status: true,
          },
        }
      )
      .exec();
    if (productData) {
      res.redirect("/admin/products");
    } else {
      res.status(404).send("Product not found.");
    }
  } catch (error) {
    res.status(500).send("An error occurred while deleting the product.");
  }
};
module.exports = {
  loadProducts,
  loadAddProducts,
  AddProducts,
  loadEditProduct,
  updateProducts,
  unlistProduct,
  listProduct,
};
