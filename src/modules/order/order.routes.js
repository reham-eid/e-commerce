import { Router } from "express";
import * as OrderController from "./order.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./order.validation.js";
import express from "express";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { systemRoles } from "../../utils/system.roles.js";
const orderRouter = Router();

orderRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }), // req.body>>buffer data
  OrderController.stripeWebhook //stripeWebhookLocal
); //stripe

orderRouter
  .route("/:id")
  .post(
    protectedRoute,
    allowTo(systemRoles.user),
    validation(JoiVal.addOrderVal),
    OrderController.createCashOrderFromCart
  )
  .put(
    protectedRoute,
    allowTo(systemRoles.delievery),
    validation(JoiVal.paramsIdVal),
    OrderController.deliveredOrder
  )
orderRouter.post(
  "/pay-with-stripe/:orderId",
  protectedRoute,
  allowTo(systemRoles.user),
  validation(JoiVal.paramsIdVal),
  OrderController.payWithStripe
);
orderRouter.post(
  "/refund-order/:orderId",
  protectedRoute,
  allowTo(systemRoles.admin),
  validation(JoiVal.paramsIdVal),
  OrderController.refundOrder
);
orderRouter.get(
  "/all",
  protectedRoute,
  allowTo(systemRoles.admin),
  OrderController.allOrders
);
orderRouter
  .route("/")
  .get(protectedRoute, allowTo(systemRoles.user), OrderController.OneOrder)
  .post(
    protectedRoute,
    allowTo(systemRoles.user),
    validation(JoiVal.addFastOrderVal),
    OrderController.createOrder
  )

export default orderRouter;
