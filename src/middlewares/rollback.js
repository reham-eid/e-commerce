import cloudinary from "../services/fileUploads/cloudinary.js";

export const rollbackUploadFile = async (req, res, next) => {
  // asyncHandler?
  if (req.folder) {
    await cloudinary.api.delete_resources_by_prefix(req.folder);
    await cloudinary.api.delete_folder(req.folder);
    return res.json({message:"delete cloudinary folder , Unexpected Error Occurce"})
  }
  next();
};

export const rollbackSavedDoc = async (req, res, next) => {
  if (req.savedDocument) {
    const { model, condition } = req.savedDocument;
    await model.findByIdAndDelete(condition)
    return res.json({message:"unsaved document , Unexpected Error Occurce"})
  }
};
