import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addCouponVal = Joi.object({
  code: generalField.name.trim().max(8).min(1).required(),
  discount: generalField.count.min(1).required(),
  fromDate: generalField.expires.required(),
  toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
  isFixed: Joi.boolean().optional(),
  isPercentage: Joi.boolean().optional(),
  users: Joi.array().items(
    Joi.object({
      userId: generalField.id.required(),
      maxUsage: generalField.count.min(1).required(),
    })
  ),
}).required();

const paramsIdVal = Joi.object({
  code: generalField.name.length(8).required(),
}).required();

const updateCouponVal = Joi.object({
  code: generalField.name.trim().max(8).min(1),
  discount: generalField.count.min(1),
  fromDate:  generalField.expires,
  isPercentage: generalField.name,
  toDate: generalField.name,
  isFixed: Joi.boolean().optional(),
  isPercentage: Joi.boolean().optional(),
}).required();

export { addCouponVal, paramsIdVal, updateCouponVal };
