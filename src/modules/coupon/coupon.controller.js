import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import Coupon from "../../../DB/models/coupon.model.js";
import CouponUsers from "../../../DB/models/coupon.users.model.js";
import User from "../../../DB/models/user.model.js";
import {  CouponValidation } from "./service/coupon.service.js";

const addCoupon = asyncHandler(async (req, res, next) => {
  const { code, discount, isFixed, isPercentage, fromDate, toDate, users } =
    req.body;
  // check dublicate coupon
  const isCoupon = await Coupon.findOne({ code });
  if (isCoupon) {
    return next(
      new Error(`there is a coupon with the same code ${code}`, { cause: 409 })
    );
  }
  //check on discount number
  if (isFixed == isPercentage) {
    return next(
      new Error(`coupon can be either Fixed or Percentage`, { cause: 400 })
    );
  }
  if (isPercentage) {
    if (discount > 100) {
      return next(
        new Error(`coupon Percentage cant be ${isPercentage}% !!!`, {
          cause: 400,
        })
      );
    }
  }
  // create Coupon
  const coupon = await Coupon.create({
    ...req.body,
    createdBy: req.user._id,
  });

  let ids = [];
  for (const user of users) {
    ids.push(user.userId)
  }
  const isUser = await User.find({ _id: { $in: ids } });

  if (isUser.length != users.length) {
    return next(new Error(`user not found`, { cause: 404 }));
  }
  const allowedUser = await CouponUsers.create(
    users.map((ele) => ({ ...ele, code: coupon._id }))
  );
  res.status(201).json({ message: "Coupon added successfuly", coupon ,allowedUser});
});

const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const { _id:userId } = req.user._id;
const couponValid = await CouponValidation(code ,userId )
if(couponValid.status){
  return next({message:couponValid.msg , cause:couponValid.status})
}
  //send res
  res.status(201).json({ message: "apply Coupon siccessfully", coupon:couponValid });
});

const allCoupons = asyncHandler(async (req, res) => {
  let apiFeature = new ApiFeature(Coupon.find({}), req.query)
    .fields()
    .sort()
    .pagination()
    .filter();
  const coupons = await apiFeature.mongoQuery.lean();
  res.status(201).json({ message: "All Coupons", coupons });
});

const OneCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).lean();
  if (!coupon) return res.status(404).json({ message: "Coupon Not found" });
  res.status(200).json({ message: "Coupon of this Id:", coupon });
});

const updateCoupon = asyncHandler(async (req, res, next) => {
  // check coupon
  const coupon = await Coupon.findOne({
    code: req.params.code,
    createdBy: req.user._id,
    expires: { $gt: Date.now() },
  });
  if (!coupon) return res.status(404).json({ message: "Invalid Coupon" });
  // check owner
  if (coupon.createdBy.toString() !== req.user._id.toString())
    return next(new Error("you are not authorized", { cause: 401 }));
  // update
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expires = req.body.expires
    ? new Date(req.body.expires).getTime()
    : coupon.expires;

  await coupon.save();
  res.status(200).json({ message: "Coupon updated", coupon });
});

const deleteCoupon = asyncHandler(async (req, res, next) => {
  // check coupon
  const coupon = await Coupon.findOne({
    code: req.params.code,
    createdBy: req.user._id,
    expires: { $gt: Date.now() },
  });
  if (!coupon) return res.status(404).json({ message: "Coupon Not found" });
  // check owner
  if (req.user._id.toString() !== coupon.createdBy.toString())
    return next(new Error("you are not authorized", { cause: 401 }));
  // delete
  await coupon.deleteOne();

  res.status(200).json({ message: "Coupon deleted", coupon });
});

export { addCoupon,applyCoupon, allCoupons, deleteCoupon, updateCoupon, OneCoupon };
