function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.redirect('/unauthorized');
    }

    next();
  };
}

export { checkRole };
