import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Icon } from "../components/Ui";

const CONFIG = {
  CUSTOMER: {
    label: "Customer portal",
    nav: [
      ["Overview", "/customer/dashboard", "grid"],
      ["My tickets", "/customer/tickets", "ticket"],
      ["Create ticket", "/customer/tickets/create", "plus"],
    ],
  },
  AGENT: {
    label: "Agent workspace",
    nav: [
      ["Overview", "/agent/dashboard", "grid"],
      ["Ticket queue", "/agent/tickets", "ticket"],
    ],
  },
  ADMIN: {
    label: "Administration",
    nav: [
      ["Overview", "/admin/dashboard", "grid"],
      ["All tickets", "/admin/tickets", "ticket"],
      ["Users", "/admin/users", "users"],
      ["Categories", "/admin/categories", "tag"],
    ],
  },
};

export default function DashboardLayout({ children, role="CUSTOMER" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("helpdesk_user") || "null"); } catch { return null; }
  }, []);
  const cfg = CONFIG[role] || CONFIG.CUSTOMER;
  const current = cfg.nav.find(([, path]) => location.pathname.startsWith(path))?.[0] || "Overview";

  useEffect(() => {
    const handler = () => setHelpOpen(true);
    window.addEventListener("helpdesk:open-help", handler);
    return () => window.removeEventListener("helpdesk:open-help", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = () => {
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand" onClick={() => navigate(cfg.nav[0][1])}>
          <div className="brand-mark">H</div>
          <div><strong>HelpDesk</strong><span>Support operations</span></div>
        </div>

        <div className="workspace-card">
          <div className="workspace-dot"/>
          <div><span>Workspace</span><strong>{cfg.label}</strong></div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          {cfg.nav.map(([label,path,icon]) => (
            <NavLink key={path} to={path} className={({isActive}) => `side-link ${isActive ? "active" : ""}`}>
              <Icon name={icon} size={18}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="help-card" onClick={() => setHelpOpen(true)}>
            <span className="help-card-icon"><Icon name="help" size={17}/></span>
            <span><strong>Need help?</strong><small>Open the Help Center</small></span>
            <Icon name="chevron" size={15}/>
          </button>
          <div className="account-card">
            <Avatar name={user?.name} small/>
            <div className="account-copy"><strong>{user?.name || "User"}</strong><span>{user?.role || role}</span></div>
            <button className="icon-button" title="Sign out" onClick={logout}><Icon name="logout" size={17}/></button>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Icon name="menu"/></button>
            <div className="breadcrumb"><span>HelpDesk</span><Icon name="chevron" size={14}/><strong>{current}</strong></div>
          </div>
          <div className="topbar-right">
            <button className="icon-button top-action" title="Help Center" onClick={() => setHelpOpen(true)}><Icon name="help" size={19}/></button>
            <button className="icon-button top-action" title="Notifications" onClick={() => setNoticeOpen(v=>!v)}><Icon name="bell" size={19}/><i/></button>
            {noticeOpen && <div className="notice-popover"><strong>All caught up</strong><span>New ticket activity will appear here.</span></div>}
            <div className="top-user"><Avatar name={user?.name} small/><div><strong>{user?.name || "User"}</strong><span>{cfg.label}</span></div></div>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </section>

      {helpOpen && (
        <div className="modal-backdrop" onMouseDown={() => setHelpOpen(false)}>
          <div className="help-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-top"><div><div className="eyebrow">HELP CENTER</div><h2>How can we help?</h2><p>Quick guidance for using your HelpDesk workspace.</p></div><button className="icon-button" onClick={() => setHelpOpen(false)}><Icon name="close"/></button></div>
            <div className="help-grid">
              <div><span>01</span><strong>Create a ticket</strong><p>Choose a category, write a useful title and include enough detail for the support team to reproduce the issue.</p></div>
              <div><span>02</span><strong>Track progress</strong><p>Open your ticket to see status, priority, assignment and the full support conversation.</p></div>
              <div><span>03</span><strong>Understand status</strong><p>Tickets progress through Open, In Progress, Resolved and Closed.</p></div>
              <div><span>04</span><strong>Keep communication together</strong><p>Reply inside the ticket so the support history stays complete and easy to audit.</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
