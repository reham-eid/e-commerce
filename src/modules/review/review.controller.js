import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { deleteOne } from "../handler/handler.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import Review from "../../../DB/models/review.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import { calcReviewAvgRate } from "./review.service.js";

const addReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rate } = req.body;
  //check if user made order for this productId
  const isOrder = await Order.findOne({
    user: req.user._id,
    statusOfOrder: "delivered",
    "cart.productId": productId,
  });
  if (!isOrder) {
    return next(
      new Error(
        `Cant review product with id: ${productId} , if you not order it first! `,
        { cause: 400 }
      )
    );
  }
  // check past review (one review per product)
  if (
    await Review.findOne({
      userId: req.user._id,
      productId,
      orderId: isOrder._id,
    })
  ) {
    return next(new Error(`already reviewed by you! `, { cause: 409 }));
  }

  const review = new Review({
    comment,
    rate,
    userId: req.user._id,
    productId,
    orderId: isOrder._id,
  });
  if (req.file) {
    //upload img in cloudinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.CLOUD_FOLDER_NAME}/review/${review.userId}` }
    );
    req.folder = `${process.env.CLOUD_FOLDER_NAME}/review/${review.userId}`;
    review.image = { id: public_id, url: secure_url };
  }
  await review.save();
  req.savedDocument = { model: Review, condition: review._id };

  //calculate avrage rate in Product model
  const product = await calcReviewAvgRate(productId);
  //send res
  res
    .status(201)
    .json({ message: "Review added successfuly", review, product });
});

const allReviews = asyncHandler(async (req, res) => {
  let apiFeature = new ApiFeature(Review.find({}), req.query)
    .fields()
    .sort()
    .pagination()
    .filter();
  const reviews = await apiFeature.mongoQuery.lean();
  res.status(200).json({ message: "All Reviews", reviews });
});

const OneReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).lean();
  if (!review) return next(new Error("Review Not found", { cause: 404 }));
  res.status(200).json({ message: "Review of this Id:", review });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { id, productId } = req.params;
  const review = await Review.findOneAndUpdate(
    { _id: id, productId, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (req.body.rate) {
    const calcAvg = 0;
    const product = await Product.findById(productId);
    const reviews = await Review.find({ productId });

    for (let i = 0; i < reviews.length; i++) {
      calcAvg += reviews[i].rate;
    }
    product.rateAvg = calcAvg / reviews.length;
    await product.save();
  }
  if (!review) return next(new Error("Review Not found", { cause: 404 }));
  res.status(200).json({ message: "Review updated", review });
});

const deleteReview = deleteOne(Review);

export { addReview, allReviews, deleteReview, updateReview, OneReview };
