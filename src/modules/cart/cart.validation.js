import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addToCartVal = Joi.object({
  productId:generalField.id.required(),
  // quantity:Joi.number(),
  // will convert it to string then concate the price , not calculate it>> to solve it
  quantity:generalField.count.options({convert:false}),
  // in postman "quantity":12
});

const paramsIdVal = Joi.object({
  id:generalField.id.required(),
});
const updateQuantity = Joi.object({
  id:generalField.id.required(),

  quantity:generalField.count.options({convert:false}).required()
});

export { addToCartVal, paramsIdVal, updateQuantity };
