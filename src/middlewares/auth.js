import { asyncHandler } from "./asyncHandler.js";
import User from "../../DB/models/user.model.js";
import { generateToken, verifyToken } from "../utils/GenerateAndVerifyToken.js";

const protectedRoute = asyncHandler(async (req, res, next) => {
  // get Token
  const { token } = req.headers;
  //token exisit 401

  try {
    // verify token
    const payload = verifyToken({ token });
    //check data in payload
    if (!payload?.userId) {
      return next(new Error("Invalid token payload ", { cause: 400 }));
    }
    // check User by token.userId
    const user = await User.findById(payload.userId);
    // if not exisit res
    if (!user) return next(new Error("Not register yet..", { cause: 401 }));
    if (user?.changePassAt) {
      const time = parseInt(user?.changePassAt.getTime() / 1000);
      // time > token it means token older (invalid)
      if (time > payload.iat) {
        next(
          new Error("you change your password ... please login again ", {
            cause: 400,
          })
        );
      }
    }
    req.user = user;
    next();
  } catch (error) {
    if (error == "TokenExpiredError: jwt expired") {
      // find in user model by user's token
      const user = await User.findOne({ token });
      // if not exisit res
      if (!user)
        return next(
          new Error("there is no user for this token", { cause: 401 })
        );
      // re-generate token by userId
      const refreshedToken = generateToken({
        payload: { userId: user._id, role: user.role },
        expiresIn: "30d",
      });
      //save token in in user collection
      user.token = refreshedToken;
      await user.save();
      return res
        .status(200)
        .json({ message: "refreshed token..", token: refreshedToken });
    }
  }
});

const allowTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error("you are not authorized", { cause: 401 }));
    }
    next();
  });
};

export { protectedRoute, allowTo };
