import Joi from "joi";
import generalField from "../../utils/generalFields.js";

const signUpVal = Joi.object({
  username: generalField.name.required(),
  email: generalField.email.required(),
  password: generalField.password.required(),
  confirmPassword: generalField.confirmPassword.required(),
  age: generalField.age,
  role: generalField.role,
  phone: Joi.string().pattern(
    new RegExp("^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$")
  ),
}).required();

const activeAccountVal = Joi.object({
  emailToken: generalField.name.required(),
}).required();

const loginVal = Joi.object({
  email: generalField.email.required(),
  password: generalField.password.required(),
}).required();

const logInWithGoogleVal = Joi.object({
  idToken: generalField.name.required(),
}).required();
const forgetPassVal = Joi.object({
  email: generalField.email.required(),
}).required();

const resetPassVal = Joi.object({
  emailToken: generalField.name.required(),
  newPassword: generalField.password.required(),
  confirmPassword: Joi.valid(Joi.ref("newPassword")).required(),
}).required();

export { signUpVal, activeAccountVal, loginVal,logInWithGoogleVal, forgetPassVal, resetPassVal };
