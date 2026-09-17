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

export default function AgentDashboard(){
 const {tickets,loading,error,reload}=useTickets(); const navigate=useNavigate(); const c=counts(tickets); const user=JSON.parse(localStorage.getItem("helpdesk_user")||"{}");
 const assigned=tickets.filter(t=>String(t.assignedToId)===String(user.id)||String(t.assignedTo?.id)===String(user.id)); const available=tickets.filter(t=>!t.assignedToId&&t.status!=="CLOSED"); const assignedOpen=assigned.filter(t=>t.status==="OPEN"||t.status==="IN_PROGRESS").length;
 return <DashboardLayout role="AGENT"><div className="dashboard">
  <div className="welcome-banner agent-banner"><div><div className="eyebrow light">AGENT WORKSPACE</div><h1>Good to see you, {user.name?.split(" ")[0]||"Agent"}.</h1><p>Stay on top of your queue and keep customer issues moving forward.</p></div><button className="btn btn-light" onClick={()=>navigate("/agent/tickets")}><Icon name="ticket" size={17}/> Open queue</button></div>
  <div className="stats-grid"><StatCard icon="ticket" label="Assigned to you" value={assigned.length} hint={`${assignedOpen} active`} tone="blue"/><StatCard icon="alert" label="Available queue" value={available.length} hint="Ready to take" tone="amber"/><StatCard icon="refresh" label="In progress" value={c.inProgress} hint="Across workspace" tone="purple"/><StatCard icon="check" label="Resolved" value={c.resolved} hint="Across workspace" tone="green"/></div>
  {error&&<ErrorState text={error} onRetry={reload}/>}
  {loading?<LoadingState/>:<div className="dashboard-grid"><section className="panel panel-large"><div className="panel-head"><div><span className="panel-kicker">YOUR WORK</span><h2>Assigned tickets</h2></div><button className="text-button" onClick={()=>navigate("/agent/tickets")}>View queue <Icon name="arrow" size={15}/></button></div>{assigned.slice(0,6).length?<div className="ticket-list">{assigned.slice(0,6).map(t=><TicketRow key={t.id} ticket={t} to={`/agent/tickets/${t.id}`}/>)}</div>:<div className="panel-empty"><Icon name="check" size={24}/><strong>Your queue is clear</strong><span>Take a ticket from the queue when you're ready.</span><button className="btn btn-primary btn-sm" onClick={()=>navigate("/agent/tickets")}>View available tickets</button></div>}</section>
  <section className="panel"><div className="panel-head"><div><span className="panel-kicker">WORKLOAD</span><h2>Ticket status</h2></div></div><Donut total={c.total} items={[{label:"Open",value:c.open,color:"#f59e0b"},{label:"In progress",value:c.inProgress,color:"#7c3aed"},{label:"Resolved",value:c.resolved,color:"#10b981"},{label:"Closed",value:c.closed,color:"#64748b"}]}/><div className="queue-metric"><span>Unassigned queue</span><strong>{available.length}</strong></div></section></div>}
  <div className="section-heading"><div><span className="panel-kicker">PRIORITY SIGNALS</span><h2>What needs attention</h2></div></div><div className="panel"><MiniBars items={[{label:"Urgent",value:c.urgent,percent:c.total?pct(c.urgent,c.total):0},{label:"High priority",value:tickets.filter(t=>t.priority==="HIGH").length,percent:c.total?pct(tickets.filter(t=>t.priority==="HIGH").length,c.total):0},{label:"Open",value:c.open,percent:c.total?pct(c.open,c.total):0}]}/></div>
 </div></DashboardLayout>
}
