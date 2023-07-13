const categoriesModel = require("../models/categoriesModel");
const Categories = require("../models/categoriesModel");
//------------------------------------------------------

//  load Categories
const loadCategories = async (req, res) => {
  try {
    const admin = req.session.admin_id;
    const cateData = await Categories.find();
    res.render("./admin/categories", { admin: admin, cateData: cateData });
  } catch (error) {}
};

// add Category
const addCategorie = async (req, res) => {
  try {
    const { categorieName, slug, description } = req.body;
    const catData = new Categories({
      categorieName,
      slug,
      description,
    });
    const savedCategorie = await catData.save();
    if (savedCategorie) {
      res.redirect("/admin/categories");
    } else {
      console.log("error while uploading data categories");
    }
  } catch (error) {
    console.error("Error occurred while loading Add categories", error);
    res.status(500).send("Error occurred while loading  Add categories.");
  }
};

//delete Category
const deleteCategory = async (req, res) => {
  try {
    const catId = req.params.categoryId;
    const catData = await categoriesModel
      .findByIdAndUpdate(
        { _id: catId },
        {
          $set: {
            status: false,
          },
        }
      )
      .exec();
    if (catData) {
      res.redirect("/admin/categories");
    } else {
      console.error("Error occurred while loading delete categories", error);
      res.status(500).send("Error occurred while loading  delete categories.");
    }
  } catch (error) {}
};

module.exports = {
  loadCategories,
  addCategorie,
  deleteCategory,
};
