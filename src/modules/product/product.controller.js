import slugify from "slugify";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import Product from "../../../DB/models/product.model.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import Brand from "../../../DB/models/brand.model.js";
import cloudinary from "../../services/fileUploads/cloudinary.js";
import generateUniqueString from "../../utils/generateUniqueString.js";

const addProduct = asyncHandler(async (req, res, next) => {
  const { title, description, price, discount, quantity } =
    req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  // check brands
  const brand = await Brand.findById(brandId);
  if (!brand) return next(new Error("brand not found", { cause: 404 }));
  if (brand.categoryId.toString() !== categoryId) {
    return next(new Error("category not found", { cause: 404 }));
  }
  if (brand.subCategoryId.toString() !== subCategoryId) {
    return next(new Error("subcategory not found", { cause: 404 }));
  }
  if (brand.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error("you are not allowed to add product to this brand", {
        cause: 403,
      })
    );
  }
  //calc total price of product or hook pre save
  const priceAfterDiscount = Number.parseInt(
    price - (price * discount || 0) / 100
  );  
  // check files
  if (!req.files)
    return next(new Error("please add imgs for your product", { cause: 400 }));

  // create unique folder name for each product
  const uniqueId = generateUniqueString(5);
  // upload images
  const imgs = [];
  let folder = brand.logo.id.split(`${brand.folderId}/`)[0];
  for (const file of req.files.images) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: folder + `${brand.folderId}` + `/product/${uniqueId}`,
      }
    );
    req.folder = folder + `${brand.folderId}` + `/product/${uniqueId}`;
    imgs.push({ id: public_id, url: secure_url });
  }

  // upload imgCover
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.files.imgCover[0].path,
    {
      folder: folder + `${brand.folderId}` + `/product/${uniqueId}`,
    }
  );
//rollbck
  req.folder = folder + `${brand.folderId}` + `/product/${uniqueId}`;

  const newProduct={
    ...req.body,
    categoryId,
    subCategoryId,
    brandId,
    cloudFolder: uniqueId,
    createdBy: req.user._id,
    slug: slugify(req.body.title, { lower: true, replacement: "-" }),
    // specefication: JSON.parse(specefication), //convert it to object  
    priceAfterDiscount,
    images: imgs,
    imgCover: { id: public_id, url: secure_url },
  }
  //creatr product
  const product = await Product.create(newProduct);
  //rollback
  req.savedDocument = { model: Product, condition: product._id };

  res.status(201).json({ message: "Product added successfuly", product });
});

const getAllProduct = asyncHandler(async (req, res) => {
  let apiFeature = new ApiFeature(Product.find(), req.query)
    .fields()
    .sort()
    .pagination({size:1})
    .filter()
    .search();
  const product = await apiFeature.mongoQuery.lean();
  res.status(200).json({ message: "All Product", product });
});

const OneProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ message: "product Not found" });
  res.status(200).json({ message: "product of this Id:", product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, price, discount, quantity ,oldImgsIDs,oldimgCoverID} =
    req.body;
  const { id } = req.params;
  //check product
  const isProduct = await Product.findById(id).populate([
    { path: "brandId", select: "folderId" },
  ]);
  if (!isProduct) return res.status(404).json({ message: "Product Not found" });
  //check owner
  if (isProduct.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new Error("you are not allowed to update product to this brand", {
        cause: 404,
      })
    );
  }

  // update images
  if (oldImgsIDs) {
    // check image
    if (!req.files.images)
      return next(
        new Error("insert new images of product please", { cause: 400 })
      );

    for (const oldImgID of oldImgsIDs) {
      const id = oldImgID.split(`${isProduct.folderId}/`)[1];
      //update img in cloudinary
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: id,
        }
      );

      isProduct.images.map((img) => {
        if (img.id === oldImgID) {
          img.url = secure_url;
        }
      });
    }
  }

  // update imgCover
  if (oldimgCoverID) {
    // check image
    if (!req.files.imgCover)
      return next(
        new Error("insert new imgCover of product please", { cause: 400 })
      );
    const newimgCoverID = isProduct.imgCover.id.split(`${isProduct.folderId}/`)[1];
    if (req.files.imgCover) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.files.imgCover[0].path,
        {
          public_id: newimgCoverID,
        }
      );
      isProduct.imgCover.map((img) => {
        if (img === oldimgCoverID) img.url = secure_url;
      });
    }
  }

  //update product
  const product = await Product.findByIdAndUpdate(isProduct._id, {
    ...req.body,
    slug: slugify(title, { lower: true, replacement: "-" }),
    // specefication: JSON.parse(specefication), //convert it to object
    priceAfterDiscount
  });

  res.status(200).json({ message: "product updated", product });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  // check Product
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "product Not found" });
  // check owner
  if (req.user._id.toString() != product.createdBy.toString())
    return next(new Error("you are not authorized", { cause: 401 }));

  // delete product
  await product.deleteOne();

  res.status(200).json({ message: "product deleted", product });
});

export { addProduct, getAllProduct, OneProduct, deleteProduct, updateProduct };
