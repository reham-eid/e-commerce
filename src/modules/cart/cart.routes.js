import { Router } from "express";
import * as CartController from "./cart.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./cart.validation.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { systemRoles } from "../../utils/system.roles.js";

const CartRouter = Router();

CartRouter.route("/")
  .post(
    protectedRoute,
    allowTo(systemRoles.user),
    validation(JoiVal.addToCartVal),
    CartController.addCart
  )
  .get(protectedRoute, allowTo(systemRoles.user ), CartController.getLogedUserCart)
  .delete(protectedRoute, allowTo(systemRoles.user , systemRoles.admin), CartController.clearUserCart);

CartRouter.route("/:id")
  .get(
    protectedRoute,
    allowTo(systemRoles.admin),
    validation(JoiVal.paramsIdVal),
    CartController.getAllCart
  )
  .put(
    protectedRoute,
    allowTo(systemRoles.user , systemRoles.admin),
    validation(JoiVal.paramsIdVal),
    CartController.removeItemFromCart
  );

export default CartRouter;
