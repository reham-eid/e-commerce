import Product from "../../../DB/models/product.model.js";
import Review from "../../../DB/models/review.model.js";

export const calcReviewAvgRate = async (productId) => {
  const calcAvg = 0;
  const product = await Product.findById(productId);
  const reviews = await Review.find({ productId });

  for (let i = 0; i < reviews.length; i++) {
    calcAvg += reviews[i].rate;
  }
  product.rateAvg = Number(calcAvg / reviews.length).toFixed(2);
  await product.save();
};
