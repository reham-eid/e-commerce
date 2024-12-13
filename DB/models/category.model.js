import mongoose, { Types } from "mongoose";
import SubCategory from "./subCategory.model.js";
import cloudinary from "../../src/services/fileUploads/cloudinary.js";
import Brand from "./brand.model.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Category Name already Exisit "],
      trim: true,
      required: true,
      maxLength: 50,
      minLength: [2, "too short of Category Name "],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    image: {
      id: { type: String },
      url: { type: String },
    },
    folderId: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    // brands: [
    //   {
    //     type: Types.ObjectId,
    //     ref: "brand",
    //   },
    // ], loading on server
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual subCategory field
categorySchema.virtual("subCategoryId", {
  ref: "subCategory", //Model
  localField: "_id", // category
  foreignField: "categoryId", //subCategory
});

categorySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // delete all related SubCategories
    await SubCategory.deleteMany({
      categoryId: this._id,
    });
    // delete all related Brands
    await Brand.deleteMany({
      categoryId: this._id,
    });
    // delete image category from cloudnairy
    await cloudinary.api.delete_resources_by_prefix(`${process.env.CLOUD_FOLDER_NAME}/categories/${this.folderId}`)
    await cloudinary.api.delete_folder(`${process.env.CLOUD_FOLDER_NAME}/categories/${this.folderId}`)
  }
);

const Category = mongoose.model("category", categorySchema);
export default Category;
