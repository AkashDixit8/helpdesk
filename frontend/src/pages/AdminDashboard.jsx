import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api, { listOf, messageOf } from "../services/api";
import { ErrorState, Icon, LoadingState, PageHeader, StatCard, StatusBadge, PriorityBadge, TicketRow, formatDate } from "../components/Ui";

const pct = (n,total) => total ? Math.round((n/total)*100) : 0;
const Donut = ({items,total}) => {
  let cursor=0;
  const stops=items.map(item=>{const start=cursor; cursor+=total?item.value/total*360:0; return `${item.color} ${start}deg ${cursor}deg`;}).join(", ");
  return <div className="donut-wrap"><div className="donut" style={{background:total?`conic-gradient(${stops})`:"conic-gradient(#e8edf5 0 360deg)"}}><div className="donut-hole"><strong>{total}</strong><span>tickets</span></div></div><div className="legend">{items.map(i=><div key={i.label}><span style={{background:i.color}}/><span>{i.label}</span><strong>{i.value}</strong></div>)}</div></div>;
};
const MiniBars=({items})=><div className="mini-bars">{items.map(i=><div className="mini-bar-row" key={i.label}><span>{i.label}</span><div><i style={{width:`${i.percent}%`}}/></div><strong>{i.value}</strong></div>)}</div>;
const useTickets=()=>{const [tickets,setTickets]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""); const load=async()=>{setLoading(true);setError("");try{setTickets(listOf(await api.get("/tickets"),"tickets"));}catch(e){setError(messageOf(e,"Unable to load tickets."));}finally{setLoading(false)}};useEffect(()=>{load()},[]);return {tickets,loading,error,reload:load};};
const counts=(tickets)=>({total:tickets.length,open:tickets.filter(t=>t.status==="OPEN").length,inProgress:tickets.filter(t=>t.status==="IN_PROGRESS").length,resolved:tickets.filter(t=>t.status==="RESOLVED").length,closed:tickets.filter(t=>t.status==="CLOSED").length,urgent:tickets.filter(t=>t.priority==="URGENT").length});

export default function AdminDashboard(){
 const {tickets,loading,error,reload}=useTickets(); const navigate=useNavigate(); const [users,setUsers]=useState([]); const [usersLoading,setUsersLoading]=useState(true);
 const loadUsers=async()=>{setUsersLoading(true);try{setUsers(listOf(await api.get("/admin/users"),"users"));}catch{}finally{setUsersLoading(false)}};useEffect(()=>{loadUsers()},[]);
 const c=counts(tickets),agents=users.filter(u=>u.role==="AGENT").length,customers=users.filter(u=>u.role==="CUSTOMER").length,admins=users.filter(u=>u.role==="ADMIN").length;
 return <DashboardLayout role="ADMIN"><div className="dashboard">
  <div className="welcome-banner admin-banner"><div><div className="eyebrow light">ADMIN CONSOLE</div><h1>Workspace overview</h1><p>Monitor support volume, manage people and keep the ticket operation healthy.</p></div><button className="btn btn-light" onClick={()=>navigate("/admin/tickets")}><Icon name="ticket" size={17}/> Manage tickets</button></div>
  <div className="stats-grid"><StatCard icon="ticket" label="Total tickets" value={c.total} hint="All support requests" tone="blue"/><StatCard icon="clock" label="Open" value={c.open} hint={`${c.urgent} urgent`} tone="amber"/><StatCard icon="users" label="Users" value={users.length} hint={`${agents} agents`} tone="purple"/><StatCard icon="check" label="Resolved" value={c.resolved} hint={`${pct(c.resolved,c.total)}% of tickets`} tone="green"/></div>
  {(error)&&<ErrorState text={error} onRetry={reload}/>}
  {loading?<LoadingState/>:<div className="dashboard-grid"><section className="panel panel-large"><div className="panel-head"><div><span className="panel-kicker">OPERATIONS</span><h2>Recent tickets</h2></div><button className="text-button" onClick={()=>navigate("/admin/tickets")}>View all <Icon name="arrow" size={15}/></button></div>{tickets.slice(0,6).length?<div className="ticket-list">{tickets.slice(0,6).map(t=><TicketRow key={t.id} ticket={t} to={`/admin/tickets/${t.id}`}/>)}</div>:<div className="panel-empty"><Icon name="ticket" size={24}/><strong>No tickets yet</strong><span>New customer requests will appear here.</span></div>}</section>
  <section className="panel"><div className="panel-head"><div><span className="panel-kicker">TICKET MIX</span><h2>Current status</h2></div></div><Donut total={c.total} items={[{label:"Open",value:c.open,color:"#f59e0b"},{label:"In progress",value:c.inProgress,color:"#7c3aed"},{label:"Resolved",value:c.resolved,color:"#10b981"},{label:"Closed",value:c.closed,color:"#64748b"}]}/></section></div>}
  <div className="admin-lower"><section className="panel"><div className="panel-head"><div><span className="panel-kicker">PEOPLE</span><h2>User distribution</h2></div><button className="text-button" onClick={()=>navigate("/admin/users")}>Manage <Icon name="arrow" size={15}/></button></div><div className="role-grid"><div><span className="role-avatar role-customer"><Icon name="user"/></span><strong>{customers}</strong><small>Customers</small></div><div><span className="role-avatar role-agent"><Icon name="users"/></span><strong>{agents}</strong><small>Agents</small></div><div><span className="role-avatar role-admin"><Icon name="settings"/></span><strong>{admins}</strong><small>Admins</small></div></div></section>
  <section className="panel"><div className="panel-head"><div><span className="panel-kicker">QUICK ACTIONS</span><h2>Manage workspace</h2></div></div><div className="action-list"><button onClick={()=>navigate("/admin/users")}><Icon name="users"/><span><strong>Users & roles</strong><small>Manage account access</small></span><Icon name="chevron" size={16}/></button><button onClick={()=>navigate("/admin/categories")}><Icon name="tag"/><span><strong>Categories</strong><small>Organize support requests</small></span><Icon name="chevron" size={16}/></button></div></section></div>
 </div></DashboardLayout>
}
