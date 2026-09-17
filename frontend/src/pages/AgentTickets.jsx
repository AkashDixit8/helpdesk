import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api,{listOf,messageOf} from "../services/api";
import { EmptyState, ErrorState, Icon, LoadingState, PageHeader, PriorityBadge, StatusBadge, TicketRow } from "../components/Ui";

export default function AgentTickets(){
 const navigate=useNavigate();const [tickets,setTickets]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[filter,setFilter]=useState("ALL"),[search,setSearch]=useState(""),[taking,setTaking]=useState(null);
 const load=async()=>{setLoading(true);setError("");try{setTickets(listOf(await api.get("/tickets"),"tickets"));}catch(e){setError(messageOf(e,"Unable to load the ticket queue."));}finally{setLoading(false)}};useEffect(()=>{load()},[]);
 const available=tickets.filter(t=>!t.assignedToId&&t.status!=="CLOSED"),mine=tickets.filter(t=>String(t.assignedToId)===String(JSON.parse(localStorage.getItem("helpdesk_user")||"{}").id));
 const shown=useMemo(()=>tickets.filter(t=>{const f=filter==="AVAILABLE"?!t.assignedToId&&t.status!=="CLOSED":filter==="MINE"?String(t.assignedToId)===String(JSON.parse(localStorage.getItem("helpdesk_user")||"{}").id):filter==="URGENT"?t.priority==="URGENT":filter==="ACTIVE"?["OPEN","IN_PROGRESS"].includes(t.status):true;return f&&(!search||`${t.id} ${t.title} ${t.category?.name||""} ${t.createdBy?.name||""}`.toLowerCase().includes(search.toLowerCase()))}),[tickets,filter,search]);
 const take=async id=>{setTaking(id);try{await api.post(`/tickets/${id}/take`);await load()}catch(e){setError(messageOf(e,"Unable to take this ticket."));}finally{setTaking(null)}};
 return <DashboardLayout role="AGENT"><div className="dashboard"><PageHeader eyebrow="TICKET QUEUE" title="Support queue" description="Pick up available work, manage assigned tickets and keep requests moving."/>
 <div className="queue-summary"><div><span>My tickets</span><strong>{mine.length}</strong></div><div><span>Available</span><strong>{available.length}</strong></div><div><span>Urgent</span><strong>{tickets.filter(t=>t.priority==="URGENT").length}</strong></div><div><span>Active</span><strong>{tickets.filter(t=>["OPEN","IN_PROGRESS"].includes(t.status)).length}</strong></div></div>
 <div className="filter-bar"><div className="search-field"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ticket, customer or category…"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All tickets</option><option value="MINE">My tickets</option><option value="AVAILABLE">Available</option><option value="ACTIVE">Active</option><option value="URGENT">Urgent</option></select><button className="btn btn-secondary" onClick={load}><Icon name="refresh" size={16}/> Refresh</button></div>
 {error&&<ErrorState text={error} onRetry={load}/>}
 {loading?<LoadingState/>:<section className="panel"><div className="panel-head"><div><span className="panel-kicker">QUEUE</span><h2>{shown.length} ticket{shown.length===1?"":"s"}</h2></div></div>{shown.length?<div className="agent-ticket-list">{shown.map(t=><div className="agent-ticket-card" key={t.id}><TicketRow ticket={t} to={`/agent/tickets/${t.id}`} compact/>{!t.assignedToId&&t.status!=="CLOSED"&&<button className="queue-take" disabled={taking===t.id} onClick={()=>take(t.id)}>{taking===t.id?"Taking…":"Take ticket"}<Icon name="arrow" size={15}/></button>}</div>)}</div>:<EmptyState icon="ticket" title="No tickets match" text="Try another filter or search term."/>}</section>}
 </div></DashboardLayout>
}
