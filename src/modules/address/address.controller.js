import User from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

const addAddress = asyncHandler(async (req, res, next) => {
  const { address } = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true }
  );
  if (!address) return next({ cause: 404, message: "address Not found" });
  res.status(201).json({ message: "address updated", address });
});
const removeAddress = asyncHandler(async (req, res, next) => {
  const { address } = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { address: { _id: req.params.id } } }, // productId in address array ,
    { new: true }
  );
  if (!address) return next({ cause: 404, message: "address Not found" });
  res.status(200).json({ message: "address updated", address });
});
const getaddress = asyncHandler(async (req, res, next) => {
  const { addresses } = await User.findById(req.user._id).lean();
  if (!address) return next({ cause: 404, message: "address Not found" });
  res.status(200).json({ message: "addresses : ", addresses });
});
export { addAddress, removeAddress, getaddress };
