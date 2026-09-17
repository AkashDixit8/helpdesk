import { Link } from "react-router-dom";

export function Icon({ name, size = 19, stroke = 1.8 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    ticket: <><path d="M4 5h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V5Z"/><path d="M9 9h6M9 15h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8M21 21v-2a4 4 0 0 0-3-3.87"/></>,
    tag: <><path d="M20 13 13 20 4 11V4h7l9 9Z"/><circle cx="8" cy="8" r="1"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.7c-1 .9-1.7 1.3-1.7 2.8M12 17h.01"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18"/></>,
    arrow: <><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    alert: <><path d="M10.3 3.8 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.5 1.5-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-2.12v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 0 0 7.2 15a1.7 1.7 0 0 0-1.55-1H5.56v-2.12h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.5-1.5.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V6h2.12v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.5 1.5-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1h.09V13h-.09a1.7 1.7 0 0 0-1.55 1Z"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.7-4L3 10"/><path d="M3 5v5h5M4 13a8 8 0 0 0 14.7 4L21 14"/><path d="M21 19v-5h-5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    filter: <><path d="M4 5h16M7 12h10M10 19h4"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

export function Avatar({ name = "User", small = false }) {
  const initials = name.split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0,2).toUpperCase() || "U";
  return <span className={`avatar ${small ? "avatar-sm" : ""}`}>{initials}</span>;
}

export function StatusBadge({ value }) {
  const label = String(value || "OPEN").replaceAll("_", " ");
  return <span className={`badge badge-${String(value || "OPEN").toLowerCase()}`}>{label}</span>;
}

export function PriorityBadge({ value }) {
  return <span className={`priority priority-${String(value || "MEDIUM").toLowerCase()}`}>{value || "MEDIUM"}</span>;
}

export function EmptyState({ icon="ticket", title="Nothing here yet", text="There are no records to display.", action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={28}/></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon, label, value, hint, tone="blue" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-card-top"><div className="stat-icon"><Icon name={icon}/></div><span className="stat-hint">{hint || "Overview"}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function LoadingState({ text="Loading workspace…" }) {
  return <div className="loading-state"><span className="spinner"/><span>{text}</span></div>;
}

export function ErrorState({ text, onRetry }) {
  return <div className="inline-error"><Icon name="alert"/><span>{text}</span>{onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}><Icon name="refresh" size={15}/>Retry</button>}</div>;
}

export function TicketRow({ ticket, to, compact=false }) {
  return (
    <Link className={`ticket-row ${compact ? "ticket-row-compact" : ""}`} to={to}>
      <div className="ticket-row-main">
        <div className="ticket-title-line">
          <span className="ticket-number">#{ticket.id}</span>
          <strong>{ticket.title || "Untitled ticket"}</strong>
        </div>
        <div className="ticket-subline">
          <span>{ticket.category?.name || "Uncategorized"}</span>
          <span>•</span>
          <span>{formatDate(ticket.createdAt)}</span>
          {ticket.createdBy?.name && <><span>•</span><span>{ticket.createdBy.name}</span></>}
        </div>
      </div>
      <div className="ticket-row-right">
        <PriorityBadge value={ticket.priority}/>
        <StatusBadge value={ticket.status}/>
        <Icon name="chevron" size={17}/>
      </div>
    </Link>
  );
}

export function formatDate(value, withTime=false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", withTime ? {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"} : {day:"2-digit",month:"short",year:"numeric"});
}
