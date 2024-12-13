import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const addUserVal = Joi.object({
  username: generalField.name.required(),
  email: generalField.email.required(),
  password: generalField.password.required(),
  confirmPassword: generalField.confirmPassword.required(),
  age: generalField.age,
  role: generalField.role,
}).required();

const updateUserVal = Joi.object({
  username: generalField.name,
  email: generalField.email,
  password: generalField.password,
  confirmPassword: generalField.confirmPassword,
  age: generalField.age,
  role: generalField.role,
}).required();

const paramsIdVal = Joi.object({
  id: generalField.id.required(),
});

export { addUserVal, updateUserVal, paramsIdVal };
