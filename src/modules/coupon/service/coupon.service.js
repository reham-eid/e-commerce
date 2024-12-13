import Coupon from "../../../../DB/models/coupon.model.js";
import CouponUsers from "../../../../DB/models/coupon.users.model.js";

export async function CouponValidation(code, user) {
  // check coupon in couponModel
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return { msg: "Invalid Coupon", status: 404 };
  // check expired or not
  if (
    coupon.couponStatus == "expired" ||
    new Date(coupon.toDate).getTime() < Date.now()
  ) {
    return { msg: " Coupon expired", status: 404 };
  }
  // check after start date
  if (Date.now() < new Date(coupon.fromDate).getTime()) {
    return { msg: `Coupon starts at ${Date(coupon.fromDate)}`, status: 404 };
  }
  // user cases
  // check if user has this coupon
  const isUser = await CouponUsers.findOne({ code:coupon._id, user });
  if (!isUser) return { msg: `this coopon is not assign to you!`, status: 400 };
  // check if usage of this coupon is complete for this user
  if (isUser.maxUsage <= isUser.useageCount) {
    return {
      msg: `you have been used your maximum Usage of this coupon!`,
      status: 404,
    };
  }
  return coupon;
}
