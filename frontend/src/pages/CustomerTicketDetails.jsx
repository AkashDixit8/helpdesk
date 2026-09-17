import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api,{bodyOf,messageOf} from "../services/api";
import { ErrorState, Icon, LoadingState, PageHeader, PriorityBadge, StatusBadge, Avatar, formatDate } from "../components/Ui";

export default function CustomerTicketDetails(){
 const {id}=useParams(); const navigate=useNavigate(); const [ticket,setTicket]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[comment,setComment]=useState(""),[sending,setSending]=useState(false),[closing,setClosing]=useState(false);
 const load=async()=>{setLoading(true);setError("");try{setTicket(bodyOf(await api.get(`/tickets/${id}`)).ticket);}catch(e){setError(messageOf(e,"Unable to load this ticket."));}finally{setLoading(false)}};useEffect(()=>{load()},[id]);
 const add=async e=>{e.preventDefault();if(!comment.trim())return;setSending(true);try{await api.post(`/tickets/${id}/comments`,{comment:comment.trim(),isInternal:false});setComment("");load()}catch(e){setError(messageOf(e,"Unable to send your reply."));}finally{setSending(false)}};
 const close=async()=>{setClosing(true);try{await api.put(`/tickets/${id}`,{status:"CLOSED"});load()}catch(e){setError(messageOf(e,"Unable to close this ticket."));}finally{setClosing(false)}};
 if(loading)return <DashboardLayout role="CUSTOMER"><LoadingState text="Loading ticket…"/></DashboardLayout>;
 if(error&&!ticket)return <DashboardLayout role="CUSTOMER"><ErrorState text={error} onRetry={load}/></DashboardLayout>;
 return <DashboardLayout role="CUSTOMER"><div className="dashboard">
 <PageHeader eyebrow={`TICKET #${ticket.id}`} title={ticket.title} description={`Created ${formatDate(ticket.createdAt)} · ${ticket.category?.name||"Uncategorized"}`} action={<button className="btn btn-secondary" onClick={()=>navigate("/customer/tickets")}><Icon name="arrow" size={16}/> Back to tickets</button>}/>
 {error&&<ErrorState text={error}/>}
 <div className="detail-grid"><section className="panel conversation-panel"><div className="ticket-detail-top"><div><PriorityBadge value={ticket.priority}/><StatusBadge value={ticket.status}/></div>{ticket.status!=="CLOSED"&&<button className="btn btn-secondary btn-sm" disabled={closing} onClick={close}>{closing?"Closing…":"Close ticket"}</button>}</div>
 <div className="original-message"><div className="message-author"><Avatar name={ticket.createdBy?.name||"You"} small/><div><strong>{ticket.createdBy?.name||"You"}</strong><span>{formatDate(ticket.createdAt,true)}</span></div></div><p>{ticket.description}</p></div>
 <div className="conversation-list">{(ticket.comments||[]).map(c=><div className="message" key={c.id}><Avatar name={c.user?.name||"Support"} small/><div className="message-body"><div><strong>{c.user?.name||"Support"}</strong><span>{c.user?.role==="AGENT"?"Support agent":"Customer"} · {formatDate(c.createdAt,true)}</span></div><p>{c.comment}</p></div></div>)}</div>
 <form className="reply-box" onSubmit={add}><textarea rows="4" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a reply to the support team…"/><div><span>Keep your reply clear and relevant to this ticket.</span><button className="btn btn-primary btn-sm" disabled={sending||!comment.trim()}>{sending?"Sending…":"Send reply"}<Icon name="arrow" size={15}/></button></div></form>
 </section><aside className="side-stack"><div className="panel"><div className="panel-head"><div><span className="panel-kicker">TICKET INFO</span><h2>Details</h2></div></div><div className="info-list"><div><span>Status</span><StatusBadge value={ticket.status}/></div><div><span>Priority</span><PriorityBadge value={ticket.priority}/></div><div><span>Category</span><strong>{ticket.category?.name||"—"}</strong></div><div><span>Assigned to</span><strong>{ticket.assignedTo?.name||"Awaiting assignment"}</strong></div></div></div><div className="panel tip-panel"><Icon name="help" size={20}/><strong>Need more help?</strong><p>Reply here with any extra details. The support team can see the complete ticket history.</p></div></aside></div>
 </div></DashboardLayout>
}
