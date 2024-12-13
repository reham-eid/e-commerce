import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addToWishListVal = Joi.object({
  productId: generalField.id.required(),
});

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateWishListVal = Joi.object({
  productId: generalField.id.required(),
});

export { addToWishListVal, paramsIdVal, updateWishListVal };
