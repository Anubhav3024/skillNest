import { Fragment } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const RouteGuard = ({ authenticated, user, element }) => {
  const location = useLocation();

  if (
    !authenticated &&
    !location.pathname.includes("/auth") &&
    location.pathname !== "/"
  ) {
    return <Navigate to="/auth" />;
  }

  if (
    authenticated &&
    user?.role === "instructor" &&
    !location.pathname.includes("/instructor") &&
    location.pathname !== "/"
  ) {
    return <Navigate to="/instructor" />;
  }

  if (
    authenticated &&
    user?.role === "student" &&
    (location.pathname.includes("/instructor") ||
      location.pathname.includes("/auth"))
  ) {
    return <Navigate to="/" />;
  }

  return <Fragment>{element}</Fragment>;
};

RouteGuard.propTypes = {
  authenticated: PropTypes.bool,
  user: PropTypes.object,
  element: PropTypes.node,
};

export default RouteGuard;
