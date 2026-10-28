const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please log in first.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Your role (${req.user.role}) is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
