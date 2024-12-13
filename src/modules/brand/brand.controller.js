import slugify from "slugify";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import Brand from "../../../DB/models/brand.model.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import cloudinary from "../../services/fileUploads/cloudinary.js";
import Category from "../../../DB/models/category.model.js";
import SubCategory from "../../../DB/models/subCategory.model.js";
import generateUniqueString from "../../utils/generateUniqueString.js";

const addBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  // check categories [ {electronic},{hoom},{men}] array of objectIds
  const { categoryId, subCategoryId } = req.query;
  // check subCategories in db
  const isSubCategories = await SubCategory.findById(subCategoryId).populate([
    { path: "categoryId", select: "folderId" },
  ]);
  if (!isSubCategories) {
    return next(new Error(`subCategory not founnd `, { cause: 404 }));
  }
  //check dublicate brand
  const isBrand = await Brand.findOne({ name, subCategoryId });
  if (isBrand) {
    return next(
      new Error(
        `brand already exisit for this subCategoryId: ${subCategoryId} `,
        { cause: 400 }
      )
    );
  }
  // check subCategoryID belongs to Category
  if (isSubCategories.categoryId._id.toString() !== categoryId) {
    return next(
      new Error(`subCategoryID not belong to this CategoryID ${categoryId} `)
    );
  }

  if (!req.file)
    return next(new Error("brand image is required", { cause: 400 }));

  //upload img in cloudinary
  const uniqueId = generateUniqueString(5);
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/categories/${isSubCategories.categoryId.folderId}/subcategories/${isSubCategories.folderId}/brand/${uniqueId}`,
    }
  );
  req.folder = `${process.env.CLOUD_FOLDER_NAME}/categories/${isSubCategories.categoryId.folderId}/subcategories/${isSubCategories.folderId}/brand/${uniqueId}`;
  const brand = await Brand.create({
    name: name,
    slug: slugify(name),
    createdBy: req.user._id,
    folderId: uniqueId,
    logo: { id: public_id, url: secure_url },
    categoryId,
    subCategoryId,
  });
  req.savedDocument = { model: Brand, condition: brand._id };

  res.status(201).json({ message: "Brand added successfuly", brand });
});

const getAllBrand = asyncHandler(async (req, res,next) => {
  let apiFeature = new ApiFeature(Brand.find({}), req.query)
    .fields()
    .sort()
    .pagination({size:2})
    .filter()
    .search(['name']);
  const brand = await apiFeature.mongoQuery;//.lean()
  req.brand=brand
  res.status(200).json({ message: "All Brand", brand });
});

const OneBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id).lean();
  if (!brand) return res.status(404).json({ message: "brand Not found" });
  res.status(200).json({ message: "brand of this Id:", brand });
});

const updateBrand = asyncHandler(async (req, res, next) => {
  const { name, oldLogoID } = req.body;
  const { categoryId, subCategoryId } = req.query;

  // check brand exisit
  const brand = await Brand.findOne({
    _id: req.params.id,
    categoryId,
    subCategoryId,
  }).populate([
    { path: "categoryId", select: "folderId" },
    { path: "subCategoryId", select: "folderId" },
  ]);
  if (!brand) return res.status(404).json({ message: "brand Not found" });

  if (oldLogoID) {
    // check image
    if (!req.file)
      return next(new Error("insert new brand Logo please", { cause: 400 }));
    const newLogoID = oldLogoID.split(`${brand.folderId}/`)[1];
    //update img in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/categories/${brand.categoryId.folderId}/subcategories/${brand.subCategoryId.folderId}/brand/${brand.folderId}`,
        public_id: newLogoID,
      }
    );
    brand.logo.url = secure_url;
  }
  brand.name = name ? name : brand.name;
  brand.slug = name ? slugify(name) : brand.slug;
  brand.categoryId = categoryId ? categoryId : brand.categoryId;
  brand.subCategoryId = subCategoryId ? subCategoryId : brand.subCategoryId;

  await brand.save();
  res.status(200).json({ message: "brand updated", brand });
});

const deleteBrand = asyncHandler(async (req, res, next) => {
  // check brand
  // delete brand if exisit
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return res.status(404).json({ message: "brand Not found" });
  // delete logo
  await cloudinary.uploader.destroy(brand.logo.id);
  // delete categoreies from Categort Model
  await Category.updateMany({}, { $pull: { brands: brand._id } });
  // send res

  res.status(200).json({ message: "delete brand successfully:", brand });
});

export { addBrand, getAllBrand, OneBrand, deleteBrand, updateBrand };
