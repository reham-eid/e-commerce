export const pricCalc = async (model) => {
  let totalPrice = 0;
  model.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  model.totalPrice = totalPrice;

  await model.save();
};
