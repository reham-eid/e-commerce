import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware.js";
import * as userValidation from "./user.validation.js";
import * as userController from "./user.controller.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { systemRoles } from "../../utils/system.roles.js";

const userRouter = Router();

userRouter
  .get("/allUsers", userController.allUsers)
  .get("/one_user", userController.Oneuser)

  .post(
    "/add_user",
    protectedRoute,
    allowTo(systemRoles.admin),
    validation(userValidation.addUserVal),
    userController.adduser
  )
  .put(
    "/update_user/",
      protectedRoute,
    allowTo(systemRoles.admin, systemRoles.user),
    validation(userValidation.updateUserVal),
    userController.updateuser
  )
  .delete(
    "/delete_user/:id",
    protectedRoute,
    allowTo(systemRoles.admin),
    validation(userValidation.paramsIdVal),
    userController.deleteuser
  );

export default userRouter;
