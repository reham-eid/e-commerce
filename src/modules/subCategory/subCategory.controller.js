import slugify from "slugify";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import SubCategory from "../../../DB/models/subCategory.model.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import cloudinary from "../../services/fileUploads/cloudinary.js";
import Category from "../../../DB/models/category.model.js";
import generateUniqueString from "../../utils/generateUniqueString.js";

const addSubCategory = asyncHandler(async (req, res, next) => {
  // check on category in params (merg param)
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  // check if exisit or not by name
  const isExisit = await SubCategory.findOne({ name: req.body.name });
  if (isExisit)
    return next(new Error("SubCategory already exisit", { cause: 409 }));

  // check image
  if (!req.file)
    return next(new Error("SubCategory image is required", { cause: 400 }));

  const uniqueId = generateUniqueString(5);
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/categories/${category.folderId}/subcategories/${uniqueId}`,
    }
  );
  req.folder = `${process.env.CLOUD_FOLDER_NAME}/categories/${category.folderId}/subcategories/${uniqueId}`;

  // create SubCategory
  const subCategory = await SubCategory.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    categoryId: req.params.category,
    folderId: uniqueId,
    image: { id: public_id, url: secure_url },
  });
  req.savedDocument = { model: SubCategory, condition: subCategory._id };

  res
    .status(201)
    .json({ message: "subCategory added successfuly", subCategory });
});

const allSubCategories = asyncHandler(async (req, res) => {
  let filterObj = {};
  if (req.params.category) {
    filterObj.categoryId = req.params.category;
    //{categoryId:req.params.category}
  }
  let apiFeature = new ApiFeature(SubCategory.find(filterObj), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();
  // console.log(Object.keys(filterObj));
  let subCategories = await apiFeature.mongoQuery.populate("categoryId").lean(); //  Object.keys(filterObj)[0]

  res.status(200).json({ message: "All SubCategory", subCategories });
}); // api feature with merge param

const OneSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id).lean();
  if (!subCategory)
    return next(new Error("subCategory Not found", { cause: 404 }));
  res.status(200).json({ message: "SubCategory of this Id:", SubCategory });
});

const updateSubCategory = asyncHandler(async (req, res, next) => {
  // check category (we are in merge param)
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));

  // check subcategory
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    categoryId: req.params.category,
  });
  if (!subCategory)
    return next(new Error("subCategory Not found", { cause: 404 }));
  // check owner
  if (req.user._id.toString() !== subCategory.createdBy.toString())
    return next(new Error("you are not the owner", { cause: 403 }));
  // check file
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: subCategory.image.id,
      }
    );
    subCategory.image = { id: public_id, url: secure_url };
  }
  //update
  subCategory.slug = req.body.name ? slugify(req.body.name) : subCategory.slug;
  subCategory.name = req.body.name ? req.body.name : subCategory.name;
  // save
  await subCategory.save();
  res.status(200).json({ message: "subCategory updated" });
});

const deleteSubCategory = asyncHandler(async (req, res, next) => {
  // check category (we are in merge param)
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));

  // check subcategory
  const subCategory = await SubCategory.findOne({
    _id: req.params.id,
    categoryId: req.params.category,
  });
  if (!subCategory)
    return next(new Error("subCategory Not found", { cause: 404 }));

  // delete subcategory
  await subCategory.deleteOne();
  // destroy img
  await cloudinary.uploader.destroy(subcategory.image.id);
  res.status(200).json({ message: "subCategory deleted" });
});

export {
  addSubCategory,
  allSubCategories,
  OneSubCategory,
  deleteSubCategory,
  updateSubCategory,
};
