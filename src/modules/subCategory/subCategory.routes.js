import { Router } from "express";
import * as SubCategoryController from "./subCategory.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as JoiVal from "./subCategory.validation.js";
import { uploadSingleFile } from "../../services/fileUploads/multer.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { status } from "../../utils/system.roles.js";

const SubCategoryRouter = Router({mergeParams:true});

SubCategoryRouter.use(protectedRoute, allowTo(status.admin));

SubCategoryRouter
  .route("/")
  .post(
    uploadSingleFile("img-Subcategory"),
    validation(JoiVal.addSubCategoryVal),
    SubCategoryController.addSubCategory
  )
  .get(SubCategoryController.allSubCategories);

SubCategoryRouter
  .route("/:id")
  .get(validation(JoiVal.paramsIdVal), SubCategoryController.OneSubCategory)
  .put(
    uploadSingleFile("img-Subcategory"),
    validation(JoiVal.updateSubCategoryVal),
    SubCategoryController.updateSubCategory
  )
  .delete(
    validation(JoiVal.paramsIdVal),
    SubCategoryController.deleteSubCategory
  );

export default SubCategoryRouter;
