import React, { useState, useEffect, useRef } from 'react';

// ============================================
// ISOMETRIC HELPERS
// ============================================
const isoX = (x, y, cx = 340, s = 3.0) => cx + (x - y) * s;
const isoY = (x, y, cy = 80, s = 1.5) => cy + (x + y) * s;

// ============================================
// FLOOR DATA — MRT KAJANG
// ============================================
const FLOORS = [
  {
    id: 'platform', tag: 'L2', label: 'Platform Level', subtitle: 'Platform 1 & 2',
    elements2D: [
      { id: 'track1', x: 40, y: 20, w: 720, h: 50, label: '══ TRACK 1 — Northbound ══', type: 'track', color: '#fed7aa', border: '#f97316', textColor: '#9a3412' },
      { id: 'track2', x: 40, y: 430, w: 720, h: 50, label: '══ TRACK 2 — Southbound ══', type: 'track', color: '#d1fae5', border: '#10b981', textColor: '#065f46' },
      { id: 'p1', x: 40, y: 80, w: 720, h: 150, label: '', type: 'platform', color: '#fef3c7', border: '#f59e0b' },
      { id: 'p1l', x: 55, y: 88, w: 210, h: 36, label: 'PLATFORM 1', sublabel: 'To Kwasa Damansara →', type: 'label-zone', color: '#fbbf2420', border: '#f59e0b', textColor: '#92400e' },
      { id: 'p2', x: 40, y: 270, w: 720, h: 150, label: '', type: 'platform', color: '#d1fae5', border: '#10b981' },
      { id: 'p2l', x: 55, y: 278, w: 210, h: 36, label: 'PLATFORM 2', sublabel: '← To Kajang (Terminal)', type: 'label-zone', color: '#10b98120', border: '#10b981', textColor: '#065f46' },
      { id: 'w1a', x: 80, y: 140, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'w1b', x: 340, y: 140, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'w1c', x: 600, y: 140, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 's1a', x: 200, y: 143, w: 85, h: 45, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 's1b', x: 470, y: 143, w: 85, h: 45, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 'sos1', x: 700, y: 140, w: 52, h: 55, label: 'Emergency', icon: '🆘', type: 'facility', color: '#fee2e2', border: '#fca5a5' },
      { id: 'w2a', x: 80, y: 320, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'w2b', x: 340, y: 320, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'w2c', x: 600, y: 320, w: 80, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 's2a', x: 200, y: 328, w: 85, h: 45, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 's2b', x: 470, y: 328, w: 85, h: 45, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 'sos2', x: 700, y: 320, w: 52, h: 55, label: 'Emergency', icon: '🆘', type: 'facility', color: '#fee2e2', border: '#fca5a5' },
      { id: 'ea', x: 280, y: 232, w: 65, h: 35, label: 'Escalator ↓', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'eb', x: 460, y: 232, w: 65, h: 35, label: 'Escalator ↓', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lp', x: 380, y: 234, w: 45, h: 30, label: 'Lift', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
    ],
  },
  {
    id: 'concourse', tag: 'L1', label: 'Concourse Level', subtitle: 'Ticketing & Services',
    elements2D: [
      { id: 'ca', x: 40, y: 40, w: 720, h: 420, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      { id: 'tvm1', x: 55, y: 55, w: 95, h: 65, label: 'TVM 1-3', sublabel: 'Ticket Vending', icon: '🎫', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'tvm2', x: 55, y: 135, w: 95, h: 65, label: 'TVM 4-6', sublabel: 'Ticket Vending', icon: '🎫', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'cs', x: 55, y: 218, w: 95, h: 72, label: 'Customer Service', icon: '🧑‍💼', type: 'facility', color: '#dbeafe', border: '#93c5fd' },
      { id: 'tu', x: 55, y: 308, w: 95, h: 62, label: 'Touch n Go Top-Up', icon: '💳', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'gi', x: 218, y: 75, w: 32, h: 165, label: 'Entry Gates', type: 'gate', color: '#fef3c7', border: '#fbbf24', vertical: true },
      { id: 'go', x: 218, y: 275, w: 32, h: 145, label: 'Exit Gates', type: 'gate', color: '#ede9fe', border: '#a78bfa', vertical: true },
      { id: 'pz', x: 278, y: 55, w: 325, h: 390, label: '', type: 'paid-zone', color: '#fffbeb', border: '#fcd34d' },
      { id: 'pl', x: 288, y: 62, w: 100, h: 18, label: '● PAID ZONE', type: 'text-only', textColor: '#b45309' },
      { id: 'esca', x: 340, y: 175, w: 72, h: 55, label: 'Escalator A', sublabel: '↑ To Platforms', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'escb', x: 480, y: 175, w: 72, h: 55, label: 'Escalator B', sublabel: '↑ To Platforms', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lc', x: 420, y: 185, w: 46, h: 38, label: 'Lift', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'sh', x: 635, y: 55, w: 115, h: 85, label: 'Convenience Store', icon: '🏪', type: 'facility', color: '#fce7f3', border: '#f9a8d4' },
      { id: 'wc', x: 635, y: 158, w: 115, h: 72, label: 'Restroom', icon: '🚻', type: 'facility', color: '#e0e7ff', border: '#a5b4fc' },
      { id: 'su', x: 635, y: 248, w: 115, h: 72, label: 'Surau / Prayer Room', icon: '🕌', type: 'facility', color: '#ccfbf1', border: '#5eead4' },
      { id: 'se', x: 635, y: 338, w: 115, h: 72, label: 'Security Office', icon: '👮', type: 'facility', color: '#ffedd5', border: '#fdba74' },
      { id: 'ed', x: 135, y: 395, w: 65, h: 45, label: 'Escalator ↓', sublabel: 'To Ground', icon: '⬇️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'ld', x: 60, y: 400, w: 48, h: 38, label: 'Lift ↓', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
    ],
  },
  {
    id: 'ground', tag: 'G', label: 'Ground Level', subtitle: 'Entrances & Connections',
    elements2D: [
      { id: 'ga', x: 40, y: 40, w: 720, h: 380, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      { id: 'ea2', x: 40, y: 165, w: 105, h: 85, label: 'Entrance A', sublabel: 'Main Entrance', icon: '🚪', type: 'entrance', color: '#dbeafe', border: '#60a5fa' },
      { id: 'eb2', x: 655, y: 165, w: 105, h: 85, label: 'Entrance B', sublabel: 'Side Entrance', icon: '🚪', type: 'entrance', color: '#dbeafe', border: '#60a5fa' },
      { id: 'rd', x: 40, y: 425, w: 720, h: 45, label: 'Jalan Reko — Public Road', type: 'road', color: '#f1f5f9', border: '#94a3b8', textColor: '#64748b' },
      { id: 'eu', x: 195, y: 90, w: 75, h: 55, label: 'Escalator ↑', sublabel: 'To Concourse', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lu', x: 288, y: 100, w: 48, h: 40, label: 'Lift ↑', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'bs', x: 425, y: 340, w: 135, h: 65, label: 'Bus Terminal', sublabel: 'Feeder Bus', icon: '🚌', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      { id: 'tx', x: 578, y: 340, w: 105, h: 65, label: 'Taxi / e-Hailing', icon: '🚕', type: 'facility', color: '#fef3c7', border: '#fcd34d' },
      { id: 'pk', x: 575, y: 55, w: 125, h: 85, label: 'Park & Ride', sublabel: 'Parking', icon: '🅿️', type: 'facility', color: '#f1f5f9', border: '#94a3b8' },
      { id: 'inf', x: 195, y: 195, w: 85, h: 65, label: 'Info Counter', icon: 'ℹ️', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 'atm', x: 335, y: 195, w: 75, h: 65, label: 'ATM', icon: '🏧', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'vm', x: 425, y: 195, w: 75, h: 65, label: 'Vending', icon: '🥤', type: 'facility', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'ktm', x: 40, y: 55, w: 135, h: 85, label: 'KTM Kajang Station', sublabel: 'Interchange Walk', icon: '🚂', type: 'interchange', color: '#fee2e2', border: '#fca5a5' },
      { id: 'cw', x: 195, y: 295, w: 310, h: 35, label: '── Covered Walkway to Town ──', type: 'walkway', color: '#f8fafc', border: '#cbd5e1', textColor: '#94a3b8' },
    ],
  },
];

const PATHS = [
  {
    id: 'platform1', name: 'To Platform 1', subtitle: 'Kwasa Damansara Direction',
    color: '#F59E0B', light: '#fef3c7', glow: 'rgba(245,158,11,0.35)', emoji: '🟠',
    routes: {
      ground: [{ points: [[90,210],[200,210],[220,118]] }],
      concourse: [{ points: [[140,418],[225,155],[250,155],[376,202]] }],
      platform: [{ points: [[310,250],[310,165],[200,118]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A (Ground)', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Concourse', floor: 'ground' },
      { icon: '🎫', text: 'Tap card at Entry Gates', floor: 'concourse' },
      { icon: '⬆️', text: 'Follow ORANGE → Escalator A', floor: 'concourse' },
      { icon: '🚇', text: 'Platform 1 — Kwasa Damansara', floor: 'platform' },
    ],
  },
  {
    id: 'platform2', name: 'To Platform 2', subtitle: 'Kajang Terminal',
    color: '#10B981', light: '#d1fae5', glow: 'rgba(16,185,129,0.35)', emoji: '🟢',
    routes: {
      ground: [{ points: [[90,210],[200,210],[220,118]] }],
      concourse: [{ points: [[140,418],[225,155],[250,155],[516,202]] }],
      platform: [{ points: [[490,250],[490,345],[400,350]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A (Ground)', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Concourse', floor: 'ground' },
      { icon: '🎫', text: 'Tap card at Entry Gates', floor: 'concourse' },
      { icon: '⬆️', text: 'Follow GREEN → Escalator B', floor: 'concourse' },
      { icon: '🚇', text: 'Platform 2 — Kajang Terminal', floor: 'platform' },
    ],
  },
  {
    id: 'ticketing', name: 'Ticketing & Top-Up', subtitle: 'Buy Token / Reload Card',
    color: '#3B82F6', light: '#dbeafe', glow: 'rgba(59,130,246,0.35)', emoji: '🔵',
    routes: {
      ground: [{ points: [[90,210],[200,210],[220,118]] }],
      concourse: [{ points: [[140,418],[140,250],[102,250],[102,88]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A (Ground)', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Concourse', floor: 'ground' },
      { icon: '🎫', text: 'Follow BLUE → Ticket Machines', floor: 'concourse' },
      { icon: '💳', text: 'Buy token or top-up Touch \'n Go', floor: 'concourse' },
    ],
  },
  {
    id: 'exit', name: 'Exit to Bus / Taxi', subtitle: 'Ground Level Connections',
    color: '#A855F7', light: '#ede9fe', glow: 'rgba(168,85,247,0.35)', emoji: '🟣',
    routes: {
      platform: [{ points: [[400,350],[490,345],[490,250]] }],
      concourse: [{ points: [[376,202],[250,348],[225,348],[168,418]] }],
      ground: [{ points: [[220,118],[200,210],[430,375]] }],
    },
    steps: [
      { icon: '🚇', text: 'From Platform → head to escalator', floor: 'platform' },
      { icon: '⬇️', text: 'Escalator down to Concourse', floor: 'platform' },
      { icon: '🎫', text: 'Tap out at Exit Gates', floor: 'concourse' },
      { icon: '⬇️', text: 'Follow PURPLE → down to Ground', floor: 'concourse' },
      { icon: '🚌', text: 'Bus Terminal / Taxi Stand', floor: 'ground' },
    ],
  },
];

// ============================================
// 2D FLOOR PLAN
// ============================================
const FloorPlan2D = ({ floor, selectedPath, onBack }) => {
  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  const routes = pathData?.routes[floor.id] || [];

  return (
    <div style={{ animation: 'viewFade 0.4s ease' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRadius: '14px 14px 0 0',
      }}>
        <button onClick={onBack} style={{
          background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '10px',
          padding: '9px 18px', color: '#1e293b', fontSize: '13px', fontWeight: '700',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          ← Back to 3D
        </button>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em' }}>2D FLOOR PLAN</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
            <span style={{ color: pathData?.color || '#64748b', marginRight: '8px' }}>{floor.tag}</span>
            {floor.label} — <span style={{ color: '#64748b', fontWeight: '500' }}>{floor.subtitle}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px', background: 'white', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
        <svg viewBox="0 0 800 500" width="100%" style={{ minHeight: '380px' }}>
          <defs>
            <pattern id="g2d" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#g2d)" />
          {floor.elements2D.map(el => (
            <g key={el.id}>
              <rect x={el.x} y={el.y} width={el.w} height={el.h}
                rx={el.type === 'escalator' ? 8 : el.type === 'road' || el.type === 'walkway' ? 3 : 6}
                fill={el.color} stroke={el.border} strokeWidth={el.type === 'gate' ? 2.5 : 1.5}
                strokeDasharray={el.type === 'gate' ? '8 4' : el.type === 'paid-zone' ? '5 5' : 'none'}
              />
              {el.icon && (
                <text x={el.x + el.w/2} y={el.y + (el.sublabel ? el.h/2-8 : el.h/2-3)} textAnchor="middle" fontSize="22" dominantBaseline="central">{el.icon}</text>
              )}
              {el.label && el.type !== 'text-only' && (
                <text x={el.x + el.w/2} y={el.y + (el.icon ? el.h/2+13 : el.h/2 - (el.sublabel ? 5 : 0))}
                  textAnchor="middle" fontSize={el.type === 'label-zone' ? 15 : el.type === 'track' || el.type === 'road' || el.type === 'walkway' ? 12 : 11}
                  fontWeight={el.type === 'label-zone' ? '800' : '700'}
                  fill={el.textColor || '#475569'} dominantBaseline="central"
                >{el.label}</text>
              )}
              {el.sublabel && (
                <text x={el.x + el.w/2} y={el.y + (el.icon ? el.h/2+26 : el.h/2+10)} textAnchor="middle" fontSize="10"
                  fill={el.textColor ? `${el.textColor}` : '#94a3b8'} dominantBaseline="central">{el.sublabel}</text>
              )}
              {el.type === 'text-only' && (
                <text x={el.x+5} y={el.y+el.h/2} fontSize="10" fontWeight="800" fill={el.textColor} dominantBaseline="central" letterSpacing="0.05em">{el.label}</text>
              )}
            </g>
          ))}
          {routes.map((route, ri) => {
            const d = route.points.map((p, i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
            return (
              <g key={ri}>
                <path d={d} fill="none" stroke={pathData.color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
                <path d={d} fill="none" stroke={pathData.color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                <path d={d} fill="none" stroke={pathData.color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 7">
                  <animate attributeName="stroke-dashoffset" from="0" to="-34" dur="2s" repeatCount="indefinite" />
                </path>
                {route.points.map((p, pi) => (
                  <g key={pi}>
                    <circle cx={p[0]} cy={p[1]} r="9" fill={pathData.color} opacity="0.15" />
                    <circle cx={p[0]} cy={p[1]} r="5.5" fill={pathData.color} />
                    <circle cx={p[0]} cy={p[1]} r="2.5" fill="white" />
                  </g>
                ))}
                <circle cx={route.points[route.points.length-1][0]} cy={route.points[route.points.length-1][1]} r="16" fill={pathData.color} opacity="0.15">
                  <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
          {!pathData && PATHS.map(p => (p.routes[floor.id]||[]).map((r, ri) => (
            <path key={`${p.id}-${ri}`} d={r.points.map((pt,i)=>`${i===0?'M':'L'}${pt[0]},${pt[1]}`).join(' ')}
              fill="none" stroke={p.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" strokeDasharray="6 6" />
          )))}
        </svg>
      </div>
    </div>
  );
};

// ============================================
// 3D ISOMETRIC FLOOR SLAB
// ============================================
const IsoSlab = ({ floor, yOff, isActive, pathColor, onClick, allPaths, selectedPath }) => {
  const W = 110, H = 80;
  const pts = [[isoX(0,0),isoY(0,0)],[isoX(W,0),isoY(W,0)],[isoX(W,H),isoY(W,H)],[isoX(0,H),isoY(0,H)]];
  const d = 16;
  const [hovered, setHovered] = useState(false);

  return (
    <g transform={`translate(0,${yOff})`} style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {/* Shadow */}
      <polygon points={pts.map(([x,y])=>`${x+4},${y+d+6}`).join(' ')} fill="rgba(0,0,0,0.04)" />

      {/* Depth left */}
      <polygon points={`${pts[2].join(',')},${pts[3].join(',')},${pts[3][0]},${pts[3][1]+d},${pts[2][0]},${pts[2][1]+d}`}
        fill={isActive ? `${pathColor}30` : '#e2e8f0'} stroke={isActive ? `${pathColor}60` : '#cbd5e1'} strokeWidth="0.6" />
      {/* Depth right */}
      <polygon points={`${pts[1].join(',')},${pts[2].join(',')},${pts[2][0]},${pts[2][1]+d},${pts[1][0]},${pts[1][1]+d}`}
        fill={isActive ? `${pathColor}20` : '#e8ecf0'} stroke={isActive ? `${pathColor}40` : '#cbd5e1'} strokeWidth="0.6" />

      {/* Surface */}
      <polygon points={pts.map(p=>p.join(',')).join(' ')}
        fill={isActive ? `${pathColor}12` : hovered ? '#f8fafc' : '#ffffff'}
        stroke={isActive ? pathColor : hovered ? '#94a3b8' : '#cbd5e1'}
        strokeWidth={isActive ? 1.8 : hovered ? 1.2 : 0.8}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Grid */}
      {[0.25,0.5,0.75].map(t => (
        <g key={t}>
          <line x1={isoX(W*t,0)} y1={isoY(W*t,0)} x2={isoX(W*t,H)} y2={isoY(W*t,H)} stroke={isActive ? `${pathColor}15` : '#e2e8f0'} strokeWidth="0.4" />
          <line x1={isoX(0,H*t)} y1={isoY(0,H*t)} x2={isoX(W,H*t)} y2={isoY(W,H*t)} stroke={isActive ? `${pathColor}15` : '#e2e8f0'} strokeWidth="0.4" />
        </g>
      ))}

      {/* All path hints */}
      {allPaths.map(p => {
        const rts = p.routes[floor.id] || [];
        const isSel = p.id === selectedPath;
        return rts.map((route, ri) => {
          const ipp = route.points.map(([x,y])=>[isoX(x/8,y/6.2),isoY(x/8,y/6.2)]);
          return ipp.length > 1 ? (
            <g key={`${p.id}-${ri}`}>
              {isSel && <polyline points={ipp.map(pt=>pt.join(',')).join(' ')} fill="none" stroke={p.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />}
              <polyline points={ipp.map(pt=>pt.join(',')).join(' ')} fill="none" stroke={p.color}
                strokeWidth={isSel ? 3.5 : 1.5} strokeLinecap="round" strokeLinejoin="round"
                opacity={isSel ? 0.85 : 0.18} strokeDasharray={isSel ? '5 4' : 'none'}
              >
                {isSel && <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />}
              </polyline>
            </g>
          ) : null;
        });
      })}

      {/* Floor icon + label */}
      <text x={isoX(W/2,H/2)} y={isoY(W/2,H/2)-5} textAnchor="middle" fontSize="18" dominantBaseline="central">
        {floor.id==='platform'?'🚇':floor.id==='concourse'?'🎫':'🚪'}
      </text>
      <text x={isoX(W/2,H/2)} y={isoY(W/2,H/2)+12} textAnchor="middle" fontSize="5.5" fontWeight="800"
        fill={isActive ? pathColor : '#64748b'} dominantBaseline="central" letterSpacing="0.06em"
      >{floor.label}</text>
      <text x={isoX(W/2,H/2)} y={isoY(W/2,H/2)+20} textAnchor="middle" fontSize="4" fontWeight="600"
        fill={hovered ? '#3b82f6' : '#94a3b8'} dominantBaseline="central" letterSpacing="0.08em"
        style={{ transition: 'fill 0.2s' }}
      >TAP TO VIEW 2D PLAN</text>

      {/* Tag */}
      <g>
        <rect x={isoX(-14,H/2)-14} y={isoY(-14,H/2)-10} width="28" height="20" rx="5"
          fill={isActive ? pathColor : '#f1f5f9'} stroke={isActive ? pathColor : '#cbd5e1'} strokeWidth="0.8" />
        <text x={isoX(-14,H/2)} y={isoY(-14,H/2)+1} textAnchor="middle" fontSize="9" fontWeight="900"
          fill={isActive ? 'white' : '#475569'} dominantBaseline="central">{floor.tag}</text>
      </g>

      {/* Right label */}
      <text x={isoX(W+12,H/2)} y={isoY(W+12,H/2)} fontSize="6" fontWeight="700"
        fill={isActive ? pathColor : '#94a3b8'} dominantBaseline="central">{floor.subtitle}</text>
    </g>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [view, setView] = useState('3d');
  const [animStep, setAnimStep] = useState(-1);
  const timerRef = useRef(null);

  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;

  const selectPath = (id) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (selectedPath === id) { setSelectedPath(null); setAnimStep(-1); return; }
    setSelectedPath(id);
    setAnimStep(0);
    const path = PATHS.find(p => p.id === id);
    let s = 0;
    timerRef.current = setInterval(() => {
      s++;
      if (s >= path.steps.length) { clearInterval(timerRef.current); return; }
      setAnimStep(s);
    }, 800);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const gap = 190;

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      color: '#0f172a',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes viewFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>

      {/* HEADER */}
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'white', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.2em' }}>
            MRT KAJANG LINE • PROTOTYPE
          </div>
          <h1 style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a' }}>
            🚇 Stesen MRT Kajang — Colored Floor Signage
          </h1>
        </div>
        <div style={{
          display: 'flex', gap: '4px', background: '#f1f5f9',
          borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0',
        }}>
          {[{ id: '3d', label: '🧊 3D View' }, ...FLOORS.map(f => ({ id: f.id, label: f.tag }))].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              background: view === tab.id ? 'white' : 'transparent',
              color: view === tab.id ? '#0f172a' : '#94a3b8',
              boxShadow: view === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 58px)' }}>

        {/* LEFT PANEL */}
        <div style={{
          borderRight: '1px solid #e2e8f0', padding: '20px 16px',
          overflowY: 'auto', maxHeight: 'calc(100vh - 58px)',
          background: 'white', display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '4px' }}>
            NAK PERGI MANA?
          </div>

          {PATHS.map((p, i) => {
            const isSel = selectedPath === p.id;
            return (
              <button key={p.id} onClick={() => selectPath(p.id)} style={{
                background: isSel ? p.light : 'white',
                border: isSel ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                color: '#0f172a', transition: 'all 0.3s ease',
                animation: `slideIn 0.3s ease ${i*0.05}s both`,
                boxShadow: isSel ? `0 4px 14px ${p.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { if(!isSel) { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}}
                onMouseLeave={e => { if(!isSel) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{
                    width:'38px', height:'38px', borderRadius:'10px',
                    background: isSel ? p.color : p.light,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'17px', flexShrink:0, transition:'all 0.3s',
                  }}>{p.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:'700', color: isSel ? p.color : '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'1px' }}>{p.subtitle}</div>
                  </div>
                  {isSel && <div style={{
                    width:'24px', height:'24px', borderRadius:'50%', background:p.color,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'white', fontWeight:'800',
                  }}>✓</div>}
                </div>
              </button>
            );
          })}

          {/* Steps */}
          {pathData && (
            <div style={{
              marginTop:'10px', background:'#fafafa', border:'1px solid #e2e8f0',
              borderRadius:'14px', padding:'16px', animation:'viewFade 0.3s ease',
            }}>
              <div style={{ fontSize:'10px', fontWeight:'700', color: pathData.color, letterSpacing:'0.12em', marginBottom:'12px' }}>
                PANDUAN LANGKAH DEMI LANGKAH
              </div>
              <div style={{ height:'3px', borderRadius:'2px', background:'#e2e8f0', marginBottom:'16px', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'2px', background:pathData.color,
                  width:`${((animStep+1)/pathData.steps.length)*100}%`, transition:'width 0.5s ease' }} />
              </div>
              {pathData.steps.map((step, i) => {
                const reached = i <= animStep;
                const current = i === animStep;
                const fl = FLOORS.find(f => f.id === step.floor);
                return (
                  <div key={i} style={{
                    display:'flex', gap:'10px', marginBottom:'12px',
                    opacity: reached ? 1 : 0.25, transition:'opacity 0.4s',
                  }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'26px' }}>
                      <div style={{
                        width:'26px', height:'26px', borderRadius:'50%',
                        background: current ? pathData.color : reached ? pathData.light : '#f1f5f9',
                        border: current ? 'none' : `1.5px solid ${reached ? pathData.color : '#e2e8f0'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px',
                        boxShadow: current ? `0 0 12px ${pathData.glow}` : 'none',
                        transition:'all 0.3s',
                      }}>{step.icon}</div>
                      {i < pathData.steps.length-1 && (
                        <div style={{ width:'1.5px', height:'14px', background:'#e2e8f0', marginTop:'3px' }} />
                      )}
                    </div>
                    <div style={{ paddingTop:'4px' }}>
                      <div style={{ fontSize:'12px', fontWeight: current ? '700' : '500',
                        color: current ? pathData.color : reached ? '#1e293b' : '#94a3b8' }}>{step.text}</div>
                      <button onClick={(e)=>{e.stopPropagation();setView(step.floor);}} style={{
                        marginTop:'3px', fontSize:'9px', fontWeight:'700', color:'#64748b',
                        background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px',
                        border:'1px solid #e2e8f0', cursor:'pointer', transition:'all 0.2s',
                      }}
                        onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                        onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}
                      >{fl?.tag} — {fl?.label} ↗</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div style={{
            background:'#fafafa', border:'1px solid #e2e8f0', borderRadius:'14px', padding:'14px', marginTop:'6px',
          }}>
            <div style={{ fontSize:'10px', fontWeight:'700', color:'#94a3b8', letterSpacing:'0.12em', marginBottom:'8px' }}>KEMUDAHAN STESEN</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px' }}>
              {[['🚪','Pintu Masuk'],['⬆️','Eskalator'],['🛗','Lif'],['🎫','Mesin Tiket'],
                ['💳','Top-Up TnG'],['🚻','Tandas'],['🕌','Surau'],['🏪','Kedai'],
                ['👮','Keselamatan'],['🚌','Terminal Bas'],['🚕','Teksi'],['🚂','KTM Link'],
              ].map(([ic,lb],i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'12px' }}>{ic}</span>
                  <span style={{ fontSize:'10px', color:'#64748b' }}>{lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ padding:'20px', overflowY:'auto', maxHeight:'calc(100vh - 58px)', background:'#f1f5f9' }}>
          {view === '3d' ? (
            <div style={{ animation:'viewFade 0.4s ease' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', letterSpacing:'0.15em', marginBottom:'12px' }}>
                ISOMETRIC 3D VIEW — TAP FLOOR UNTUK LIHAT 2D PLAN
              </div>
              <div style={{
                background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0',
                padding: '20px 10px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}>
                <svg viewBox="-50 -30 780 680" width="100%" style={{ display:'block' }}>
                  {/* Subtle background */}
                  <defs>
                    <radialGradient id="bgGrad" cx="50%" cy="50%">
                      <stop offset="0%" stopColor={pathData ? pathData.color : '#e2e8f0'} stopOpacity="0.04" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect x="-50" y="-30" width="780" height="680" fill="url(#bgGrad)" />

                  {/* Floors bottom to top */}
                  {[...FLOORS].reverse().map((floor, ri) => {
                    const fi = FLOORS.length-1-ri;
                    const yOff = (FLOORS.length-1-fi) * gap;
                    const isActive = pathData && pathData.routes[floor.id];
                    const hasConn = pathData && isActive && fi < FLOORS.length-1 && pathData.routes[FLOORS[fi+1]?.id];

                    return (
                      <g key={floor.id}>
                        <IsoSlab floor={floor} yOff={yOff} isActive={!!isActive}
                          pathColor={pathData?.color||'#64748b'} onClick={()=>setView(floor.id)}
                          allPaths={PATHS} selectedPath={selectedPath} />
                        {hasConn && (
                          <g>
                            <line x1="340" y1={yOff+100} x2="340" y2={yOff+gap-8}
                              stroke={pathData.color} strokeWidth="2.5" strokeDasharray="6 5" opacity="0.35">
                              <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite" />
                            </line>
                            <rect x="310" y={yOff + gap/2 + 40} width="62" height="18" rx="5"
                              fill={pathData.light} stroke={pathData.color} strokeWidth="0.8" opacity="0.8" />
                            <text x="341" y={yOff + gap/2 + 50} textAnchor="middle" fontSize="5" fontWeight="700"
                              fill={pathData.color} dominantBaseline="central">↕ Eskalator</text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {!selectedPath && (
                <div style={{ textAlign:'center', marginTop:'24px', animation:'viewFade 0.5s ease 0.3s both' }}>
                  <div style={{ fontSize:'36px', marginBottom:'8px' }}>👈</div>
                  <div style={{ fontSize:'14px', fontWeight:'600', color:'#94a3b8' }}>Pilih destinasi untuk lihat laluan berwarna</div>
                </div>
              )}
            </div>
          ) : (
            <FloorPlan2D floor={FLOORS.find(f=>f.id===view)} selectedPath={selectedPath} onBack={()=>setView('3d')} />
          )}
        </div>
      </div>
    </div>
  );
}
