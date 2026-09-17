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

export default function CustomerDashboard(){
 const {tickets,loading,error,reload}=useTickets(); const navigate=useNavigate(); const c=counts(tickets);
 const recent=tickets.slice(0,5);
 const user=JSON.parse(localStorage.getItem("helpdesk_user")||"{}");
 return <DashboardLayout role="CUSTOMER"><div className="dashboard">
  <div className="welcome-banner"><div><div className="eyebrow light">CUSTOMER PORTAL</div><h1>Welcome back, {user.name?.split(" ")[0]||"there"}.</h1><p>Track your requests, reply to support and get issues resolved.</p></div><button className="btn btn-light" onClick={()=>navigate("/customer/tickets/create")}><Icon name="plus" size={17}/> New ticket</button></div>
  <div className="stats-grid"><StatCard icon="ticket" label="Total tickets" value={c.total} hint="All requests" tone="blue"/><StatCard icon="clock" label="Open" value={c.open} hint={`${pct(c.open,c.total)}% of total`} tone="amber"/><StatCard icon="refresh" label="In progress" value={c.inProgress} hint="Being handled" tone="purple"/><StatCard icon="check" label="Resolved" value={c.resolved} hint="Successfully closed" tone="green"/></div>
  {error&&<ErrorState text={error} onRetry={reload}/>}
  {loading?<LoadingState/>:<div className="dashboard-grid"><section className="panel panel-large"><div className="panel-head"><div><span className="panel-kicker">RECENT ACTIVITY</span><h2>Recent tickets</h2></div><button className="text-button" onClick={()=>navigate("/customer/tickets")}>View all <Icon name="arrow" size={15}/></button></div>{recent.length?<div className="ticket-list">{recent.map(t=><TicketRow key={t.id} ticket={t} to={`/customer/tickets/${t.id}`}/>)}</div>:<div className="panel-empty"><Icon name="ticket" size={24}/><strong>No tickets yet</strong><span>Create your first support request to get started.</span><button className="btn btn-primary btn-sm" onClick={()=>navigate("/customer/tickets/create")}>Create ticket</button></div>}</section>
  <section className="panel"><div className="panel-head"><div><span className="panel-kicker">TICKET HEALTH</span><h2>Overview</h2></div></div><Donut total={c.total} items={[{label:"Open",value:c.open,color:"#f59e0b"},{label:"In progress",value:c.inProgress,color:"#7c3aed"},{label:"Resolved",value:c.resolved,color:"#10b981"},{label:"Closed",value:c.closed,color:"#64748b"}]}/><div className="health-note"><span className="health-dot"/><div><strong>{c.total?`${pct(c.resolved+c.closed,c.total)}% resolved`:"No activity yet"}</strong><span>Resolution coverage across your tickets</span></div></div></section></div>}
  <div className="quick-strip"><button onClick={()=>navigate("/customer/tickets/create")}><span><Icon name="plus"/></span><div><strong>Create a ticket</strong><small>Tell the support team what happened</small></div><Icon name="arrow" size={17}/></button><button onClick={()=>window.dispatchEvent(new Event("helpdesk:open-help"))}><span><Icon name="help"/></span><div><strong>Open Help Center</strong><small>Learn how to use your support workspace</small></div><Icon name="arrow" size={17}/></button></div>
 </div></DashboardLayout>
}
