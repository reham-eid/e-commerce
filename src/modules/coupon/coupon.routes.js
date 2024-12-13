import { Router } from "express";
import * as CouponController from "./coupon.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./coupon.validation.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { systemRoles } from "../../utils/system.roles.js";

const couponRouter = Router();

couponRouter.put("/apply-coupon",
    protectedRoute,
    allowTo(systemRoles.user),
    validation(JoiVal.paramsIdVal),
    CouponController.applyCoupon
  )
couponRouter.use(protectedRoute, allowTo(systemRoles.admin));

couponRouter
  .route("/")
  .post(validation(JoiVal.addCouponVal), CouponController.addCoupon)
  .get(CouponController.allCoupons);

couponRouter
  .route("/:code")
  .get(validation(JoiVal.paramsIdVal), CouponController.OneCoupon)
  .put(
    validation(JoiVal.updateCouponVal),
    CouponController.updateCoupon 
  )
  .delete(
    validation(JoiVal.updateCouponVal),
    validation(JoiVal.paramsIdVal),
    CouponController.deleteCoupon
  );

export default couponRouter;
