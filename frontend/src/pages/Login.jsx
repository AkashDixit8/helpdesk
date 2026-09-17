import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { bodyOf, messageOf } from "../services/api";
import { Icon } from "../components/Ui";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const data = bodyOf(res);

      const token = data.token || data.accessToken;
      const user = data.user || data.data?.user;

      if (!token || !user) {
        throw new Error(
          "Login response is missing account information."
        );
      }

      localStorage.setItem("helpdesk_token", token);
      localStorage.setItem(
        "helpdesk_user",
        JSON.stringify(user)
      );

      const from = location.state?.from;

      const home =
        user.role === "ADMIN"
          ? "/admin/dashboard"
          : user.role === "AGENT"
          ? "/agent/dashboard"
          : "/customer/dashboard";

      navigate(from || home, { replace: true });
    } catch (err) {
      setError(
        messageOf(
          err,
          "Unable to sign in. Please check your credentials."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-login-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div className="auth-orb auth-orb-three" />
      <div className="auth-grid" />

      <header className="auth-brand">
        <div className="brand-mark auth-mark">H</div>

        <div>
          <strong>HelpDesk</strong>
          <span>Support operations platform</span>
        </div>
      </header>

      <div className="auth-shell">
        <div className="auth-intro">
          <div className="eyebrow auth-eyebrow">
            SMART SUPPORT • ONE WORKSPACE
          </div>

          <h1>
            Resolve faster.
            <br />
            <em>Serve better.</em>
          </h1>

          <p>
            A modern support workspace connecting customers,
            agents and administrators through one clear ticket
            lifecycle.
          </p>

          <div className="auth-points">
            <span>
              <Icon name="check" size={16} />
              Clear ticket ownership
            </span>

            <span>
              <Icon name="check" size={16} />
              Complete conversation history
            </span>

            <span>
              <Icon name="check" size={16} />
              Secure role-based access
            </span>
          </div>

          <div className="auth-glow-line">
            <i />
            <i />
            <i />
          </div>
        </div>

        <form
          className="auth-card auth-card-premium"
          onSubmit={submit}
        >
          <div className="auth-card-shine" />

          <div className="auth-card-head">
            <div>
              <div className="eyebrow">WELCOME BACK</div>
              <h2>Sign in</h2>
              <p>Access your HelpDesk workspace.</p>
            </div>

            <div className="auth-lock">
              <Icon name="user" size={21} />
            </div>
          </div>

          {error && (
            <div className="form-error">
              <Icon name="alert" size={17} />
              {error}
            </div>
          )}

          <label>
            Email address

            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="you@company.com"
              required
            />
          </label>

          <label>
            Password

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Enter your password"
                required
                style={{
                  paddingRight: "48px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "34px",
                  height: "34px",
                  padding: "0",
                  border: "none",
                  background: "transparent",
                  color: "#8b96b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                }}
              >
                {showPassword ? (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9 4 10 8a10.3 10.3 0 0 1-2.1 3.9" />
                    <path d="M6.61 6.61C4.94 7.83 3.65 9.55 3 12c1 4 5 8 9 8a9.7 9.7 0 0 0 3.39-.61" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button
            className="btn btn-primary btn-block auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}

            {!loading && <Icon name="arrow" size={17} />}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>

      <div className="auth-footer">
        HelpDesk · Secure support workspace · Built for modern
        support teams
      </div>
    </div>
  );
}