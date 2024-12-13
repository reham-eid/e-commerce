import { Schema, Types, model } from "mongoose";
import cloudinary from "../../src/services/fileUploads/cloudinary.js";

const productSchema = new Schema(
  {
    title: {
      type: String,
      unique: [true, "Product title already Exisit "],
      trim: true,
      required: true,
      maxLength: 50,
      minLength: [2, "too short of Product title "],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 100,
      minLength: [10, "too short of Product description "],
    },
    imgCover: {
      id: { type: String, unique: true, required: true },
      url: { type: String, required: true },
    },
    images: [
      {
        id: { type: String, unique: true, required: true },
        url: { type: String, required: true },
      },
    ],
    cloudFolder: {
      type: String,
      unique: true,
      required: true,
    },
    // specefication: { //color size
    //   // type: Map,
    //   // of: [String | Number],
    // },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      required: true,
    },
    priceAfterDiscount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "category",
      required: true,
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: "subcategory",
      required: true,
    },
    brandId: {
      type: Types.ObjectId,
      ref: "brand",
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
); 
// check productQuantity
productSchema.methods.inStock = function (quantity) {
  return this.quantity <  quantity ? false : true;
};

productSchema.virtual("reviews", {
  ref: "review",
  foreignField: "productId",
  localField: "_id",
});

productSchema.pre(/^find/, function () {
  //['find','findOne'] it works with all or single
  this.populate("reviews");
});
productSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // delete files
    const ids = this.images.map((img) => img.id);
    ids.push(this.imgCover.id);
    await cloudinary.api.delete_resources(ids);
    // delete folder (folder must be empty)
    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER_NAME}/product/${this.cloudFolder}`
    );
  }
);

const Product = model("product", productSchema);
export default Product;
