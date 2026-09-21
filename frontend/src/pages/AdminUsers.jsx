import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  Avatar,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  PageHeader,
  formatDate,
} from "../components/Ui";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [saving, setSaving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "AGENT",
  });

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/users");
      const data = response?.data || {};

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (
        data.data &&
        Array.isArray(data.data.users)
      ) {
        setUsers(data.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("ADMIN USERS LOAD ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load users.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        role === "ALL" || user.role === role;

      const searchText =
        `${user.name || ""} ${user.email || ""}`.toLowerCase();

      const matchesSearch =
        !search ||
        searchText.includes(search.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [users, role, search]);

  const changeRole = async (id, newRole) => {
    setSaving(id);
    setError("");

    try {
      await api.put(`/admin/users/${id}/role`, {
        role: newRole,
      });

      await load();
    } catch (err) {
      console.error("ROLE UPDATE ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update user role."
      );
    } finally {
      setSaving(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setDeleteTarget({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    setError("");
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteTarget(null);
  };

  // Delete selected user
  const deleteUser = async () => {
    if (!deleteTarget) return;

    setDeleting(deleteTarget.id);
    setError("");

    try {
      await api.delete(
        `/admin/users/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      await load();
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete user."
      );
    } finally {
      setDeleting(null);
    }
  };

  const openInvite = () => {
    setInviteForm({
      name: "",
      email: "",
      role: "AGENT",
    });

    setInviteError("");
    setInviteSuccess("");
    setInvitationUrl("");
    setInviteLoading(false);
    setShowInvite(true);
  };

  const closeInvite = () => {
    if (inviteLoading) return;

    setShowInvite(false);
    setInviteError("");
    setInviteSuccess("");
    setInvitationUrl("");
  };

  const handleInviteChange = (event) => {
    const { name, value } = event.target;

    setInviteForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setInviteError("");
    setInviteSuccess("");
  };

  const createInvitation = async (event) => {
    event.preventDefault();

    setInviteError("");
    setInviteSuccess("");
    setInvitationUrl("");

    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim().toLowerCase();
    const selectedRole = inviteForm.role;

    if (!name) {
      setInviteError(
        "Please enter the user's full name."
      );
      return;
    }

    if (!email) {
      setInviteError(
        "Please enter the user's email address."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setInviteError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      selectedRole !== "AGENT" &&
      selectedRole !== "ADMIN"
    ) {
      setInviteError(
        "Please select Agent or Administrator."
      );
      return;
    }

    setInviteLoading(true);

    try {
      console.log("Creating invitation...", {
        name,
        email,
        role: selectedRole,
      });

      const response = await api.post(
        "/admin/users/invite",
        {
          name,
          email,
          role: selectedRole,
        }
      );

      console.log(
        "Invitation API response:",
        response?.data
      );

      const data = response?.data || {};
      const invitation = data.invitation || {};

      /*
       * The backend currently returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   user: {...},
       *   invitation: {...}
       * }
       *
       * Support both a direct URL and a token.
       */

      let url =
        data.invitationUrl ||
        data.data?.invitationUrl ||
        invitation.invitationUrl ||
        invitation.url ||
        "";

      if (!url && invitation.token) {
        url = `${window.location.origin}/accept-invitation/${invitation.token}`;
      }

      if (!url && invitation.invitationToken) {
        url = `${window.location.origin}/accept-invitation/${invitation.invitationToken}`;
      }

      if (!url) {
        console.error(
          "Invitation created but no URL/token found:",
          data
        );

        throw new Error(
          "Invitation was created, but no invitation link was returned."
        );
      }

      setInvitationUrl(url);

      setInviteSuccess(
        data.message ||
          "Invitation created successfully."
      );

      await load();
    } catch (err) {
      console.error(
        "CREATE INVITATION ERROR:",
        err
      );

      setInviteError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvitation = async () => {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(
        invitationUrl
      );

      setInviteSuccess(
        "Invitation link copied successfully."
      );

      setInviteError("");
    } catch (err) {
      console.error(
        "COPY INVITATION ERROR:",
        err
      );

      setInviteError(
        "Unable to copy the link. Please copy it manually."
      );
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="dashboard">
        <PageHeader
          eyebrow="USER MANAGEMENT"
          title="People & access"
          description="Manage customer, agent and administrator roles across the workspace."
        />

        <div className="filter-bar">
          <div className="search-field">
            <Icon name="search" size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name or email…"
            />
          </div>

          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
          >
            <option value="ALL">
              All roles
            </option>

            <option value="CUSTOMER">
              Customers
            </option>

            <option value="AGENT">
              Agents
            </option>

            <option value="ADMIN">
              Admins
            </option>
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={load}
          >
            <Icon name="refresh" size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openInvite}
          >
            + Invite User
          </button>
        </div>

        {error && (
          <ErrorState
            text={error}
            onRetry={load}
          />
        )}

        {loading ? (
          <LoadingState />
        ) : (
          <section className="panel table-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">
                  DIRECTORY
                </span>

                <h2>
                  {shown.length} users
                </h2>
              </div>
            </div>

            {shown.length > 0 ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Access</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shown.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="table-user">
                            <Avatar
                              name={user.name}
                              small
                            />

                            <div>
                              <strong>
                                {user.name}
                              </strong>

                              <span>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`role-pill role-${String(
                              user.role
                            ).toLowerCase()}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        <td>
                          <select
                            value={user.role}
                            disabled={
                              saving === user.id ||
                              deleting === user.id
                            }
                            onChange={(event) =>
                              changeRole(
                                user.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="CUSTOMER">
                              Customer
                            </option>

                            <option value="AGENT">
                              Agent
                            </option>

                            <option value="ADMIN">
                              Admin
                            </option>
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(user)
                            }
                            disabled={
                              deleting === user.id
                            }
                            style={{
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff1f2",
                              color:
                                "#dc2626",
                              padding:
                                "8px 12px",
                              borderRadius:
                                "8px",
                              cursor:
                                deleting ===
                                user.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: 600,
                              fontSize:
                                "13px",
                              opacity:
                                deleting ===
                                user.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {deleting ===
                            user.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon="users"
                title="No users found"
                text="Try a different search or role filter."
              />
            )}
          </section>
        )}
      </div>

      {/* =========================================
          DELETE USER CONFIRMATION MODAL
          ========================================= */}
      {deleteTarget && (
        <div
          onClick={closeDeleteModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow:
                "0 25px 70px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            {/* Warning icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "18px",
                color: "#dc2626",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              !
            </div>

            {/* Heading */}
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "21px",
                lineHeight: 1.3,
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Delete user?
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              You are about to permanently remove
              this user from the helpdesk workspace.
            </p>

            {/* User information */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                marginBottom: "18px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <Avatar
                name={deleteTarget.name}
                small
              />

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#172033",
                    marginBottom: "3px",
                  }}
                >
                  {deleteTarget.name}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {deleteTarget.email}
                </div>
              </div>
            </div>

            {/* Warning */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                padding: "12px 14px",
                marginBottom: "24px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
                color: "#92400e",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                }}
              >
                Warning:
              </span>

              <span>
                This action cannot be undone. The
                user will permanently lose access to
                the system.
              </span>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={!!deleting}
                className="btn btn-secondary"
                style={{
                  minWidth: "90px",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteUser}
                disabled={!!deleting}
                style={{
                  minWidth: "115px",
                  padding: "10px 16px",
                  borderRadius: "9px",
                  border:
                    "1px solid #dc2626",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: deleting
                    ? "not-allowed"
                    : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          INVITE USER MODAL
          ========================================= */}
      {showInvite && (
        <div
          onClick={closeInvite}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(10, 15, 30, 0.68)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "22px",
              padding: "30px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    color: "#64748b",
                    marginBottom: "7px",
                  }}
                >
                  TEAM ACCESS
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#172033",
                  }}
                >
                  Invite user
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Create a secure invitation for
                  an internal team member.
                </p>
              </div>

              <button
                type="button"
                onClick={closeInvite}
                disabled={inviteLoading}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#475569",
                }}
              >
                ×
              </button>
            </div>

            {inviteError && (
              <div
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  color: "#be123c",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  marginBottom: "18px",
                  fontSize: "14px",
                }}
              >
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  marginBottom: "18px",
                  fontSize: "14px",
                }}
              >
                {inviteSuccess}
              </div>
            )}

            {!invitationUrl ? (
              <form
                onSubmit={createInvitation}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "17px",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "14px",
                  }}
                >
                  Full name

                  <input
                    name="name"
                    type="text"
                    value={inviteForm.name}
                    onChange={handleInviteChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    disabled={inviteLoading}
                    required
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "7px",
                      padding: "12px 14px",
                      border:
                        "1px solid #dbe2ea",
                      borderRadius: "11px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "block",
                    marginBottom: "17px",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "14px",
                  }}
                >
                  Email address

                  <input
                    name="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={handleInviteChange}
                    placeholder="employee@company.com"
                    autoComplete="email"
                    disabled={inviteLoading}
                    required
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "7px",
                      padding: "12px 14px",
                      border:
                        "1px solid #dbe2ea",
                      borderRadius: "11px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "block",
                    marginBottom: "24px",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "14px",
                  }}
                >
                  Role

                  <select
                    name="role"
                    value={inviteForm.role}
                    onChange={handleInviteChange}
                    disabled={inviteLoading}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: "7px",
                      padding: "12px 14px",
                      border:
                        "1px solid #dbe2ea",
                      borderRadius: "11px",
                      fontSize: "14px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="AGENT">
                      Agent
                    </option>

                    <option value="ADMIN">
                      Administrator
                    </option>
                  </select>
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeInvite}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={inviteLoading}
                  >
                    {inviteLoading
                      ? "Creating..."
                      : "Create Invitation"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    background: "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      marginBottom: "8px",
                    }}
                  >
                    INVITATION LINK
                  </div>

                  <div
                    style={{
                      wordBreak: "break-all",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "#334155",
                    }}
                  >
                    {invitationUrl}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={copyInvitation}
                  >
                    Copy Link
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      window.open(
                        invitationUrl,
                        "_blank"
                      )
                    }
                  >
                    Open Invitation
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeInvite}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}