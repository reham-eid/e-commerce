import { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: [true, "SubCategory Name already Exisit "],
      trim: true,
      required: true,
      minLength: [2, "too short of SubCategory Name "],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "category",
      required: [true, "subCategory must be belong to its Category"],
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
// virtual field called brands
subCategorySchema.virtual("brands", {
  ref: "brand",
  localField: "_id",
  foreignField: "subCategoryId",
});
const SubCategory = model("subCategory", subCategorySchema);
export default SubCategory;
