import React, { useState, useEffect, useRef, useCallback } from 'react';

function useWindowSize() {
  const [s, setS] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => { const fn = () => setS({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  return s;
}

// ============================================
// DATA
// ============================================
const FLOORS = [
  {
    id: 'erl', tag: 'L3', label: 'ERL Level', subtitle: 'KLIA Ekspres & Transit', icon: '✈️',
    elements2D: [
      { x: 40, y: 14, w: 720, h: 26, label: 'TRACK — KLIA EKSPRES', type: 'track', accent: '#3b82f6' },
      { x: 40, y: 48, w: 720, h: 172, type: 'zone', accent: '#3b82f6', zoneLabel: 'KLIA EKSPRES & TRANSIT' },
      { x: 56, y: 58, w: 220, h: 40, label: 'KLIA EKSPRES', sub: 'Non-stop to KLIA', type: 'tag', accent: '#2563eb' },
      { x: 56, y: 116, w: 220, h: 40, label: 'KLIA TRANSIT', sub: 'Putrajaya, Salak Tinggi', type: 'tag', accent: '#7c3aed' },
      { x: 40, y: 228, w: 720, h: 26, label: 'TRACK — KLIA TRANSIT', type: 'track', accent: '#7c3aed' },
      { x: 490, y: 58, w: 145, h: 80, label: 'Check-In', icon: '🧳', type: 'fac', accent: '#f59e0b' },
      { x: 352, y: 62, w: 100, h: 56, label: 'Lounge', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 352, y: 130, w: 100, h: 56, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 648, y: 58, w: 95, h: 56, label: 'Info', icon: '📺', type: 'fac', accent: '#06b6d4' },
      { x: 648, y: 132, w: 95, h: 54, label: 'SOS', icon: '🆘', type: 'fac', accent: '#ef4444' },
      { x: 40, y: 268, w: 720, h: 208, type: 'hall' },
      { x: 490, y: 285, w: 145, h: 78, label: 'Premium Lounge', icon: '🛋️', type: 'fac', accent: '#f59e0b' },
      { x: 56, y: 312, w: 125, h: 78, label: 'Food & Beverage', icon: '🍔', type: 'fac', accent: '#fb923c' },
      { x: 490, y: 378, w: 145, h: 78, label: 'Duty Free', icon: '🛍️', type: 'fac', accent: '#ec4899' },
      { x: 245, y: 280, w: 72, h: 46, label: 'Escalator', icon: '⬇️', type: 'esc', accent: '#8b5cf6' },
      { x: 352, y: 285, w: 52, h: 36, label: 'Lift', icon: '🛗', type: 'esc', accent: '#8b5cf6' },
    ],
  },
  {
    id: 'lrt', tag: 'L2', label: 'LRT & MRT Level', subtitle: 'Kelana Jaya & Kajang', icon: '🚈',
    elements2D: [
      { x: 40, y: 8, w: 340, h: 22, label: 'TRACK — LRT KELANA JAYA', type: 'track', accent: '#f59e0b' },
      { x: 40, y: 36, w: 340, h: 192, type: 'zone', accent: '#f59e0b', zoneLabel: 'LRT KELANA JAYA LINE' },
      { x: 56, y: 46, w: 200, h: 36, label: 'LRT PLATFORM 1 & 2', sub: 'Putra Heights ↔ Gombak', type: 'tag', accent: '#f59e0b' },
      { x: 420, y: 8, w: 340, h: 22, label: 'TRACK — MRT KAJANG', type: 'track', accent: '#10b981' },
      { x: 420, y: 36, w: 340, h: 192, type: 'zone', accent: '#10b981', zoneLabel: 'MRT KAJANG LINE' },
      { x: 436, y: 46, w: 200, h: 36, label: 'MRT PLATFORM 1 & 2', sub: 'Kwasa Damansara ↔ Kajang', type: 'tag', accent: '#10b981' },
      { x: 66, y: 100, w: 96, h: 56, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 196, y: 100, w: 96, h: 56, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 66, y: 166, w: 96, h: 50, label: 'Info', icon: '📺', type: 'fac', accent: '#06b6d4' },
      { x: 446, y: 100, w: 96, h: 56, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 576, y: 100, w: 96, h: 56, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 446, y: 166, w: 96, h: 50, label: 'Info', icon: '📺', type: 'fac', accent: '#06b6d4' },
      { x: 40, y: 250, w: 720, h: 226, type: 'hall' },
      { x: 96, y: 270, w: 36, h: 92, label: 'Entry', type: 'gate', accent: '#f59e0b' },
      { x: 196, y: 270, w: 36, h: 92, label: 'Exit', type: 'gate', accent: '#8b5cf6' },
      { x: 52, y: 392, w: 112, h: 60, label: 'TVM', icon: '🎫', type: 'fac', accent: '#10b981' },
      { x: 186, y: 392, w: 100, h: 60, label: 'Customer Svc', icon: '🧑‍💼', type: 'fac', accent: '#3b82f6' },
      { x: 356, y: 270, w: 72, h: 44, label: 'Escalator', icon: '↕️', type: 'esc', accent: '#8b5cf6' },
      { x: 456, y: 274, w: 52, h: 36, label: 'Lift', icon: '🛗', type: 'esc', accent: '#8b5cf6' },
      { x: 356, y: 420, w: 72, h: 44, label: 'Escalator ↓', icon: '⬇️', type: 'esc', accent: '#8b5cf6' },
      { x: 556, y: 270, w: 100, h: 62, label: 'Shops', icon: '🏪', type: 'fac', accent: '#ec4899' },
      { x: 678, y: 270, w: 72, h: 62, label: 'Restroom', icon: '🚻', type: 'fac', accent: '#6366f1' },
      { x: 556, y: 392, w: 100, h: 60, label: 'Food Court', icon: '🍜', type: 'fac', accent: '#fb923c' },
      { x: 678, y: 392, w: 72, h: 60, label: 'Surau', icon: '🕌', type: 'fac', accent: '#14b8a6' },
    ],
  },
  {
    id: 'concourse', tag: 'L1', label: 'Main Concourse', subtitle: 'KTM Komuter & Hub', icon: '🚂',
    elements2D: [
      { x: 40, y: 40, w: 720, h: 440, type: 'hall' },
      { x: 50, y: 18, w: 300, h: 24, label: 'TRACK — KTM KOMUTER', type: 'track', accent: '#ef4444' },
      { x: 50, y: 50, w: 300, h: 152, type: 'zone', accent: '#ef4444', zoneLabel: 'KTM KOMUTER' },
      { x: 62, y: 58, w: 200, h: 36, label: 'KTM KOMUTER', sub: 'Seremban ↔ Tg Malim', type: 'tag', accent: '#ef4444' },
      { x: 68, y: 108, w: 100, h: 58, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 196, y: 108, w: 100, h: 58, label: 'Waiting', icon: '💺', type: 'fac', accent: '#64748b' },
      { x: 58, y: 222, w: 32, h: 92, label: 'KTM Gates', type: 'gate', accent: '#ef4444' },
      { x: 50, y: 338, w: 112, h: 58, label: 'KTM Ticket', icon: '🎫', type: 'fac', accent: '#10b981' },
      { x: 380, y: 50, w: 372, h: 152, type: 'zone', accent: '#f59e0b', zoneLabel: 'MAIN HALL' },
      { x: 398, y: 86, w: 100, h: 58, label: 'Info', icon: 'ℹ️', type: 'fac', accent: '#06b6d4' },
      { x: 514, y: 86, w: 80, h: 58, label: 'ATM', icon: '🏧', type: 'fac', accent: '#10b981' },
      { x: 624, y: 86, w: 96, h: 58, label: 'Money Changer', icon: '💱', type: 'fac', accent: '#f59e0b' },
      { x: 398, y: 162, w: 200, h: 32, label: 'Walkway → KL Monorail', type: 'walk' },
      { x: 248, y: 240, w: 72, h: 44, label: 'Esc ↑ LRT/MRT', icon: '⬆️', type: 'esc', accent: '#8b5cf6' },
      { x: 368, y: 240, w: 72, h: 44, label: 'Esc ↑ ERL', icon: '⬆️', type: 'esc', accent: '#8b5cf6' },
      { x: 478, y: 244, w: 52, h: 36, label: 'Lift', icon: '🛗', type: 'esc', accent: '#8b5cf6' },
      { x: 568, y: 240, w: 72, h: 44, label: 'Esc ↓ Ground', icon: '⬇️', type: 'esc', accent: '#8b5cf6' },
      { x: 398, y: 310, w: 136, h: 64, label: 'Food Court', icon: '🍜', type: 'fac', accent: '#fb923c' },
      { x: 556, y: 310, w: 94, h: 64, label: 'Pharmacy', icon: '💊', type: 'fac', accent: '#10b981' },
      { x: 674, y: 310, w: 74, h: 64, label: 'Security', icon: '👮', type: 'fac', accent: '#fb923c' },
      { x: 178, y: 338, w: 116, h: 56, label: 'Touch n Go', icon: '💳', type: 'fac', accent: '#10b981' },
      { x: 398, y: 396, w: 80, h: 58, label: 'Restroom', icon: '🚻', type: 'fac', accent: '#6366f1' },
      { x: 498, y: 396, w: 80, h: 58, label: 'Surau', icon: '🕌', type: 'fac', accent: '#14b8a6' },
    ],
  },
  {
    id: 'ground', tag: 'G', label: 'Ground Level', subtitle: 'Entrance, Taxi & Bus', icon: '🚪',
    elements2D: [
      { x: 40, y: 40, w: 720, h: 300, type: 'hall' },
      { x: 40, y: 130, w: 110, h: 88, label: 'Entrance A', sub: 'Jln Stesen', icon: '🚪', type: 'fac', accent: '#3b82f6' },
      { x: 650, y: 130, w: 110, h: 88, label: 'Entrance B', sub: 'Jln Bangsar', icon: '🚪', type: 'fac', accent: '#3b82f6' },
      { x: 338, y: 40, w: 120, h: 66, label: 'Entrance C', sub: 'NU Sentral', icon: '🚪', type: 'fac', accent: '#3b82f6' },
      { x: 40, y: 356, w: 720, h: 42, label: 'JALAN TUN SAMBANTHAN', type: 'road' },
      { x: 215, y: 58, w: 76, h: 48, label: 'Esc ↑', icon: '⬆️', type: 'esc', accent: '#8b5cf6' },
      { x: 305, y: 62, w: 52, h: 40, label: 'Lift ↑', icon: '🛗', type: 'esc', accent: '#8b5cf6' },
      { x: 498, y: 250, w: 130, h: 70, label: 'Taxi / Grab', sub: 'e-Hailing Stand', icon: '🚕', type: 'fac', accent: '#f59e0b' },
      { x: 198, y: 250, w: 150, h: 70, label: 'Bus Terminal', sub: 'GO KL / Rapid', icon: '🚌', type: 'fac', accent: '#f59e0b' },
      { x: 650, y: 45, w: 110, h: 68, label: 'Parking P1', icon: '🅿️', type: 'fac', accent: '#64748b' },
      { x: 368, y: 134, w: 168, h: 82, label: 'NU Sentral Mall', sub: 'Shopping & F&B', icon: '🛒', type: 'fac', accent: '#ec4899' },
      { x: 198, y: 154, w: 82, h: 54, label: 'ATM / Bank', icon: '🏧', type: 'fac', accent: '#10b981' },
      { x: 552, y: 154, w: 82, h: 54, label: 'Vending', icon: '🥤', type: 'fac', accent: '#a855f7' },
      { x: 40, y: 48, w: 130, h: 68, label: 'KTM Kajang Stn', sub: 'Interchange', icon: '🚂', type: 'fac', accent: '#ef4444' },
      { x: 40, y: 408, w: 330, h: 30, label: 'Brickfields / Little India', type: 'walk' },
      { x: 430, y: 408, w: 330, h: 30, label: 'Bangsar / Mid Valley', type: 'walk' },
    ],
  },
];

const PATHS = [
  { id: 'lrt', name: 'LRT Kelana Jaya', subtitle: 'Ampang Park / Putra Heights', color: '#F59E0B', light: '#fef3c7', glow: 'rgba(245,158,11,0.3)', emoji: '🟠', kw: ['lrt', 'kelana', 'ampang', 'putra', 'light rail', 'gombak'], activeFloors: ['ground', 'concourse', 'lrt'], routes: { ground: [{ points: [[94, 174], [232, 82]] }], concourse: [{ points: [[603, 258], [283, 258]] }], lrt: [{ points: [[390, 440], [130, 368], [130, 150]] }] } },
  { id: 'mrt', name: 'MRT Kajang Line', subtitle: 'Muzium Negara / Kajang', color: '#10B981', light: '#d1fae5', glow: 'rgba(16,185,129,0.3)', emoji: '🟢', kw: ['mrt', 'kajang', 'muzium', 'metro', 'kwasa', 'damansara'], activeFloors: ['ground', 'concourse', 'lrt'], routes: { ground: [{ points: [[94, 174], [232, 82]] }], concourse: [{ points: [[603, 258], [283, 258]] }], lrt: [{ points: [[390, 440], [530, 368], [530, 150]] }] } },
  { id: 'erl', name: 'KLIA (Airport)', subtitle: 'KLIA Ekspres / Transit', color: '#3B82F6', light: '#dbeafe', glow: 'rgba(59,130,246,0.3)', emoji: '🔵', kw: ['klia', 'airport', 'erl', 'ekspres', 'flight', 'plane', 'lapangan terbang', 'kapal terbang', 'putrajaya'], activeFloors: ['ground', 'concourse', 'erl'], routes: { ground: [{ points: [[94, 174], [232, 82]] }], concourse: [{ points: [[603, 258], [403, 258]] }], erl: [{ points: [[275, 297], [275, 118]] }] } },
  { id: 'ktm', name: 'KTM Komuter', subtitle: 'Seremban / Tanjung Malim', color: '#EF4444', light: '#fee2e2', glow: 'rgba(239,68,68,0.3)', emoji: '🔴', kw: ['ktm', 'komuter', 'seremban', 'tanjung malim', 'commuter', 'tg malim'], activeFloors: ['ground', 'concourse'], routes: { ground: [{ points: [[94, 174], [232, 82]] }], concourse: [{ points: [[603, 258], [603, 205], [195, 128], [148, 128]] }] } },
  { id: 'exit', name: 'Exit / Taxi / Bus', subtitle: 'NU Sentral, Grab, GO KL', color: '#A855F7', light: '#ede9fe', glow: 'rgba(168,85,247,0.3)', emoji: '🟣', kw: ['exit', 'keluar', 'taxi', 'teksi', 'grab', 'bus', 'bas', 'nu sentral', 'mall', 'shopping', 'beli'], activeFloors: ['concourse', 'ground'], routes: { concourse: [{ points: [[283, 258], [603, 258]] }], ground: [{ points: [[232, 82], [248, 174], [452, 175]] }] } },
];

const crowdColor = v => v > 0.7 ? '#EF4444' : v > 0.4 ? '#F59E0B' : '#10B981';
const crowdLabel = v => v > 0.7 ? 'Crowded' : v > 0.4 ? 'Moderate' : 'Clear';
const useCrowd = () => { const [d, setD] = useState({}); useEffect(() => { const g = () => { const o = {}; FLOORS.forEach(f => o[f.id] = Math.random()); setD(o); }; g(); const t = setInterval(g, 4000); return () => clearInterval(t); }, []); return d; };

// ============================================
// REDESIGNED 2D FLOOR PLAN
// ============================================
const hex = (c, a) => { const n = c.replace('#', ''); const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; };

const FloorPlan2D = ({ floor, selectedPath, onBack, mobile }) => {
  const pd = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  const routes = pd?.routes[floor.id] || [];
  return (
    <div style={{ animation: 'vf 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'linear-gradient(135deg,#ffffff,#f8fafc)', borderBottom: '1px solid #e2e8f0', borderRadius: '14px 14px 0 0', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: '#0f172a', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>← 3D View</button>
        <div>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em' }}>2D FLOOR PLAN</div>
          <div style={{ fontSize: mobile ? '15px' : '17px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: pd?.color || '#64748b', color: 'white', padding: '2px 10px', borderRadius: '7px', fontSize: '13px' }}>{floor.tag}</span>
            {floor.label}
          </div>
        </div>
        {pd && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: pd.light, padding: '6px 12px', borderRadius: '9px', border: `1.5px solid ${pd.color}` }}><span>{pd.emoji}</span><span style={{ fontSize: '11px', fontWeight: '700', color: pd.color }}>{pd.name}</span></div>}
      </div>
      <div style={{ padding: '14px', background: 'white', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', overflowX: 'auto' }}>
        <svg viewBox="0 0 800 490" width="100%" style={{ minWidth: '500px', minHeight: mobile ? '280px' : '360px', borderRadius: '12px', background: '#fbfcfe' }}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#e2e8f0" /></pattern>
            <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" /></filter>
          </defs>
          <rect width="800" height="490" fill="url(#dots)" />

          {floor.elements2D.map((el, i) => {
            const a = el.accent || '#94a3b8';
            if (el.type === 'hall') return <rect key={i} x={el.x} y={el.y} width={el.w} height={el.h} rx="10" fill="#fcfdff" stroke="#eef2f7" strokeWidth="1.5" />;
            if (el.type === 'zone') return (
              <g key={i}>
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="12" fill={hex(a, 0.06)} stroke={hex(a, 0.4)} strokeWidth="1.5" strokeDasharray="2 4" />
                {el.zoneLabel && <text x={el.x + el.w - 12} y={el.y + el.h - 10} textAnchor="end" fontSize="10" fontWeight="800" fill={hex(a, 0.5)} letterSpacing="0.1em">{el.zoneLabel}</text>}
              </g>
            );
            if (el.type === 'track') return (
              <g key={i}>
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="5" fill={hex(a, 0.12)} stroke={hex(a, 0.5)} strokeWidth="1.5" />
                <line x1={el.x + 8} y1={el.y + el.h / 2} x2={el.x + el.w - 8} y2={el.y + el.h / 2} stroke={hex(a, 0.4)} strokeWidth="2" strokeDasharray="14 8" />
                <text x={el.x + el.w / 2} y={el.y + el.h / 2} textAnchor="middle" fontSize="10" fontWeight="800" fill={a} dominantBaseline="central" style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '3px' }}>{el.label}</text>
              </g>
            );
            if (el.type === 'gate') return (
              <g key={i}>
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="5" fill={hex(a, 0.15)} stroke={a} strokeWidth="2" strokeDasharray="6 3" />
                <text x={el.x + el.w / 2} y={el.y + el.h / 2} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={a} dominantBaseline="central" transform={`rotate(90 ${el.x + el.w / 2} ${el.y + el.h / 2})`}>{el.label}</text>
              </g>
            );
            if (el.type === 'road' || el.type === 'walk') return (
              <g key={i}>
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="4" fill={el.type === 'road' ? '#f1f5f9' : '#f8fafc'} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray={el.type === 'walk' ? '5 4' : 'none'} />
                <text x={el.x + el.w / 2} y={el.y + el.h / 2} textAnchor="middle" fontSize="10" fontWeight="700" fill="#94a3b8" dominantBaseline="central" letterSpacing="0.05em">{el.label}</text>
              </g>
            );
            if (el.type === 'tag') return (
              <g key={i}>
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="9" fill={a} filter="url(#sh)" />
                <text x={el.x + 14} y={el.y + (el.sub ? el.h / 2 - 7 : el.h / 2)} fontSize="13" fontWeight="800" fill="white" dominantBaseline="central">{el.label}</text>
                {el.sub && <text x={el.x + 14} y={el.y + el.h / 2 + 9} fontSize="9" fill={hex('#ffffff', 0.85)} dominantBaseline="central">{el.sub}</text>}
              </g>
            );
            if (el.type === 'esc') return (
              <g key={i} filter="url(#sh)">
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="9" fill={hex(a, 0.12)} stroke={a} strokeWidth="1.5" />
                <text x={el.x + el.w / 2} y={el.y + el.h / 2 - 6} textAnchor="middle" fontSize="16" dominantBaseline="central">{el.icon}</text>
                <text x={el.x + el.w / 2} y={el.y + el.h / 2 + 11} textAnchor="middle" fontSize="8" fontWeight="700" fill={a} dominantBaseline="central">{el.label}</text>
              </g>
            );
            // facility
            return (
              <g key={i} filter="url(#sh)">
                <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="10" fill="white" stroke={hex(a, 0.35)} strokeWidth="1.5" />
                <rect x={el.x} y={el.y} width={el.w} height="4" rx="2" fill={a} />
                <circle cx={el.x + 22} cy={el.y + el.h / 2} r="15" fill={hex(a, 0.12)} />
                <text x={el.x + 22} y={el.y + el.h / 2} textAnchor="middle" fontSize="17" dominantBaseline="central">{el.icon}</text>
                <text x={el.x + 44} y={el.y + (el.sub ? el.h / 2 - 7 : el.h / 2)} fontSize="11.5" fontWeight="700" fill="#1e293b" dominantBaseline="central">{el.label}</text>
                {el.sub && <text x={el.x + 44} y={el.y + el.h / 2 + 9} fontSize="9" fill="#94a3b8" dominantBaseline="central">{el.sub}</text>}
              </g>
            );
          })}

          {/* Path */}
          {routes.map((r, ri) => { const d = r.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' '); return (
            <g key={ri}>
              <path d={d} fill="none" stroke={pd.color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
              <path d={d} fill="none" stroke={pd.color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
              <path d={d} fill="none" stroke={pd.color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="11 8"><animate attributeName="stroke-dashoffset" from="0" to="-38" dur="2s" repeatCount="indefinite" /></path>
              {/* Start marker */}
              <g><circle cx={r.points[0][0]} cy={r.points[0][1]} r="11" fill="white" stroke={pd.color} strokeWidth="3" /><circle cx={r.points[0][0]} cy={r.points[0][1]} r="4" fill={pd.color} /><text x={r.points[0][0]} y={r.points[0][1] - 20} textAnchor="middle" fontSize="9" fontWeight="800" fill={pd.color}>START</text></g>
              {/* End marker */}
              <g><circle cx={r.points[r.points.length - 1][0]} cy={r.points[r.points.length - 1][1]} r="16" fill={pd.color} opacity="0.15"><animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" /></circle><circle cx={r.points[r.points.length - 1][0]} cy={r.points[r.points.length - 1][1]} r="12" fill={pd.color} /><text x={r.points[r.points.length - 1][0]} y={r.points[r.points.length - 1][1] + 1} textAnchor="middle" fontSize="13" fill="white" dominantBaseline="central">📍</text></g>
            </g>
          ); })}
          {!pd && PATHS.map(p => (p.routes[floor.id] || []).map((r, ri) => <path key={`${p.id}-${ri}`} d={r.points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0]},${pt[1]}`).join(' ')} fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" strokeDasharray="6 6" />))}
        </svg>
      </div>
    </div>
  );
};

// ============================================
// ISO with rotation support
// ============================================
const makeIso = (cx, sc, rot) => {
  const rad = rot * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return {
    x: (x, y) => { const px = (x - 55), py = (y - 40); const rx = px * cos - py * sin; const ry = px * sin + py * cos; return cx + (rx - ry) * sc; },
    y: (x, y) => { const px = (x - 55), py = (y - 40); const rx = px * cos - py * sin; const ry = px * sin + py * cos; return 80 + (rx + ry) * (sc * 0.5); },
  };
};

const IsoSlab = ({ floor, yOff, isActive, pathColor, onClick, iso, crowdVal, showCrowd, allPaths, selectedPath }) => {
  const W = 110, H = 80, d = 18, cc = showCrowd ? crowdColor(crowdVal || 0) : null;
  const [hv, setHv] = useState(false);
  const pts = [[iso.x(0, 0), iso.y(0, 0)], [iso.x(W, 0), iso.y(W, 0)], [iso.x(W, H), iso.y(W, H)], [iso.x(0, H), iso.y(0, H)]];
  const ctr = [iso.x(W / 2, H / 2), iso.y(W / 2, H / 2)];
  return (
    <g transform={`translate(0,${yOff})`} style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)}>
      <polygon points={pts.map(([x, y]) => `${x + 5},${y + d + 8}`).join(' ')} fill="rgba(0,0,0,0.03)" />
      <polygon points={`${pts[2].join(',')},${pts[3].join(',')},${pts[3][0]},${pts[3][1] + d},${pts[2][0]},${pts[2][1] + d}`} fill={showCrowd ? `${cc}25` : isActive ? `${pathColor}28` : '#e2e8f0'} stroke={showCrowd ? `${cc}55` : isActive ? `${pathColor}55` : '#cbd5e1'} strokeWidth="0.5" />
      <polygon points={`${pts[1].join(',')},${pts[2].join(',')},${pts[2][0]},${pts[2][1] + d},${pts[1][0]},${pts[1][1] + d}`} fill={showCrowd ? `${cc}18` : isActive ? `${pathColor}18` : '#e8ecf0'} stroke={showCrowd ? `${cc}40` : isActive ? `${pathColor}40` : '#cbd5e1'} strokeWidth="0.5" />
      <polygon points={pts.map(p => p.join(',')).join(' ')} fill={showCrowd ? `${cc}08` : isActive ? `${pathColor}10` : hv ? '#f0f4f8' : '#fff'} stroke={showCrowd ? cc : isActive ? pathColor : hv ? '#94a3b8' : '#cbd5e1'} strokeWidth={isActive || showCrowd ? 2 : hv ? 1.2 : 0.7} />
      {allPaths.map(p => { const rts = p.routes[floor.id] || []; const isSel = p.id === selectedPath; return rts.map((route, ri) => { const ipp = route.points.map(([x, y]) => [iso.x(x / 7.27, y / 6), iso.y(x / 7.27, y / 6)]); return ipp.length > 1 ? (<polyline key={`${p.id}-${ri}`} points={ipp.map(pt => pt.join(',')).join(' ')} fill="none" stroke={p.color} strokeWidth={isSel ? 3.5 : 1.5} strokeLinecap="round" strokeLinejoin="round" opacity={isSel ? 0.85 : 0.12} strokeDasharray={isSel ? '5 4' : 'none'}>{isSel && <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />}</polyline>) : null; }); })}
      <text x={ctr[0]} y={ctr[1] - 8} textAnchor="middle" fontSize="22" dominantBaseline="central">{floor.icon}</text>
      <text x={ctr[0]} y={ctr[1] + 12} textAnchor="middle" fontSize="6" fontWeight="800" fill={showCrowd ? cc : isActive ? pathColor : '#475569'} dominantBaseline="central">{floor.label}</text>
      <text x={ctr[0]} y={ctr[1] + 22} textAnchor="middle" fontSize="4.5" fontWeight="600" fill={hv ? '#3b82f6' : '#94a3b8'} dominantBaseline="central">TAP → 2D PLAN</text>
      <g><rect x={pts[3][0] - 30} y={pts[3][1] - 4} width="30" height="22" rx="6" fill={showCrowd ? cc : isActive ? pathColor : '#f1f5f9'} stroke={showCrowd ? cc : isActive ? pathColor : '#cbd5e1'} strokeWidth="0.8" /><text x={pts[3][0] - 15} y={pts[3][1] + 7} textAnchor="middle" fontSize="10" fontWeight="900" fill={isActive || showCrowd ? 'white' : '#475569'} dominantBaseline="central">{floor.tag}</text></g>
      {showCrowd && crowdVal !== undefined && (<g><rect x={pts[1][0] + 6} y={pts[1][1]} width="52" height="16" rx="4" fill={cc} opacity="0.15" /><circle cx={pts[1][0] + 13} cy={pts[1][1] + 8} r="3" fill={cc}><animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" /></circle><text x={pts[1][0] + 20} y={pts[1][1] + 8.5} fontSize="5" fontWeight="700" fill={cc} dominantBaseline="central">{crowdLabel(crowdVal)}</text></g>)}
    </g>
  );
};

// ============================================
// CHATBOT (offline-reliable)
// ============================================
const RESP = {
  lrt: { en: "Follow the 🟠 ORANGE path on the floor to reach LRT Kelana Jaya Line!", ms: "Ikut laluan 🟠 ORANGE di lantai untuk ke LRT Kelana Jaya!" },
  mrt: { en: "Follow the 🟢 GREEN path to reach MRT Kajang Line!", ms: "Ikut laluan 🟢 HIJAU untuk ke MRT Kajang Line!" },
  erl: { en: "Going to the airport? ✈️ Follow the 🔵 BLUE path to KLIA Ekspres / Transit!", ms: "Nak ke lapangan terbang? ✈️ Ikut laluan 🔵 BIRU ke KLIA Ekspres / Transit!" },
  ktm: { en: "Follow the 🔴 RED path to reach KTM Komuter platform!", ms: "Ikut laluan 🔴 MERAH untuk ke platform KTM Komuter!" },
  exit: { en: "Follow the 🟣 PURPLE path to Exit, Taxi, Bus & NU Sentral Mall!", ms: "Ikut laluan 🟣 UNGU ke Exit, Teksi, Bas & NU Sentral!" },
};
const detectLang = t => /[\u4e00-\u9fff]/.test(t) ? 'zh' : /\b(nak|pergi|saya|macam|mana|ke|tolong|nak|cari|teksi|keluar|bas)\b/i.test(t) ? 'ms' : 'en';

const AIChatbot = ({ onSelect }) => {
  const [msgs, setMsgs] = useState([{ role: 'a', text: "Hi! 👋 I'm your KL Sentral AI Navigator.\nTell me where you want to go — any language!\n\nTry: \"Nak pergi KLIA\", \"How to LRT?\", \"我要去机场\"" }]);
  const [inp, setInp] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const matchLocal = (t) => { const l = t.toLowerCase(); for (const p of PATHS) if (p.kw.some(k => l.includes(k))) return p; return null; };

  const send = async () => {
    if (!inp.trim() || busy) return;
    const u = inp.trim(); setInp(''); setMsgs(p => [...p, { role: 'u', text: u }]); setBusy(true);

    // Instant local match (always works)
    const local = matchLocal(u);
    const lang = detectLang(u);

    // Try API for nicer multilingual reply, but don't depend on it
    let handled = false;
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, system: `You are an AI navigator at KL Sentral. Destinations: ORANGE=LRT Kelana Jaya, GREEN=MRT Kajang, BLUE=KLIA Airport, RED=KTM Komuter, PURPLE=Exit/Taxi/Bus/NU Sentral. Reply in user's language, 1-2 sentences, name the COLOR. End with one tag: [PATH:lrt|mrt|erl|ktm|exit]. If unclear ask a short question (no tag).`, messages: [{ role: "user", content: u }] }),
      });
      clearTimeout(to);
      if (r.ok) {
        const d = await r.json();
        const reply = d.content?.map(c => c.text || '').join('') || '';
        const tag = reply.match(/\[PATH:(\w+)\]/);
        const clean = reply.replace(/\[PATH:\w+\]/g, '').trim();
        if (clean) { setMsgs(p => [...p, { role: 'a', text: clean }]); handled = true; if (tag && PATHS.find(x => x.id === tag[1])) setTimeout(() => onSelect(tag[1]), 400); }
      }
    } catch (e) { /* fall through to local */ }

    // Local fallback
    if (!handled) {
      if (local) {
        const msg = RESP[local.id][lang === 'zh' ? 'en' : lang] || RESP[local.id].en;
        setMsgs(p => [...p, { role: 'a', text: msg }]);
        setTimeout(() => onSelect(local.id), 400);
      } else {
        setMsgs(p => [...p, { role: 'a', text: lang === 'ms' ? "Saya boleh tunjuk jalan ke: LRT, MRT, KLIA, KTM, atau Exit/Teksi. Nak ke mana?" : "I can guide you to: LRT, MRT, KLIA, KTM, or Exit/Taxi. Which one?" }]);
      }
    }
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {msgs.map((m, i) => (<div key={i} style={{ display: 'flex', justifyContent: m.role === 'u' ? 'flex-end' : 'flex-start' }}><div style={{ maxWidth: '85%', padding: '9px 12px', borderRadius: '12px', background: m.role === 'u' ? '#3b82f6' : '#f1f5f9', color: m.role === 'u' ? 'white' : '#1e293b', fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', borderBottomRightRadius: m.role === 'u' ? '3px' : '12px', borderBottomLeftRadius: m.role === 'a' ? '3px' : '12px' }}>{m.role === 'a' && <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '3px' }}>🤖 AI Navigator</span>}{m.text}</div></div>))}
        {busy && <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px 12px', background: '#f1f5f9', borderRadius: '12px', width: 'fit-content' }}>● ● ●</div>}
        <div ref={ref} />
      </div>
      <div style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', background: 'white' }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type destination..." style={{ flex: 1, padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '12px', outline: 'none', background: '#f8fafc' }} />
        <button onClick={send} disabled={busy} style={{ padding: '9px 14px', borderRadius: '9px', border: 'none', background: '#3b82f6', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', opacity: busy ? 0.6 : 1, flexShrink: 0 }}>Send</button>
      </div>
      <div style={{ padding: '6px 10px 10px', display: 'flex', gap: '5px', flexWrap: 'wrap', background: 'white' }}>
        {['Nak pergi KLIA', 'How to LRT?', 'Exit ke taxi', 'KTM Seremban'].map(q => <button key={q} onClick={() => setInp(q)} style={{ fontSize: '10px', padding: '4px 9px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}>{q}</button>)}
      </div>
    </div>
  );
};

const ARView = ({ selectedPath }) => {
  const pd = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  return (
    <div style={{ background: '#0f172a', borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '100%', minHeight: '280px' }}>
      <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs><pattern id="ag" width="50" height="40" patternUnits="userSpaceOnUse" patternTransform="skewX(-15)"><rect width="50" height="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" /></pattern></defs>
        <rect width="400" height="280" fill="url(#ag)" />
        {pd ? (<g>
          <line x1="200" y1="270" x2="200" y2="70" stroke={pd.color} strokeWidth="28" opacity="0.12" strokeLinecap="round" />
          <line x1="200" y1="270" x2="200" y2="70" stroke={pd.color} strokeWidth="6" opacity="0.8" strokeLinecap="round" strokeDasharray="12 10"><animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.5s" repeatCount="indefinite" /></line>
          {[0, 1, 2, 3].map(i => <polygon key={i} points={`200,${225 - i * 48} 187,${243 - i * 48} 213,${243 - i * 48}`} fill={pd.color}><animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" /></polygon>)}
          <rect x="140" y="50" width="120" height="32" rx="8" fill={pd.color} opacity="0.95" />
          <text x="200" y="63" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" dominantBaseline="central">{pd.name}</text>
          <text x="200" y="75" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)" dominantBaseline="central">~120m ahead</text>
        </g>) : (<g><text x="200" y="130" textAnchor="middle" fontSize="28">📱</text><text x="200" y="160" textAnchor="middle" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.3)">Select a destination first</text></g>)}
      </svg>
      <div style={{ position: 'absolute', inset: '10px', border: '2px solid rgba(255,255,255,0.12)', borderRadius: '10px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '7px', fontSize: '9px', fontWeight: '700', color: 'white', letterSpacing: '0.1em' }}>📷 AR CAMERA (Simulated)</div>
    </div>
  );
};

// ============================================
// MAIN
// ============================================
export default function App() {
  const { w } = useWindowSize();
  const mob = w < 768;
  const [selPath, setSelPath] = useState(null);
  const [view, setView] = useState('3d');
  const [aiMode, setAiMode] = useState('paths');
  const [access, setAccess] = useState(false);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  const crowd = useCrowd();

  // 3D controls
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  const pd = selPath ? PATHS.find(p => p.id === selPath) : null;
  const gap = mob ? 150 : 190;
  const baseCx = mob ? 200 : 360;
  const baseSc = mob ? 1.4 : 2.7;
  const iso = makeIso(baseCx, baseSc, rot);
  const svgH = FLOORS.length * gap + (mob ? 180 : 240);

  const doScan = () => { setScanBusy(true); setScanRes(null); setTimeout(() => { const r = PATHS[Math.floor(Math.random() * (PATHS.length - 1))]; setScanRes(r); setSelPath(r.id); setScanBusy(false); }, 2000); };

  // Drag to pan
  const onDown = (e) => { const pt = e.touches ? e.touches[0] : e; drag.current = { x: pt.clientX, y: pt.clientY, px: pan.x, py: pan.y }; };
  const onMove = (e) => { if (!drag.current) return; const pt = e.touches ? e.touches[0] : e; setPan({ x: drag.current.px + (pt.clientX - drag.current.x), y: drag.current.py + (pt.clientY - drag.current.y) }); };
  const onUp = () => { drag.current = null; };
  const onWheel = (e) => { e.preventDefault(); setZoom(z => Math.min(2.2, Math.max(0.5, z - e.deltaY * 0.001))); };
  const resetView = () => { setZoom(1); setRot(0); setPan({ x: 0, y: 0 }); };

  const AI_TABS = [{ id: 'paths', label: '🗺️ Paths' }, { id: 'chatbot', label: '🤖 AI Chat' }, { id: 'crowd', label: '📊 Crowd' }, { id: 'ar', label: '📱 AR' }, { id: 'access', label: '♿ Access' }, { id: 'scan', label: '💳 Scan' }];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans',-apple-system,sans-serif", color: '#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes vf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes si{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sp{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}70%{box-shadow:0 0 0 18px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        input:focus{border-color:#93c5fd!important}
        input[type=range]{accent-color:#3b82f6}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: mob ? '10px 12px' : '12px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.2em' }}>KL SENTRAL • AI-ENHANCED</div>
          <h1 style={{ fontSize: mob ? '14px' : '17px', fontWeight: '900' }}>🚉 KL Sentral — Smart Floor Signage</h1>
        </div>
        <div style={{ display: 'flex', gap: '3px', background: '#f1f5f9', borderRadius: '9px', padding: '3px', border: '1px solid #e2e8f0', overflowX: 'auto', flexShrink: 0 }}>
          {[{ id: '3d', l: '🧊 3D' }, ...FLOORS.map(f => ({ id: f.id, l: f.tag }))].map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{ padding: mob ? '5px 9px' : '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: view === t.id ? 'white' : 'transparent', color: view === t.id ? '#0f172a' : '#94a3b8', boxShadow: view === t.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* AI TABS */}
      <div style={{ padding: '6px 10px', background: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', display: 'flex', gap: '4px' }}>
        {AI_TABS.map(m => (<button key={m.id} onClick={() => setAiMode(m.id)} style={{ padding: mob ? '6px 10px' : '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: mob ? '10px' : '11px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0, background: aiMode === m.id ? '#0f172a' : '#f1f5f9', color: aiMode === m.id ? 'white' : '#64748b' }}>{m.label}</button>))}
      </div>

      {/* BODY */}
      <div style={{ display: mob ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '330px 1fr', minHeight: 'calc(100vh - 98px)' }}>

        {/* LEFT */}
        <div style={{ borderRight: mob ? 'none' : '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: mob ? (aiMode === 'chatbot' || aiMode === 'ar' ? '52vh' : 'auto') : 'calc(100vh - 98px)', overflowY: 'auto', ...(mob ? { borderBottom: '1px solid #e2e8f0' } : {}) }}>
          {aiMode === 'paths' && (
            <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', marginBottom: '2px' }}>NAK PERGI MANA?</div>
              {PATHS.map((p, i) => { const is = selPath === p.id; return (
                <button key={p.id} onClick={() => setSelPath(is ? null : p.id)} style={{ background: is ? p.light : 'white', border: is ? `2px solid ${p.color}` : '2px solid #e2e8f0', borderRadius: '11px', padding: '11px 12px', cursor: 'pointer', textAlign: 'left', color: '#0f172a', boxShadow: is ? `0 3px 10px ${p.glow}` : '0 1px 2px rgba(0,0,0,0.03)', animation: `si 0.25s ease ${i * 0.04}s both` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: is ? p.color : p.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{p.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '12px', fontWeight: '700', color: is ? p.color : '#1e293b' }}>{p.name}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.subtitle}</div></div>
                    {is && <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: '800', flexShrink: 0 }}>✓</div>}
                  </div>
                </button>
              ); })}
              {access && pd && <div style={{ padding: '8px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9px', fontSize: '11px', color: '#1e40af' }}>♿ <b>Accessibility:</b> Using Lifts not Escalators</div>}
            </div>
          )}
          {aiMode === 'chatbot' && <AIChatbot onSelect={setSelPath} />}
          {aiMode === 'crowd' && (
            <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>📊 LIVE CROWD DENSITY</div>
              {FLOORS.map(f => { const v = crowd[f.id] || 0; return (
                <div key={f.id} style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '9px', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ fontSize: '12px', fontWeight: '700' }}>{f.icon} {f.tag}</span><span style={{ fontSize: '10px', fontWeight: '700', color: crowdColor(v), background: `${crowdColor(v)}15`, padding: '2px 7px', borderRadius: '5px' }}>{crowdLabel(v)}</span></div>
                  <div style={{ height: '5px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '3px', background: crowdColor(v), width: `${v * 100}%`, transition: 'all 1s' }} /></div>
                </div>
              ); })}
              <div style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '10px', color: '#166534' }}>💡 <b>AI Tip:</b> {crowd.erl < 0.4 ? 'ERL clear — great time!' : crowd.ground > 0.7 ? 'Ground busy — use Entrance B.' : 'Normal flow.'}</div>
            </div>
          )}
          {aiMode === 'ar' && <div style={{ padding: '10px', height: mob ? '46vh' : '100%' }}><div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', marginBottom: '6px' }}>📱 AR CAMERA NAVIGATION</div><ARView selectedPath={selPath} /></div>}
          {aiMode === 'access' && (
            <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>♿ ACCESSIBILITY</div>
              {[{ id: 'wc', l: 'Wheelchair / OKU', ic: '♿', d: 'Lifts only, no escalators' }, { id: 'el', l: 'Elderly', ic: '👴', d: 'Shorter, calmer routes' }, { id: 'vi', l: 'Visual Impairment', ic: '👁️', d: 'High-contrast + audio' }, { id: 'lg', l: 'Heavy Luggage', ic: '🧳', d: 'Wide paths, lift priority' }].map(o => (
                <button key={o.id} onClick={() => o.id === 'wc' && setAccess(!access)} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '11px', padding: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{o.ic}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '700' }}>{o.l}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{o.d}</div></div>
                  <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: (o.id === 'wc' && access) ? '#10b981' : '#e2e8f0', display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0 }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transform: (o.id === 'wc' && access) ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.3s' }} /></div>
                </button>
              ))}
            </div>
          )}
          {aiMode === 'scan' && (
            <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', alignSelf: 'flex-start' }}>💳 SMART CARD SCAN</div>
              <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Tap Touch 'n Go to auto-detect destination</div>
              <button onClick={doScan} disabled={scanBusy} style={{ width: '130px', height: '130px', borderRadius: '50%', border: '3px solid #3b82f6', background: scanBusy ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '34px', animation: scanBusy ? 'sp 1.5s infinite' : 'none' }}>
                {scanBusy ? <div style={{ width: '34px', height: '34px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : '💳'}
                <span style={{ fontSize: '11px', fontWeight: '700', color: scanBusy ? '#3b82f6' : '#64748b' }}>{scanBusy ? 'Scanning...' : 'Tap to Scan'}</span>
              </button>
              {scanRes && <div style={{ padding: '12px 16px', background: scanRes.light, border: `2px solid ${scanRes.color}`, borderRadius: '12px', textAlign: 'center', animation: 'vf 0.4s', width: '100%' }}><div style={{ fontSize: '24px' }}>{scanRes.emoji}</div><div style={{ fontSize: '14px', fontWeight: '800', color: scanRes.color }}>{scanRes.name}</div></div>}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ padding: mob ? '10px' : '14px', overflowY: 'auto', maxHeight: mob ? 'none' : 'calc(100vh - 98px)', background: '#f1f5f9' }}>
          {view === '3d' ? (
            <div style={{ animation: 'vf 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>{aiMode === 'crowd' ? '📊 3D CROWD HEATMAP' : '🧊 3D — DRAG ROTATE • SCROLL ZOOM • TAP FLOOR'}</div>
                {pd && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: pd.light, padding: '3px 8px', borderRadius: '7px', border: `1px solid ${pd.color}30` }}><span style={{ fontSize: '11px' }}>{pd.emoji}</span><span style={{ fontSize: '10px', fontWeight: '700', color: pd.color }}>{pd.name}</span></div>}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                {/* 3D controls overlay */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button onClick={() => setZoom(z => Math.min(2.2, z + 0.2))} style={ctrlBtn}>＋</button>
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} style={ctrlBtn}>－</button>
                  <button onClick={() => setRot(r => r - 15)} style={ctrlBtn}>⟲</button>
                  <button onClick={() => setRot(r => r + 15)} style={ctrlBtn}>⟳</button>
                  <button onClick={resetView} style={{ ...ctrlBtn, fontSize: '14px' }}>⊙</button>
                </div>
                {/* Rotation slider */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '60px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>⟳</span>
                  <input type="range" min="-180" max="180" value={rot} onChange={e => setRot(Number(e.target.value))} style={{ flex: 1, height: '4px' }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', minWidth: '32px' }}>{rot}°</span>
                </div>

                <div
                  style={{ padding: mob ? '6px 2px 14px' : '12px 6px 22px', cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none' }}
                  onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                  onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
                  onWheel={onWheel}
                >
                  <svg viewBox={`${mob ? -15 : -50} -20 ${mob ? 400 : 780} ${svgH}`} width="100%" style={{ display: 'block' }}>
                    <defs><radialGradient id="bg"><stop offset="0%" stopColor={pd ? pd.color : '#cbd5e1'} stopOpacity="0.04" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient></defs>
                    <rect x="-60" y="-20" width="800" height={svgH + 40} fill="url(#bg)" />
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: 'center', transition: drag.current ? 'none' : 'transform 0.15s ease' }}>
                      {[...FLOORS].reverse().map((floor, ri) => {
                        const fi = FLOORS.length - 1 - ri;
                        const yOff = (FLOORS.length - 1 - fi) * gap;
                        const isActive = pd && pd.activeFloors?.includes(floor.id);
                        const hasConn = isActive && fi < FLOORS.length - 1 && pd.activeFloors?.includes(FLOORS[fi + 1]?.id);
                        const ctrX = iso.x(55, 40);
                        return (
                          <g key={floor.id}>
                            <IsoSlab floor={floor} yOff={yOff} isActive={!!isActive} pathColor={pd?.color || '#64748b'} onClick={() => !drag.current && setView(floor.id)} iso={iso} crowdVal={crowd[floor.id]} showCrowd={aiMode === 'crowd'} allPaths={PATHS} selectedPath={selPath} />
                            {hasConn && pd && (
                              <line x1={ctrX} y1={yOff + (mob ? 80 : 105)} x2={ctrX} y2={yOff + gap - 6} stroke={aiMode === 'crowd' ? crowdColor(crowd[floor.id] || 0) : pd.color} strokeWidth="2.5" strokeDasharray="6 5" opacity="0.35"><animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite" /></line>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              </div>

              {aiMode === 'crowd' && <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>{[['#10B981', 'Clear'], ['#F59E0B', 'Moderate'], ['#EF4444', 'Crowded']].map(([c, l], i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} /><span style={{ fontSize: '9px', fontWeight: '600', color: '#64748b' }}>{l}</span></div>)}</div>}
              {!selPath && aiMode !== 'crowd' && <div style={{ textAlign: 'center', marginTop: '14px' }}><div style={{ fontSize: '24px', marginBottom: '4px' }}>{mob ? '👆' : '👈'}</div><div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>{aiMode === 'chatbot' ? 'Ask AI chatbot!' : aiMode === 'scan' ? 'Tap card to scan!' : 'Pilih destinasi'}</div></div>}
            </div>
          ) : (
            <FloorPlan2D floor={FLOORS.find(f => f.id === view)} selectedPath={selPath} onBack={() => setView('3d')} mobile={mob} />
          )}
        </div>
      </div>
    </div>
  );
}

const ctrlBtn = { width: '34px', height: '34px', borderRadius: '9px', border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)', color: '#475569', fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)' };
