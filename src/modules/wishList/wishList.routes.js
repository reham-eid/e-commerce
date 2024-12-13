import { Router } from "express";
import * as WishListController from "./wishList.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./wishList.validation.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { status } from "../../utils/system.roles.js";

const wishListRouter = Router();

wishListRouter
  .route("/")
  .patch(
    protectedRoute,
    allowTo(status.user),
    validation(JoiVal.addToWishListVal),
    WishListController.addToWishList
  )
  .get(protectedRoute, allowTo(status.user), WishListController.getWishList);

wishListRouter
  .route("/:id")
  .delete(
    protectedRoute,
    allowTo(status.user, status.admin),
    validation(JoiVal.paramsIdVal),
    WishListController.removeFromWishList
  );

export default wishListRouter;
