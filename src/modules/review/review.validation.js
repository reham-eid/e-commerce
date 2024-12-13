import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addReviewVal = Joi.object({
  comment: generalField.name.min(2).max(500).optional(),
  rate: generalField.count.min(1).max(5).required(),
  productId: generalField.id.required(),
  image: generalField.file.optional(),

});

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateReviewVal = Joi.object({
  id: generalField.id.required(),
  productId: generalField.id.required(),

  comment: generalField.name.min(2).max(500),
  rate: generalField.count.min(1).max(5),
  image: generalField.file.optional(),

});

export { addReviewVal, paramsIdVal, updateReviewVal };
