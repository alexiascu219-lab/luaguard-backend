'use client';
import React, { useState } from 'react';

const items = [
  { href: '/',          label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', fill: false },
  { href: '/keys',      label: 'Keys',      icon: 'M21 2 l-9.6 9.6M7.5 21A5.5 5.5 0 1 0 7.5 10a5.5 5.5 0 0 0 0 11zM15.5 7.5l3 3L22 7l-3-3', fill: false, isKey: true },
  { href: '/analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6', fill: false },
  { href: '/security',  label: 'Security',  icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', fill: false },
];

export default function Sidebar() {
  const [active, setActive] = useState('/');

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: 220,
      background: 'rgba(5,4,14,0.92)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, paddingLeft: 8 }}>
        <div style={{
          fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #d0c8ff 0%, #a78bfa 50%, #818cf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>LuaGuard</div>
        <div style={{ fontSize: 9, color: '#3a3a55', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3, fontWeight: 600 }}>v2.0 Enterprise</div>
      </div>

      {/* Nav label */}
      <div style={{ fontSize: 9, fontWeight: 700, color: '#2e2e48', letterSpacing: '0.15em', textTransform: 'uppercase', paddingLeft: 12, marginBottom: 8 }}>Navigation</div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => {
          const isActive = active === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={e => { e.preventDefault(); setActive(item.href); window.location.href = item.href; }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#c4b5fd' : '#4a4a6a',
                background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(124,58,237,0.2)' : 'transparent'}`,
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isActive ? '#7c3aed' : '#2e2e48',
                boxShadow: isActive ? '0 0 8px rgba(124,58,237,0.8)' : 'none',
                flexShrink: 0,
                transition: 'all 0.2s',
              }} />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>
                <path d={item.icon} />
              </svg>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '16px 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#4a4a6a', transition: 'color 0.2s' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2e2e48' }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.6 }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </a>
        <a href="/login" onClick={(e) => { e.preventDefault(); import('@/lib/api').then(m => { m.luaGuardApi.logout(); window.location.href = '/login'; }); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#4a4a6a', transition: 'color 0.2s' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2e2e48' }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0.6 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </a>
      </div>
    </aside>
  );
}
