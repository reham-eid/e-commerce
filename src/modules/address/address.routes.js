import { Router } from "express";
import * as addressController from "./address.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./address.validation.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { status } from "../../utils/system.roles.js";

const addressRouter = Router();

addressRouter
  .route("/")
  .patch(
    protectedRoute,
    allowTo(status.user),
    validation(JoiVal.addAddressVal),
    addressController.addAddress
  )
  .get(protectedRoute, allowTo(status.user), addressController.getaddress);

addressRouter
  .route("/:id")
  .delete(
    protectedRoute,
    allowTo(status.user , status.admin),
    validation(JoiVal.paramsIdVal),
    addressController.removeAddress
  );

export default addressRouter;
