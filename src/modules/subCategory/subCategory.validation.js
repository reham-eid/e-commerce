import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addSubCategoryVal = Joi.object({
  name: generalField.name.min(2).max(50).required(),
  category: generalField.id.required().error(new Error('subCategory must be belong to its Category')),
  image: generalField.file.required()
});

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
  category: generalField.id.required().error(new Error('subCategory must be belong to its Category')),

});

const updateSubCategoryVal = Joi.object({
  id: generalField.id.required(),

  name: generalField.name.min(2).max(50),
  category: generalField.id.required().error(new Error('subCategory must be belong to its Category')),
  image: generalField.file

});

export { addSubCategoryVal, paramsIdVal, updateSubCategoryVal };
