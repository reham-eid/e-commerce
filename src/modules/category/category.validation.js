import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addCategoryVal = Joi.object({
  name: generalField.name.min(2).max(50).required(),
  image:generalField.file.required(),
});

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateCategoryVal = Joi.object({
  name: generalField.name.min(2).max(50),
  id: generalField.id.required(),

  image: generalField.file.optional(),
});

export { addCategoryVal, paramsIdVal, updateCategoryVal };
