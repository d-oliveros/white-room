
/**
 * Provides validation helpers
 */
export default function validationHelpers(req, res, next) {
  const { user } = req;

  req.validate = {
    hasAccess(id) {
      return user && id && (user._id.toString() === id.toString() || user.roles.admin);
    },

    hasRole(role) {
      return user && user.roles && user.roles[role];
    }
  };

  next();
}
