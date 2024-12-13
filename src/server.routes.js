import { globalError } from "./middlewares/globalError.js";
import { createHandler } from "graphql-http/lib/use/express";
import ducumentQL from "graphql-playground-middleware-express";
import { schema } from "./services/graphQL/graphQL.js";
import {
  rollbackSavedDoc,
  rollbackUploadFile,
} from "./middlewares/rollback.js";

import addressRouter from "./modules/address/address.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import brandRouter from "./modules/brand/brand.routes.js";
import CartRouter from "./modules/cart/cart.routes.js";
import categoryRouter from "./modules/category/category.routes.js";
import couponRouter from "./modules/coupon/coupon.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import productRouter from "./modules/product/product.routes.js";
import reviewRouter from "./modules/review/review.routes.js";
import SubCategoryRouter from "./modules/subCategory/subCategory.routes.js";
import userRouter from "./modules/user/user.routes.js";
import wishListRouter from "./modules/wishList/wishList.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json" assert { type: "json" };
// import { job } from "./utils/crons.js";
const expressPlayground = ducumentQL.default;

export const init = (app, express) => {

  app.use((req, res, next) => {
    if (req.originalUrl === "/api/v1/orders/webhook") {
      return next();
    }
    express.json()(req, res, next);
  });
  // app.use(express.urlencoded({ extended: true }));

  app.use("/graphql", createHandler({ schema }));
  app.get("/gui", expressPlayground({ endpoint: "/graphql" }));

  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/subcategories", SubCategoryRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/auth", authRouter),
    app.use("/api/v1/users", userRouter),
    app.use("/api/v1/reviews", reviewRouter),
    app.use("/api/v1/addresses", addressRouter),
    app.use("/api/v1/wishLists", wishListRouter),
    app.use("/api/v1/coupons", couponRouter);
  app.use("/api/v1/carts", CartRouter),
    app.use("/api/v1/orders", orderRouter),

    // swagger
app.use("/swaggwer-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    // Page Not Found
    app.use("*", (req, res, next) => {
      return next(
        new Error(`Page Not Found ${req.originalUrl}`, { cause: 404 })
      );
    });

  //GLOBAL ERROR
  app.use(globalError, rollbackUploadFile, rollbackSavedDoc);
  // job()
};
