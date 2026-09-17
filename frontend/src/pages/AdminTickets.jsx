import { useEffect,useMemo,useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api,{listOf,messageOf} from "../services/api";
import { EmptyState,ErrorState,Icon,LoadingState,PageHeader,TicketRow } from "../components/Ui";

export default function AdminTickets(){
 const navigate=useNavigate();const [tickets,setTickets]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[search,setSearch]=useState(""),[status,setStatus]=useState("ALL"),[priority,setPriority]=useState("ALL");
 const load=async()=>{setLoading(true);setError("");try{setTickets(listOf(await api.get("/tickets"),"tickets"));}catch(e){setError(messageOf(e,"Unable to load tickets."));}finally{setLoading(false)}};useEffect(()=>{load()},[]);
 const shown=useMemo(()=>tickets.filter(t=>(status==="ALL"||t.status===status)&&(priority==="ALL"||t.priority===priority)&&(!search||`${t.id} ${t.title} ${t.createdBy?.name||""} ${t.category?.name||""}`.toLowerCase().includes(search.toLowerCase()))),[tickets,status,priority,search]);
 return <DashboardLayout role="ADMIN"><div className="dashboard"><PageHeader eyebrow="TICKET MANAGEMENT" title="All support tickets" description="Review incoming work, monitor status and open a ticket for detailed management."/>
 <div className="filter-bar"><div className="search-field"><Icon name="search" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ticket, customer or category…"/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="ALL">All priorities</option><option value="URGENT">Urgent</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select><button className="btn btn-secondary" onClick={load}><Icon name="refresh" size={16}/> Refresh</button></div>
 {error&&<ErrorState text={error} onRetry={load}/>}
 {loading?<LoadingState/>:<section className="panel"><div className="panel-head"><div><span className="panel-kicker">ALL REQUESTS</span><h2>{shown.length} ticket{shown.length===1?"":"s"}</h2></div></div>{shown.length?<div className="ticket-list">{shown.map(t=><TicketRow key={t.id} ticket={t} to={`/admin/tickets/${t.id}`}/>)}</div>:<EmptyState icon="ticket" title="No matching tickets" text="Change the filters to see other requests."/>}</section>}
 </div></DashboardLayout>
}
