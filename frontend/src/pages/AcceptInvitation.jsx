
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        if (!token) {
          throw new Error("Invitation token is missing.");
        }

        const response = await api.get(
          `/invitations/${encodeURIComponent(token)}`
        );

        const data = response?.data || {};

        if (!data.success || !data.invitation) {
          throw new Error(
            data.message || "Invalid invitation."
          );
        }

        setInvitation(data.invitation);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to verify invitation."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 12) {
      setError(
        "Password must contain at least 12 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(
        `/invitations/${encodeURIComponent(token)}/accept`,
        { password }
      );

      const data = response?.data || {};

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to activate your account."
        );
      }

      setSuccess(
        "Your account has been activated successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: invitation?.email || "",
            message:
              "Your account is ready. Please log in with your new password.",
          },
        });
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to activate your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef2ff 100%)",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            padding: 40,
            background: "#fff",
            borderRadius: 24,
            textAlign: "center",
            boxShadow:
              "0 24px 70px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 18px",
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 23,
              fontWeight: 800,
            }}
          >
            H
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#0f172a",
            }}
          >
            Verifying Invitation
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Please wait while we verify your invitation.
          </p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background:
            "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef2ff 100%)",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            padding: 40,
            background: "#fff",
            borderRadius: 24,
            textAlign: "center",
            boxShadow:
              "0 24px 70px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div
            style={{
              width: 62,
              height: 62,
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            !
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#0f172a",
              fontSize: 27,
            }}
          >
            Invitation Unavailable
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              color: "#64748b",
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              height: 48,
              border: 0,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background:
          "radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.12), transparent 30%), radial-gradient(circle at 90% 90%, rgba(79, 70, 229, 0.12), transparent 30%), #f8fafc",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 26,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 30px 90px rgba(15, 23, 42, 0.14)",
        }}
      >
        <div
          style={{
            padding: "34px 38px 30px",
            background:
              "linear-gradient(135deg, #1d4ed8, #4f46e5)",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(255,255,255,0.16)",
                border:
                  "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 21,
                fontWeight: 800,
              }}
            >
              H
            </div>

            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                Helpdesk
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  opacity: 0.78,
                }}
              >
                Support Management Platform
              </div>
            </div>
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "6px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 13,
            }}
          >
            ACCOUNT INVITATION
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 29,
              lineHeight: 1.15,
              letterSpacing: "-0.6px",
            }}
          >
            Welcome to Helpdesk
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.78)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Complete your account setup to access your
            support workspace.
          </p>
        </div>

        <div style={{ padding: 38 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: 25,
            }}
          >
            <div style={{ marginBottom: 15 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Name
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {invitation?.name}
              </div>
            </div>

            <div style={{ marginBottom: 15 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Email
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                  wordBreak: "break-word",
                }}
              >
                {invitation?.email}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
                Assigned Role
              </div>

              <span
                style={{
                  display: "inline-flex",
                  padding: "7px 11px",
                  borderRadius: 999,
                  background:
                    invitation?.role === "ADMIN"
                      ? "#ede9fe"
                      : "#dbeafe",
                  color:
                    invitation?.role === "ADMIN"
                      ? "#6d28d9"
                      : "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {invitation?.role === "ADMIN"
                  ? "Administrator"
                  : "Support Agent"}
              </span>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: 8,
                }}
              >
                Create Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimum 12 characters"
                  autoComplete="new-password"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 46px 0 14px",
                    border: "1px solid #dbe2ea",
                    borderRadius: 12,
                    outline: "none",
                    fontSize: 14,
                    color: "#0f172a",
                    background: "#fff",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  style={{
                    position: "absolute",
                    right: 7,
                    top: 6,
                    width: 36,
                    height: 36,
                    border: 0,
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 46px 0 14px",
                    border: "1px solid #dbe2ea",
                    borderRadius: 12,
                    outline: "none",
                    fontSize: 14,
                    color: "#0f172a",
                    background: "#fff",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  style={{
                    position: "absolute",
                    right: 7,
                    top: 6,
                    width: 36,
                    height: 36,
                    border: 0,
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {showConfirmPassword
                    ? "◉"
                    : "◌"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                height: 50,
                border: 0,
                borderRadius: 13,
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                opacity: submitting ? 0.7 : 1,
                boxShadow:
                  "0 10px 25px rgba(37, 99, 235, 0.22)",
              }}
            >
              {submitting
                ? "Activating Account..."
                : "Activate Account"}
            </button>
          </form>

          <div
            style={{
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #eef2f7",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                border: 0,
                background: "transparent",
                color: "#475569",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "15px 38px",
            borderTop: "1px solid #eef2f7",
            background: "#fafbfc",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 11,
          }}
        >
          Secure account activation • Helpdesk Platform
        </div>
      </div>
    </div>
  );
}