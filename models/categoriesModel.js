const mongoose = require("mongoose");

var categoriesSchema = new mongoose.Schema({
  categorieName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Categories", categoriesSchema);
