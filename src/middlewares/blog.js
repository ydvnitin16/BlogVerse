function validateBlog(req, res, next) {
  const { title, content, category } = req.body;

  if (
    [title, content, category].some(
      (field) => field === null || field === undefined || field.trim() === ""
    )
  ) {
    return res.status(400).json({ message: "Fields can't be empty" });
  }
  
  next();
}


export { validateBlog };
