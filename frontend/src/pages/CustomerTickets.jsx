import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api,{listOf,messageOf} from "../services/api";
import { EmptyState, ErrorState, Icon, LoadingState, PageHeader, PriorityBadge, StatusBadge, TicketRow } from "../components/Ui";

export default function CustomerTickets(){
 const navigate=useNavigate(); const [tickets,setTickets]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[search,setSearch]=useState(""),[status,setStatus]=useState("ALL");
 const load=async()=>{setLoading(true);setError("");try{setTickets(listOf(await api.get("/tickets"),"tickets"));}catch(e){setError(messageOf(e,"Unable to load your tickets."));}finally{setLoading(false)}};useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>tickets.filter(t=>(status==="ALL"||t.status===status)&&(!search||`${t.id} ${t.title} ${t.category?.name||""}`.toLowerCase().includes(search.toLowerCase()))),[tickets,status,search]);
 return <DashboardLayout role="CUSTOMER"><div className="dashboard"><PageHeader eyebrow="MY TICKETS" title="Your support requests" description="View the status and conversation for every request you've submitted." action={<button className="btn btn-primary" onClick={()=>navigate("/customer/tickets/create")}><Icon name="plus" size={17}/> New ticket</button>}/>
 <div className="filter-bar"><div className="search-field"><Icon name="search" size={18}/><input placeholder="Search tickets…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select><button className="btn btn-secondary" onClick={load}><Icon name="refresh" size={16}/> Refresh</button></div>
 {error&&<ErrorState text={error} onRetry={load}/>}
 {loading?<LoadingState/>:<section className="panel"><div className="panel-head"><div><span className="panel-kicker">REQUESTS</span><h2>{filtered.length} ticket{filtered.length===1?"":"s"}</h2></div></div>{filtered.length?<div className="ticket-list">{filtered.map(t=><TicketRow key={t.id} ticket={t} to={`/customer/tickets/${t.id}`}/>)}</div>:<EmptyState icon="ticket" title="No matching tickets" text={tickets.length?"Try changing your search or status filter.":"Create your first ticket to start a support conversation."} action={!tickets.length&&<button className="btn btn-primary btn-sm" onClick={()=>navigate("/customer/tickets/create")}>Create ticket</button>}/>}</section>}
 </div></DashboardLayout>
}
