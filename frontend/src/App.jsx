
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AcceptInvitation from "./pages/AcceptInvitation";

import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerTickets from "./pages/CustomerTickets";
import CreateTicket from "./pages/CreateTicket";
import CustomerTicketDetails from "./pages/CustomerTicketDetails";

import AgentDashboard from "./pages/AgentDashboard";
import AgentTickets from "./pages/AgentTickets";
import AgentTicketDetails from "./pages/AgentTicketDetails";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminTickets from "./pages/AdminTickets";
import AdminTicketDetails from "./pages/AdminTicketDetails";

function RoleRoute({ role, children }) {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      {children}
    </ProtectedRoute>
  );
}

function Landing() {
  const rawUser = localStorage.getItem("helpdesk_user");

  if (!rawUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(rawUser);

    if (user?.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === "AGENT") {
      return <Navigate to="/agent/dashboard" replace />;
    }

    return <Navigate to="/customer/dashboard" replace />;
  } catch {
    localStorage.removeItem("helpdesk_user");
    localStorage.removeItem("helpdesk_token");

    return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/accept-invitation/:token"
        element={<AcceptInvitation />}
      />

      <Route
        path="/customer/dashboard"
        element={
          <RoleRoute role="CUSTOMER">
            <CustomerDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/customer/tickets"
        element={
          <RoleRoute role="CUSTOMER">
            <CustomerTickets />
          </RoleRoute>
        }
      />

      <Route
        path="/customer/tickets/create"
        element={
          <RoleRoute role="CUSTOMER">
            <CreateTicket />
          </RoleRoute>
        }
      />

      <Route
        path="/customer/tickets/:id"
        element={
          <RoleRoute role="CUSTOMER">
            <CustomerTicketDetails />
          </RoleRoute>
        }
      />

      <Route
        path="/agent/dashboard"
        element={
          <RoleRoute role="AGENT">
            <AgentDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/agent/tickets"
        element={
          <RoleRoute role="AGENT">
            <AgentTickets />
          </RoleRoute>
        }
      />

      <Route
        path="/agent/tickets/:id"
        element={
          <RoleRoute role="AGENT">
            <AgentTicketDetails />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute role="ADMIN">
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RoleRoute role="ADMIN">
            <AdminUsers />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <RoleRoute role="ADMIN">
            <AdminCategories />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <RoleRoute role="ADMIN">
            <AdminTickets />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/tickets/:id"
        element={
          <RoleRoute role="ADMIN">
            <AdminTicketDetails />
          </RoleRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
