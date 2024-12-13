import Category from "../../../DB/models/category.model.js";
import slugify from "slugify";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import cloudinary from "../../services/fileUploads/cloudinary.js";
import generateUniqueString from "../../utils/generateUniqueString.js";

const addCategory = asyncHandler(async (req, res, next) => {
  // check dublicated category
  const isDuplicated = await Category.findOne({ name: req.body.name });
  if (isDuplicated)
    return next({ cause: 409, message: "category already exisit" });
  //check file
  if (!req.file)
    return next(new Error("category image is required", { cause: 400 }));
  const uniqueId = generateUniqueString(5);
  //upload img in cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_FOLDER_NAME}/categories/${uniqueId}` }
  );
  req.folder = `${process.env.CLOUD_FOLDER_NAME}/categories/${uniqueId}`;

  const category = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    folderId: uniqueId,
    image: { id: public_id, url: secure_url },
  });
  req.savedDocument = { model: Category, condition: category._id };

  res.status(201).json({ message: "category added successfuly", category });
});

const allCategories = asyncHandler(async (req, res) => {
  let apiFeature = new ApiFeature(Category.find({},{image:0}), req.query)
    .pagination()
    .fields()
    .filter()
    .search() 
    .sort();

  const categories = await apiFeature.mongoQuery.populate([
    {
      path: "subCategoryId",
      select: "-image",
      populate: [{ path: "brands", select: "-logo" }],
    },
  ]).lean();
  res.status(200).json({ message: "All Categories", categories });
});

const OneCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category)
    return next(new Error("category name not found", { cause: 404 }));
  res.status(200).json({ message: "Category of this Id:", category });
});

const updateCategory = asyncHandler(async (req, res, next) => {
  //check category in db
  const category = await Category.findById(req.params.id);
  if (!category)
    return next(new Error("category name not found", { cause: 404 }));
  // check category owner
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(new Error("you are not Owner of category", { cause: 403 }));
  //check file >> upload in cloudinary
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: category.image.id,
      }
    );
    category.image = { id: public_id, url: secure_url };
  }
  //update category
  if (req.body.name) {
    // check req.body.name the same in db
    if (req.body.name === category.name && category._id.toString() === req.params.id) {
      return next({
        cause: 400,
        message: "already the same category name.. updated if you want",
      });
    }
    // check duplicated category name in the name wanted to update
    const isDuplicated = await Category.findOne({ name: req.body.name });
    if (isDuplicated) {
      return next({
        cause: 409,
        message: "sorry .. there is another category with this name",
      });
    }
    category.name = req.body.name;
    category.slug = slugify(req.body.name, "-");
  }
  // category.createdBy = req.user._id
  await category.save();
  res.status(200).json({ message: "Category updated", category });
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  // check Category
  const category = await Category.findById(req.params.id);
  if (!category)
    return next(new Error("category name not found", { cause: 404 }));
  // check owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("you are not authorized to delete", { cause: 401 }));
  // delete category
  await category.deleteOne();
  // doesnot send res ok , but deleted in mongodb
  res.status(200).json({ message: "category deleted", category });
});

export {
  addCategory,
  allCategories,
  deleteCategory,
  updateCategory, //
  OneCategory,
};
