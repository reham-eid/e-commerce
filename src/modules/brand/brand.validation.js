import Joi from "joi";
import generalField from "../../utils/generalFields.js";
import { validateObjectId } from "../../middlewares/validation.middleware.js";

const addBrandVal = Joi.object({
  name: generalField.name.min(2).required(),
  categoryId: generalField.id.required(),
  subCategoryId: generalField.id.required(),

  image: generalField.file.required(),
}).required();

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateBrandVal = Joi.object({
  name: generalField.name.min(2),
  id: generalField.id.required(),
  oldLogoID:generalField.name,
  subCategoryId: generalField.id,
  categoryId: generalField.id,

  image: generalField.file,
});

export { addBrandVal, paramsIdVal, updateBrandVal };
