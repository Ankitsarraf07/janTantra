// Restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    if (!req.user.isApproved && req.user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by admin'
      });
    }
    next();
  };
};

// Restrict to user's own area (for citizens posting issues, feedback)
const restrictToArea = (req, res, next) => {
  const areaId = req.body.areaId || req.query.areaId || req.params.areaId;
  if (areaId && req.user.role === 'citizen') {
    const userAreaId = req.user.areaId?._id?.toString() || req.user.areaId?.toString();
    if (userAreaId && areaId !== userAreaId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access resources in your registered area'
      });
    }
  }
  next();
};

module.exports = { authorize, restrictToArea };
