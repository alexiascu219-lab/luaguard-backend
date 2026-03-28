'use client';
import React, { useState } from 'react';
import { luaGuardApi } from '@/lib/api';

const S = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508', padding: '24px', position: 'relative' as const, overflow: 'hidden', fontFamily: "'Outfit', sans-serif" },
  orb: (w:number,h:number,r:string,t:string,l:string) => ({ position: 'absolute' as const, width: w, height: h, borderRadius: '50%', background: `radial-gradient(circle, ${r} 0%, transparent 70%)`, top: t, left: l, pointerEvents: 'none' as const }),
  card: { position: 'relative' as const, zIndex: 10, width: '100%', maxWidth: 420, background: 'rgba(12,10,24,0.85)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 24, padding: '40px 36px', backdropFilter: 'blur(30px)', boxShadow: '0 0 60px rgba(88,28,220,0.15)' },
  accentLine: { position: 'absolute' as const, top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, #7c3aed, #a78bfa, #7c3aed, transparent)' },
  iconWrap: { width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(59,130,246,0.12) 100%)', border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 0 30px rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 },
  sub: { fontSize: 11, color: '#4a4a6a', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 36, fontWeight: 600 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#6b6b8a', marginBottom: 8 },
  input: (focused:boolean) => ({ width: '100%', background: 'rgba(6,4,16,0.8)', border: `1px solid ${focused?'rgba(124,58,237,0.6)':'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '13px 16px', color: '#e8e6ff', fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'all 0.2s', boxShadow: focused?'0 0 0 3px rgba(124,58,237,0.12)':'none' }),
  errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 12 },
  successBox: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#6ee7b7', marginBottom: 12 },
  btn: (loading:boolean,hover:boolean) => ({ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", cursor: loading?'default':'pointer', boxShadow: hover&&!loading?'0 0 40px rgba(124,58,237,0.55)':'0 0 25px rgba(124,58,237,0.35)', transform: hover&&!loading?'translateY(-2px)':'none', transition: 'all 0.2s ease', opacity: loading?0.7:1, marginTop: 8 }),
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [focusInvite, setFocusInvite] = useState(false);
  const [hover, setHover] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    try {
      if (isRegister) {
        const res = await luaGuardApi.register(user, pass, inviteCode);
        if (res.success) {
          setSuccess(`Developer Account created! Your Sellix Webhook API Key is: ${res.api_key}. Please save it.`);
          setIsRegister(false);
          setPass('');
          setInviteCode('');
        }
      } else {
        const res = await luaGuardApi.login(user, pass);
        if (res.success) {
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={{...S.orb(600,600,'rgba(88,28,220,0.18)','50%','50%'), transform:'translate(-50%,-50%)'}} />
      <div style={S.orb(400,400,'rgba(29,14,70,0.6)','20%','100%')} />
      <div style={S.orb(300,300,'rgba(14,30,80,0.5)','80%','-5%')} />

      <div style={S.card}>
        <div style={S.accentLine} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={S.iconWrap}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div style={S.title}>LuaGuard</div>
          <div style={S.sub}>Protected Dashboard</div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 28 }} />

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Sellix Key (Invite Code)</label>
              <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} onFocus={()=>setFocusInvite(true)} onBlur={()=>setFocusInvite(false)} placeholder="LGINV-XXXXXX" required style={S.input(focusInvite)} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Username</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} onFocus={()=>setFocusUser(true)} onBlur={()=>setFocusUser(false)} placeholder="developer_name" required style={S.input(focusUser)} />
          </div>

          <div style={{ marginBottom: 20, position: 'relative' }}>
            <label style={S.label}>{isRegister ? 'Set A Password' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input type={show?'text':'password'} value={pass} onChange={e => setPass(e.target.value)} onFocus={()=>setFocusPass(true)} onBlur={()=>setFocusPass(false)} placeholder="••••••••" required style={{...S.input(focusPass), paddingRight: 44}} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a4a6a', display: 'flex' }}>
                {show ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>

          {error && <div style={S.errorBox}>{error}</div>}
          {success && <div style={S.successBox}>{success}</div>}

          <button type="submit" disabled={loading} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={S.btn(loading, hover)}>
            {loading ? 'Authenticating…' : (isRegister ? 'Redeem Invite & Register' : 'Sign In')}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 11, color: '#6b6b8a', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
          {isRegister ? 'Already registered? Sign In' : 'Have a Sellix Key? Setup Account'}
        </p>
      </div>
    </div>
  );
}
