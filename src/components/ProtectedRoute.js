import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location   = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role       = localStorage.getItem("role") || "";

  // Not logged in → send to login, remember where they came from
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Wrong role → redirect to their correct page
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const fallback =
      role === "admin"     ? "/admin"     :
      role === "staff"     ? "/staff"     :
      role === "reception" ? "/reception" : "/dashboard";

    return <Navigate to={fallback} replace />;
  }

  return children;
}