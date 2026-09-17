import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { messageOf } from "../services/api";
import { Icon } from "../components/Ui";

export default function Register() {
  const navigate=useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const submit=async e=>{
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.post("/auth/register",form); navigate("/login",{replace:true}); }
    catch(err){ setError(messageOf(err,"Unable to create account.")); }
    finally{setLoading(false);}
  };
  return <div className="auth-page auth-register-page">
    <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/><div className="auth-orb auth-orb-three"/>
    <div className="auth-grid"/>
    <header className="auth-brand"><div className="brand-mark auth-mark">H</div><div><strong>HelpDesk</strong><span>Support operations platform</span></div></header>
    <div className="auth-shell auth-shell-register">
      <div className="auth-intro">
        <div className="eyebrow auth-eyebrow">GET STARTED • CUSTOMER PORTAL</div>
        <h1>Every issue.<br/><em>One clear path.</em></h1>
        <p>Create your support account and keep requests, replies and resolutions organised in one professional workspace.</p>
        <div className="auth-points"><span><Icon name="check" size={16}/> Create and track tickets</span><span><Icon name="check" size={16}/> Reply to support agents</span><span><Icon name="check" size={16}/> Follow every resolution</span></div>
        <div className="auth-glow-line"><i/><i/><i/></div>
      </div>
      <form className="auth-card auth-card-premium" onSubmit={submit}>
        <div className="auth-card-shine"/>
        <div className="auth-card-head"><div><div className="eyebrow">NEW ACCOUNT</div><h2>Create account</h2><p>Start managing your support requests.</p></div><div className="auth-lock"><Icon name="user" size={21}/></div></div>
        {error && <div className="form-error"><Icon name="alert" size={17}/>{error}</div>}
        <label>Full name<input className="auth-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" required/></label>
        <label>Email address<input className="auth-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com" required/></label>
        <label>Password<input className="auth-input" type="password" minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" required/></label>
        <button className="btn btn-primary btn-block auth-submit" disabled={loading}>{loading?"Creating account…":"Create account"} {!loading && <Icon name="arrow" size={17}/>}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
    <div className="auth-footer">HelpDesk · Customer support workspace · Built for modern support teams</div>
  </div>
}
