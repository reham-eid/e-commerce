import { Router } from "express";
import * as ReviewController from "./review.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  uploadFiles,
  uploadSingleFile,
} from "../../services/fileUploads/multer.js";
import * as JoiVal from "./review.validation.js";
import { allowTo, protectedRoute } from "../../middlewares/auth.js";
import { status } from "../../utils/system.roles.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter
  .route("/")
  .post(
    protectedRoute,
    allowTo(status.user),
    uploadFiles("img"),
    validation(JoiVal.addReviewVal),
    ReviewController.addReview
  )
  .get(ReviewController.allReviews);

reviewRouter
  .route("/:id")
  .get(validation(JoiVal.paramsIdVal), ReviewController.OneReview)
  .put(
    protectedRoute,
    allowTo(status.user),
    uploadSingleFile("img"),
    validation(JoiVal.updateReviewVal),
    ReviewController.updateReview
  )
  .delete(
    protectedRoute,
    allowTo(status.user, status.admin),
    validation(JoiVal.paramsIdVal),
    ReviewController.deleteReview
  );

export default reviewRouter;
