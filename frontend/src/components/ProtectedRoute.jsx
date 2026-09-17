import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("helpdesk_token");
  const rawUser = localStorage.getItem("helpdesk_user");

  if (!token || !rawUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    const fallback =
      user?.role === "ADMIN" ? "/admin/dashboard" :
      user?.role === "AGENT" ? "/agent/dashboard" :
      "/customer/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
