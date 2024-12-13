export const globalError = (err, req, res, next) => {
  if (err) {
    res
      .status(err.cause || 500)
      //.status(["cause"] || 500)
      .json({
        message: "Catch Error",
        error_msg: err.message || err,
        stack: err.stack,
      });
  }
  next();
};
