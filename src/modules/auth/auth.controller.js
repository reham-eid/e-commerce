import User from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { htmlCode, htmlMail } from "../../services/emails/htmlTemplete.js";
import { sendEmail } from "../../services/emails/sendEmail.js";
import bcryptjs from "bcryptjs";
import randomstring from "randomstring";
import { status, systemRoles } from "../../utils/system.roles.js";
import {
  generateToken,
  verifyToken,
} from "../../utils/GenerateAndVerifyToken.js";
import { OAuth2Client } from "google-auth-library";
import generateUniqueString from "../../utils/generateUniqueString.js";

const signUp = asyncHandler(async (req, res, next) => {
  //get data from req
  let { email, username, password, confirmPassword } = req.body;
  //check data
  const isExisit = await User.findOne({ email });
  if (isExisit) return next(new Error("User already exisit", { cause: 409 }));
  // if not exisit hash pass in user.model.js
  //generate token from email
  const emailToken = generateToken({
    payload: { email },
    expiresIn: "30m",
  });

  // create confirmatiom link
  //http://localhost:4001/api/v1
  const link = `${req.protocol}://${req.headers.host}/api/v1/auth/acctivate_account/${emailToken}`;

  // send confirmation link
  const isEmail = await sendEmail({
    to: email,
    subject: "Acctive your account...",
    html: htmlMail(link),
  });
  if (!isEmail) {
    return next(new Error("Email Confirmatiom is not send", { cause: 500 }));
  }
  // create user
  const user = await User.create({ ...req.body });
  req.savedDocument = { model: User, condition: user._id };
  // send res
  res.status(201).json({
    success: true,
    message: "sign up successfuly, Now check your email",
    user: user.username,
  });
});

const activeAccount = asyncHandler(async (req, res, next) => {
  //find user by emailToken
  const { emailToken } = req.params;
  const { email } = verifyToken({ token: emailToken });
  if (!email) {
    return next(
      new Error("Invalid Email Token , please try to signup again", {
        cause: 400,
      })
    );
  }
  //update isEmailConfirm
  const user = await User.findOneAndUpdate(
    { email, isEmailConfirm: false },
    { isEmailConfirm: true },
    { new: true }
  );

  if (!user) return next(new Error("user Not found", { cause: 404 }));
  //send res
  res.status(200).json({ message: "acctivate your account successfuly", user });
});

const logIn = asyncHandler(async (req, res, next) => {
  //get data from req
  const { email, password } = req.body;
  //check data by email
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User Not found", { cause: 404 }));
  //check isEmailConfirm
  if (!user.isEmailConfirm) {
    return next(new Error("please acctive your account first", { cause: 400 }));
  }
  //compare password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) {
    return next(new Error("Incorrect Password", { cause: 400 }));
  }
  //generate token
  const token = generateToken({
    payload: { userId: user._id, role: user.role },
    expiresIn: 40,
  });
  //update the status to online & token
  user.status = systemRoles.online;
  user.token = token;
  await user.save();
  //send res
  res
    .status(200)
    .json({ success: true, message: "logIn successfuly", accsessToken: token });
});

// const signupWithGoogle = asyncHandler(async (req, res, next) => {
//   const { idToken } = req.body;
//   const client = new OAuth2Client();
//   async function verify() {
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: process.env.CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     return payload;
//   }
//   const result = await verify().catch(console.error);
//   if (result.email_verified !== true) {
//     return next(
//       new Error("email is not verified , please enter another google email", {
//         cause: 400,
//       })
//     );
//   }
//   //check data
//   const isExisit = await User.findOne({ email: result.email });
//   if (isExisit) return next(new Error("User already exisit", { cause: 409 }));
//   //generate random password
//   const randomPass = generateUniqueString();

//   // create user
//   const user = await User.create({
//     ...req.body,
//     email:result.email,
//     password: randomPass,
//     username: result.name,
//     isEmailConfirm:true,
//     provider:"GOOGLE"
//   });
//   req.savedDocument = { model: User, condition: user._id };
//   // send res
//   res.status(201).json({
//     message: "sign up successfully with google",
//     user: user.username,
//   });
// });

const logInWithGoogle = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const result = await verify().catch(console.error);
  if (result.email_verified !== true) {
    return next(
      new Error("email is not verified , please enter another google email", {
        cause: 400,
      })
    );
  }

  //check data by email
  const user = await User.findOne({ email: result.email, provider: "GOOGLE" });
  if (!user) return next(new Error("User Not found", { cause: 404 }));
  //generate token
  const token = generateToken({
    payload: { userId: user._id, email: result.email },
    expiresIn: 40,
  });
  //update the status to online
  user.status = status.online;
  user.token = token;
  await user.save();

  res.status(200).json({ message: "login successfully with google", result });
});

const forgetPass = asyncHandler(async (req, res, next) => {
  // get email from req
  const { email } = req.body;
  // check email in db
  const user = await User.findOne({ email });
  if (!user) return next(new Error("invalid email", { cause: 400 }));
  // check isEmailConfirm
  if (!user.isEmailConfirm)
    return next(
      new Error("Your account is not acctivate at all..", { cause: 400 })
    );
  //generate forgetCode
  const forgetCode = randomstring.generate({
    charset: "numeric",
    length: 5,
  });
  //hash forgetCode in user model
  const hashedForgetCode = bcryptjs.hashSync(forgetCode, +process.env.SALT);

  //save forgetCode to User model
  user.forgetCode = hashedForgetCode;
  await user.save();

  // generate token
  const emailToken = generateToken({
    payload: { email, forgetCode: user.forgetCode },
    expiresIn: "1h",
  });
  // create resetPassword link
  const link = `${req.protocol}://${req.headers.host}/api/v1/auth/reset-password/${emailToken}`;

  // send forgetCode (go to api resetPass)
  const isSent = await sendEmail({
    to: email,
    subject: "Reset Password",
    html: htmlCode({
      link,
      linkData: "click to Reset Your Password",
    }),
  });
  if (!isSent) {
    return next(
      new Error(
        "faild to send link of Reset Password email .. please try again",
        { cause: 500 }
      )
    );
  }
  // send res
  res.status(200).json({
    message:
      "You can Reset your password Now we have send you a code , check your Email😉👌",
    username: user.username,
  });
});

const resetPass = asyncHandler(async (req, res, next) => {
  //get data from req
  const { newPassword, confirmPassword } = req.body;
  const { emailToken } = req.query;
  //find user by emailToken
  const { email, forgetCode } = verifyToken({ token: emailToken });
  // check user
  const user = await User.findOne({ email, forgetCode });
  if (!user) {
    return next(
      new Error("you already reset your password.. try to login now", {
        cause: 400,
      })
    );
  }
  //compare 2-passwords
  const match = bcryptjs.compareSync(newPassword, user.password);
  // hash & update password
  if (match) {
    return next(
      new Error(
        "new password is the same as old password .. please change it",
        { cause: 409 }
      )
    );
  }
  user.password = newPassword;
  user.changePassAt = Date.now();
  user.forgetCode = null;
  const resetPassword = await user.save();

  //send res
  res.status(200).json({
    message: "reset your Password successfuly , try to login now",
    resetPassword,
  });
});

export { signUp, activeAccount, logIn, forgetPass, resetPass };
