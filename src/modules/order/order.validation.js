import Joi from "joi";
import generalField from "../../utils/generalFields.js";
import { payStatus } from "../../utils/system.roles.js";

const addOrderVal = Joi.object({
  id: generalField.id.required(),

  quantity: generalField.count.required(),
  street:generalField.name.required(),
  city:generalField.name.required(),
  couponCode:generalField.name.optional(),
  phoneNumbers:Joi.array().items(generalField.phone).required(),
  payment: generalField.name.valid(...Object.values(payStatus)),
});
const addFastOrderVal = Joi.object({
  productId: generalField.id.required(),
  quantity: generalField.count.required(),
  street:generalField.name.required(),
  city:generalField.name.required(),
  couponCode:generalField.name.optional(),
  phoneNumbers:Joi.array().items(generalField.phone).required(),
  payment: generalField.name.valid(...Object.values(payStatus)),
});

const paramsIdVal = Joi.object({
  orderId: generalField.id.required(),
});

const updateOrderVal = Joi.object({
  name: generalField.name.min(2).max(50),
  id: generalField.id.required(),

  image: generalField.file.optional(),
});

export { addOrderVal, paramsIdVal, updateOrderVal, addFastOrderVal };
