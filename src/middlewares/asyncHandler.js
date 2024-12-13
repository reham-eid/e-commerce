export const asyncHandler = (controller) => {
  return (req, res, next) => {
    return controller(req, res, next).catch(async (err) => {
      console.log(err);
      return next(new Error(err));
    });
  };
};
