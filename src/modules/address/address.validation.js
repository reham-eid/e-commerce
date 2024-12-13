import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addAddressVal = generalField.address.required();

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

const updateAddress = Joi.object({
  id: generalField.id.required(),

  street:generalField.name,
  city:generalField.name,
});

export { addAddressVal, paramsIdVal, updateAddress };
