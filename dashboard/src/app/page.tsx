'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { luaGuardApi } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const C = { bg: '#050508', surface: 'rgba(10,8,22,0.85)', card: 'rgba(12,10,26,0.7)', border: 'rgba(255,255,255,0.05)', purple: '#7c3aed', purpleLight: '#a78bfa', text: '#e8e6ff', muted: '#6b6b8a', dim: '#2e2e48' };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, backdropFilter: 'blur(16px)', ...style }}>{children}</div>;
}

function StatCard({ label, value, icon, accent }: any) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '24px', backdropFilter: 'blur(16px)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [keys, setKeys] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalType, setModalType] = useState<'none'|'script'|'key'>('none');
  const [newItemName, setNewItemName] = useState('');
  const [newItemBody, setNewItemBody] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Check auth
    if (!localStorage.getItem('lg_token')) {
      window.location.href = '/login';
      return;
    }
    Promise.all([luaGuardApi.getKeys(), luaGuardApi.getScripts(), luaGuardApi.getAnalytics()])
      .then(([kRes, sRes, aRes]) => {
        setKeys(kRes.keys || []);
        setScripts(sRes.scripts || []);
        setStats(aRes.stats || []);
      })
      .catch(() => window.location.href = '/login') // Token invalid
      .finally(() => setLoading(false));
  }, []);

  const handleCreateScript = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      await luaGuardApi.createScript(newItemName, newItemBody);
      const sRes = await luaGuardApi.getScripts(); setScripts(sRes.scripts);
      setModalType('none'); setNewItemName(''); setNewItemBody('');
    } catch {} finally { setCreating(false); }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      await luaGuardApi.generateKey(selectedScriptId, newItemName);
      const kRes = await luaGuardApi.getKeys(); setKeys(kRes.keys);
      setModalType('none'); setNewItemName(''); setSelectedScriptId('');
    } catch {} finally { setCreating(false); }
  };

  const inputStyle = { width: '100%', background: 'rgba(4,3,12,0.9)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 12, padding: '12px 16px', color: '#e8e6ff', fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'all 0.2s' };

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading SaaS Dashboard...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif" }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 220, padding: '36px 40px', position: 'relative', zIndex: 1 }}>
        {/* Modal */}
        {modalType !== 'none' && (
          <div onClick={() => setModalType('none')} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(10,8,22,0.95)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 24, padding: '36px', width: '100%', maxWidth: 460 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e8e6ff', marginBottom: 24 }}>{modalType === 'script' ? 'Create New Script' : 'Generate Key'}</div>
              
              {modalType === 'script' ? (
                <form onSubmit={handleCreateScript}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Script Name</div>
                    <input value={newItemName} onChange={e => setNewItemName(e.target.value)} style={inputStyle} placeholder="My Awesome Hub" required />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Script Lua Body</div>
                    <textarea value={newItemBody} onChange={e => setNewItemBody(e.target.value)} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", height: 120, resize: 'none' }} placeholder={'print("Protected")'} required />
                  </div>
                  <button type="submit" disabled={creating} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{creating ? 'Saving...' : 'Create Script'}</button>
                </form>
              ) : (
                <form onSubmit={handleCreateKey}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Select Script</div>
                    <select value={selectedScriptId} onChange={e => setSelectedScriptId(e.target.value)} style={inputStyle} required>
                      <option value="" disabled>Select a script to map to...</option>
                      {scripts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Custom Key (Optional)</div>
                    <input value={newItemName} onChange={e => setNewItemName(e.target.value)} style={inputStyle} placeholder="Auto-generated if blank" />
                  </div>
                  <button type="submit" disabled={creating || scripts.length===0} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{creating ? 'Generating...' : 'Generate Key'}</button>
                </form>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Developer Dashboard</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #d0c8ff 0%, #a78bfa 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Command Center</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setModalType('script')} style={{ padding: '12px 22px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ New Script</button>
            <button onClick={() => setModalType('key')} style={{ padding: '12px 22px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>+ Generate Key</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
          <StatCard label="My Scripts"   value={scripts.length}                       icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} accent="#a78bfa" />
          <StatCard label="Total Keys"   value={keys.length}                          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>} accent="#60a5fa" />
          <StatCard label="HWID Bound"   value={keys.filter(k=>k.hwid).length}        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} accent="#34d399" />
          <StatCard label="Validations"  value={stats.reduce((acc,s)=>acc+s.count,0)} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} accent="#fbbf24" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 400 }}>
            <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700 }}>My Scripts</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {scripts.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: C.muted }}>No scripts. Create one to get started!</div> : scripts.map((s, i) => (
                <div key={i} style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e6ff' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Created: {new Date(s.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 400 }}>
             <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700 }}>My Keys</div>
             <div style={{ flex: 1, overflowY: 'auto' }}>
               {keys.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: C.muted }}>No keys generated.</div> : keys.map((k, i) => (
                 <div key={i} style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#c4b5fd', fontWeight: 500 }}>{k.key_value}</div>
                     <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Script: {k.script_name}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: k.status==='active'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', color: k.status==='active'?'#34d399':'#f87171' }}>{k.status}</div>
                     <div style={{ fontSize: 10, color: C.dim, marginTop: 4, fontFamily: 'monospace' }}>{k.hwid ? 'Bound' : 'Unbound'}</div>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
