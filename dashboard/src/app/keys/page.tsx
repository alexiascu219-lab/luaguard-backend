'use client';
import Sidebar from '@/components/Sidebar';

export default function KeysPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050508', fontFamily: "'Outfit', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: '36px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#e8e6ff', marginBottom: 24 }}>Keys Management</div>
        <div style={{ padding: 24, background: 'rgba(12,10,24,0.85)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', color: '#6b6b8a' }}>
          Advanced Key routing, manual bulk generation, and specific key deletion is coming in v2.1.
          Please use the primary dashboard to generate and view keys for now.
        </div>
      </main>
    </div>
  );
}
