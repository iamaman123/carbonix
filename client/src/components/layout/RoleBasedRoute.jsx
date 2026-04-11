import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PropTypes from "prop-types";

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for auth to resolve before redirecting

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "BOTH") {
    return children;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "PRODUCER") return <Navigate to="/dashboard/producer" replace />;
    if (user.role === "CONSUMER") return <Navigate to="/dashboard/consumer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
