import Joi from "joi";
import generalField from "../../utils/generalFields.js";

// const val = (value, helper) => {
//   // console.log("dfs");
//   // console.log(value);
//   // console.log(typeof value)
//   const filterObj = JSON.stringify(value);
// // console.log("filterObj",filterObj);
//   const spes = JSON.parse(filterObj)
//   console.log(typeof spes);
//   console.log("spes",spes);
// for (const key in spes) {
//     console.log("ele",key);
// }
// };
const addProductVal = Joi.object({
  title: generalField.name.min(2).max(50).required(),
  description: generalField.name.min(10).max(100).required(),
  price: generalField.count.unit("pound").required(),
  discount: generalField.count.min(0).optional(),
  quantity: generalField.count
    .min(1)
    .rule({ message: " *quantity* must at least one" })
    .optional(),
  // specefication: Joi.custom(val),
  createdBy: generalField.id.optional(),
  categoryId: generalField.id,//
  subCategoryId: generalField.id,//
  brandId: generalField.id,//

  imgCover: Joi.array().items(generalField.file),
  images: Joi.array().items(generalField.file),
});

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateProductVal = Joi.object({
  id: generalField.id.required(),

  title: generalField.name.min(2).max(50),
  description: generalField.name.min(10).max(100),
  price: generalField.count,
  priceAfterDiscount: generalField.count.min(0).optional(),
  quantity: generalField.count.min(0).optional(),
  oldimgCoverID: Joi.array().items(generalField.id).optional(),
  oldImgsIDs: generalField.id.optional(),
  createdBy: generalField.id.optional(),

  imgCover: Joi.array().items(generalField.file),
  images: Joi.array().items(generalField.file),
});

export { addProductVal, paramsIdVal, updateProductVal };

