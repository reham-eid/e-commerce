import User from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import { deleteOne } from "../handler/handler.js";

const adduser = asyncHandler(async (req, res) => {
  let user = new User(req.body);

  await user.save();
  req.savedDocument = { model: User, condition: user._id };

  res.status(201).json({ message: "user added successfuly" });
});

const allUsers = asyncHandler(async (req, res) => {
  let apiFeature = new ApiFeature(User.find({}), req.query)
    .fields()
    .sort()
    .pagination()
    .filter();

  const users = await apiFeature.mongoQuery.populate([
    { path: "wishList", select: "title" },
  ]).lean();
  res.status(200).json({ message: "All user", users });
});

const Oneuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if(!user) return res.status(404).json({ message: "user Not found" }); 
  res.status(200).json({ message: "user of this Id:", user });
});

const updateuser = asyncHandler(async (req, res, next) => {
  // find by email & user not the owner
  const isExisit = await User.findOne({
    email: req.body.email,
    _id: { $ne: req.user._id },
  });
  isExisit && next(new Error("sorry it is not your email", { cause: 400 }));
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...req.body },
    {
      new: true,
    }
  );
  !user && res.status(404).json({ message: "user Not found" });
  user && res.status(200).json({ message: "user updated", user });
});

const deleteuser = deleteOne(User);

export { allUsers, adduser, Oneuser, deleteuser, updateuser };
