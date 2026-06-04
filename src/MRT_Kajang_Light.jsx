import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// RESPONSIVE HOOK
// ============================================
function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

// ============================================
// ISOMETRIC HELPERS — scale adapts to screen
// ============================================
const isoX = (x, y, cx, s) => cx + (x - y) * s;
const isoY = (x, y, cy, s) => cy + (x + y) * (s * 0.5);

// ============================================
// KL SENTRAL FLOOR DATA
// ============================================
const FLOORS = [
  {
    id: 'erl', tag: 'L3', label: 'ERL Level', subtitle: 'KLIA Ekspres & Transit',
    icon: '✈️',
    elements2D: [
      { id: 'ea', x: 40, y: 40, w: 720, h: 180, label: '', type: 'platform', color: '#dbeafe', border: '#60a5fa' },
      { id: 'el', x: 55, y: 50, w: 240, h: 40, label: 'KLIA EKSPRES', sublabel: 'Non-stop to KLIA', type: 'label-zone', color: '#2563eb18', border: '#2563eb', textColor: '#1e40af' },
      { id: 'et', x: 55, y: 110, w: 240, h: 40, label: 'KLIA TRANSIT', sublabel: 'Stops at Salak Tinggi, Putrajaya', type: 'label-zone', color: '#7c3aed18', border: '#7c3aed', textColor: '#5b21b6' },
      { id: 'tk1', x: 40, y: 12, w: 720, h: 24, label: '══ Track — KLIA Ekspres ══', type: 'track', color: '#bfdbfe', border: '#60a5fa', textColor: '#1d4ed8' },
      { id: 'tk2', x: 40, y: 225, w: 720, h: 24, label: '══ Track — KLIA Transit ══', type: 'track', color: '#ddd6fe', border: '#a78bfa', textColor: '#6d28d9' },
      { id: 'ci', x: 500, y: 55, w: 140, h: 80, label: 'Airline Check-In', sublabel: 'Counter', icon: '🧳', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      { id: 'w1', x: 350, y: 60, w: 100, h: 55, label: 'Waiting Lounge', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'w2', x: 350, y: 125, w: 100, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'sc1', x: 670, y: 60, w: 80, h: 55, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 'e1', x: 250, y: 270, w: 70, h: 45, label: 'Escalator ↓', icon: '⬇️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'l1', x: 360, y: 275, w: 50, h: 35, label: 'Lift', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'sos', x: 670, y: 130, w: 80, h: 50, label: 'Emergency', icon: '🆘', type: 'facility', color: '#fee2e2', border: '#fca5a5' },
      // Paid area
      { id: 'pz', x: 40, y: 260, w: 720, h: 220, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      { id: 'lounge', x: 500, y: 280, w: 140, h: 80, label: 'Premium Lounge', icon: '🛋️', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      { id: 'fm', x: 55, y: 320, w: 120, h: 80, label: 'Food & Beverage', icon: '🍔', type: 'facility', color: '#ffedd5', border: '#fdba74' },
      { id: 'sh2', x: 500, y: 380, w: 140, h: 80, label: 'Duty Free Shop', icon: '🛍️', type: 'facility', color: '#fce7f3', border: '#f9a8d4' },
    ],
  },
  {
    id: 'lrt', tag: 'L2', label: 'LRT & MRT Level', subtitle: 'Kelana Jaya Line & Kajang Line',
    icon: '🚈',
    elements2D: [
      { id: 'la', x: 40, y: 30, w: 340, h: 200, label: '', type: 'platform', color: '#fef3c7', border: '#f59e0b' },
      { id: 'll', x: 55, y: 40, w: 200, h: 36, label: 'LRT KELANA JAYA LINE', sublabel: 'Platform 1 & 2', type: 'label-zone', color: '#f59e0b18', border: '#f59e0b', textColor: '#92400e' },
      { id: 'lt1', x: 40, y: 5, w: 340, h: 22, label: '══ Track — LRT Kelana Jaya ══', type: 'track', color: '#fef3c7', border: '#fbbf24', textColor: '#92400e' },
      { id: 'ma', x: 420, y: 30, w: 340, h: 200, label: '', type: 'platform', color: '#d1fae5', border: '#10b981' },
      { id: 'ml', x: 435, y: 40, w: 200, h: 36, label: 'MRT KAJANG LINE', sublabel: 'Platform 1 & 2', type: 'label-zone', color: '#10b98118', border: '#10b981', textColor: '#065f46' },
      { id: 'mt1', x: 420, y: 5, w: 340, h: 22, label: '══ Track — MRT Kajang ══', type: 'track', color: '#d1fae5', border: '#10b981', textColor: '#065f46' },
      // LRT facilities
      { id: 'lw1', x: 70, y: 95, w: 95, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'lw2', x: 200, y: 95, w: 95, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'ls1', x: 70, y: 163, w: 95, h: 50, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      // MRT facilities
      { id: 'mw1', x: 445, y: 95, w: 95, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'mw2', x: 575, y: 95, w: 95, h: 55, label: 'Waiting Area', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'ms1', x: 445, y: 163, w: 95, h: 50, label: 'Info Display', icon: '📺', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      // Corridor
      { id: 'cor', x: 40, y: 250, w: 720, h: 230, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      { id: 'gi', x: 100, y: 270, w: 35, h: 100, label: 'Entry', type: 'gate', color: '#fef3c7', border: '#fbbf24', vertical: true },
      { id: 'go', x: 200, y: 270, w: 35, h: 100, label: 'Exit', type: 'gate', color: '#ede9fe', border: '#a78bfa', vertical: true },
      { id: 'tvm', x: 55, y: 395, w: 110, h: 65, label: 'TVM (LRT/MRT)', sublabel: 'Ticket Vending', icon: '🎫', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'cs', x: 190, y: 395, w: 100, h: 65, label: 'Customer Service', icon: '🧑‍💼', type: 'facility', color: '#dbeafe', border: '#93c5fd' },
      // Escalators
      { id: 'eu1', x: 360, y: 270, w: 70, h: 45, label: 'Escalator ↑↓', icon: '↕️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lf1', x: 460, y: 275, w: 50, h: 35, label: 'Lift', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'ed1', x: 360, y: 420, w: 70, h: 45, label: 'Escalator ↓', sublabel: 'To Concourse', icon: '⬇️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      // Shops
      { id: 'sh', x: 560, y: 270, w: 100, h: 65, label: 'Retail Shops', icon: '🏪', type: 'facility', color: '#fce7f3', border: '#f9a8d4' },
      { id: 'wc', x: 680, y: 270, w: 70, h: 65, label: 'Restroom', icon: '🚻', type: 'facility', color: '#e0e7ff', border: '#a5b4fc' },
      { id: 'fb', x: 560, y: 395, w: 100, h: 65, label: 'Food Court', icon: '🍜', type: 'facility', color: '#ffedd5', border: '#fdba74' },
      { id: 'su', x: 680, y: 395, w: 70, h: 65, label: 'Surau', icon: '🕌', type: 'facility', color: '#ccfbf1', border: '#5eead4' },
    ],
  },
  {
    id: 'concourse', tag: 'L1', label: 'Main Concourse', subtitle: 'KTM Komuter & Connections',
    icon: '🚂',
    elements2D: [
      { id: 'hall', x: 40, y: 40, w: 720, h: 440, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      // KTM area
      { id: 'ktm', x: 50, y: 50, w: 300, h: 160, label: '', type: 'platform', color: '#fee2e2', border: '#f87171' },
      { id: 'ktl', x: 60, y: 58, w: 220, h: 36, label: 'KTM KOMUTER', sublabel: 'Seremban & Tg. Malim Line', type: 'label-zone', color: '#ef444418', border: '#ef4444', textColor: '#991b1b' },
      { id: 'ktk', x: 50, y: 18, w: 300, h: 24, label: '══ Track — KTM Komuter ══', type: 'track', color: '#fee2e2', border: '#f87171', textColor: '#991b1b' },
      { id: 'kw1', x: 70, y: 110, w: 100, h: 60, label: 'Waiting', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      { id: 'kw2', x: 200, y: 110, w: 100, h: 60, label: 'Waiting', icon: '💺', type: 'facility', color: '#f1f5f9', border: '#cbd5e1' },
      // KTM gates & ticketing
      { id: 'kg', x: 60, y: 225, w: 30, h: 100, label: 'KTM Gates', type: 'gate', color: '#fee2e2', border: '#f87171', vertical: true },
      { id: 'ktvm', x: 50, y: 340, w: 110, h: 60, label: 'KTM Ticket', sublabel: 'Vending', icon: '🎫', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      // Central hall
      { id: 'hall2', x: 380, y: 50, w: 370, h: 160, label: '', type: 'main-area', color: '#fffbeb', border: '#fcd34d' },
      { id: 'hl', x: 390, y: 55, w: 120, h: 22, label: '● MAIN HALL', type: 'text-only', textColor: '#b45309' },
      { id: 'info', x: 400, y: 90, w: 100, h: 60, label: 'Info Counter', icon: 'ℹ️', type: 'facility', color: '#e0f2fe', border: '#7dd3fc' },
      { id: 'atm', x: 520, y: 90, w: 80, h: 60, label: 'ATM', icon: '🏧', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'ex1', x: 630, y: 90, w: 90, h: 60, label: 'Money Exchange', icon: '💱', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      // Connection walkway
      { id: 'mono', x: 400, y: 165, w: 200, h: 35, label: '── Walkway to KL Monorail ──', type: 'walkway', color: '#f8fafc', border: '#cbd5e1', textColor: '#94a3b8' },
      // Escalators
      { id: 'eu2', x: 250, y: 240, w: 70, h: 45, label: 'Escalator ↑', sublabel: 'To LRT/MRT', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'eu3', x: 370, y: 240, w: 70, h: 45, label: 'Escalator ↑', sublabel: 'To ERL', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lf2', x: 480, y: 245, w: 50, h: 35, label: 'Lift', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'ed2', x: 570, y: 240, w: 70, h: 45, label: 'Escalator ↓', sublabel: 'To Ground', icon: '⬇️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      // Shops & food
      { id: 'fc', x: 400, y: 310, w: 140, h: 70, label: 'Food Court', icon: '🍜', type: 'facility', color: '#ffedd5', border: '#fdba74' },
      { id: 'ph', x: 560, y: 310, w: 100, h: 70, label: 'Pharmacy', icon: '💊', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'sec', x: 680, y: 310, w: 70, h: 70, label: 'Security', icon: '👮', type: 'facility', color: '#ffedd5', border: '#fdba74' },
      { id: 'tng', x: 180, y: 340, w: 120, h: 60, label: 'Touch n Go Hub', icon: '💳', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'wc2', x: 400, y: 400, w: 80, h: 60, label: 'Restroom', icon: '🚻', type: 'facility', color: '#e0e7ff', border: '#a5b4fc' },
      { id: 'su2', x: 500, y: 400, w: 80, h: 60, label: 'Surau', icon: '🕌', type: 'facility', color: '#ccfbf1', border: '#5eead4' },
    ],
  },
  {
    id: 'ground', tag: 'G', label: 'Ground Level', subtitle: 'Entrances, Taxi & Bus',
    icon: '🚪',
    elements2D: [
      { id: 'ga', x: 40, y: 40, w: 720, h: 300, label: '', type: 'main-area', color: '#fafafa', border: '#e2e8f0' },
      { id: 'e1', x: 40, y: 130, w: 110, h: 90, label: 'Entrance A', sublabel: 'Jalan Stesen', icon: '🚪', type: 'entrance', color: '#dbeafe', border: '#60a5fa' },
      { id: 'e2', x: 650, y: 130, w: 110, h: 90, label: 'Entrance B', sublabel: 'Jalan Bangsar', icon: '🚪', type: 'entrance', color: '#dbeafe', border: '#60a5fa' },
      { id: 'e3', x: 340, y: 40, w: 120, h: 70, label: 'Entrance C', sublabel: 'NU Sentral Link', icon: '🚪', type: 'entrance', color: '#dbeafe', border: '#60a5fa' },
      { id: 'rd', x: 40, y: 355, w: 720, h: 45, label: 'Jalan Tun Sambanthan', type: 'road', color: '#f1f5f9', border: '#94a3b8', textColor: '#64748b' },
      // Escalators up
      { id: 'eu4', x: 220, y: 60, w: 75, h: 50, label: 'Escalator ↑', sublabel: 'To Concourse', icon: '⬆️', type: 'escalator', color: '#ede9fe', border: '#a78bfa' },
      { id: 'lf3', x: 310, y: 65, w: 50, h: 38, label: 'Lift ↑', icon: '🛗', type: 'escalator', color: '#f5f3ff', border: '#c4b5fd' },
      // Transport
      { id: 'taxi', x: 500, y: 250, w: 130, h: 70, label: 'Taxi / e-Hailing', sublabel: 'Grab / Taxi Stand', icon: '🚕', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      { id: 'bus', x: 200, y: 250, w: 150, h: 70, label: 'Bus Terminal', sublabel: 'GO KL / Rapid KL', icon: '🚌', type: 'facility', color: '#fef3c7', border: '#fbbf24' },
      { id: 'pk', x: 650, y: 45, w: 110, h: 70, label: 'Parking P1', icon: '🅿️', type: 'facility', color: '#f1f5f9', border: '#94a3b8' },
      // NU Sentral
      { id: 'nu', x: 370, y: 135, w: 170, h: 85, label: 'NU Sentral Mall', sublabel: 'Shopping & F&B', icon: '🛒', type: 'facility', color: '#fce7f3', border: '#f9a8d4' },
      // Others
      { id: 'atm2', x: 200, y: 155, w: 80, h: 55, label: 'ATM / Bank', icon: '🏧', type: 'facility', color: '#d1fae5', border: '#6ee7b7' },
      { id: 'vm', x: 555, y: 155, w: 80, h: 55, label: 'Vending', icon: '🥤', type: 'facility', color: '#f5f3ff', border: '#c4b5fd' },
      { id: 'cw', x: 40, y: 410, w: 330, h: 35, label: '── Brickfields / Little India ──', type: 'walkway', color: '#f8fafc', border: '#cbd5e1', textColor: '#94a3b8' },
      { id: 'cw2', x: 430, y: 410, w: 330, h: 35, label: '── Bangsar / Mid Valley Link ──', type: 'walkway', color: '#f8fafc', border: '#cbd5e1', textColor: '#94a3b8' },
    ],
  },
];

const PATHS = [
  {
    id: 'lrt', name: 'To LRT Kelana Jaya', subtitle: 'Ampang Park / Putra Heights',
    color: '#F59E0B', light: '#fef3c7', glow: 'rgba(245,158,11,0.3)', emoji: '🟠',
    routes: {
      ground: [{ points: [[95,175],[235,85]] }],
      concourse: [{ points: [[605,262],[285,262]] }],
      lrt: [{ points: [[395,442],[135,370],[135,150]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Main Concourse', floor: 'ground' },
      { icon: '➡️', text: 'Walk through Main Hall', floor: 'concourse' },
      { icon: '⬆️', text: 'Follow ORANGE → Escalator to L2', floor: 'concourse' },
      { icon: '🎫', text: 'Tap card at LRT Entry Gate', floor: 'lrt' },
      { icon: '🚈', text: 'LRT Kelana Jaya Platform', floor: 'lrt' },
    ],
  },
  {
    id: 'mrt', name: 'To MRT Kajang Line', subtitle: 'Muzium Negara / Kajang',
    color: '#10B981', light: '#d1fae5', glow: 'rgba(16,185,129,0.3)', emoji: '🟢',
    routes: {
      ground: [{ points: [[95,175],[235,85]] }],
      concourse: [{ points: [[605,262],[285,262]] }],
      lrt: [{ points: [[395,442],[530,370],[530,150]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Main Concourse', floor: 'ground' },
      { icon: '➡️', text: 'Walk through Main Hall', floor: 'concourse' },
      { icon: '⬆️', text: 'Follow GREEN → Escalator to L2', floor: 'concourse' },
      { icon: '🎫', text: 'Tap card at MRT Entry Gate', floor: 'lrt' },
      { icon: '🚇', text: 'MRT Kajang Line Platform', floor: 'lrt' },
    ],
  },
  {
    id: 'erl', name: 'To KLIA (Airport)', subtitle: 'KLIA Ekspres / Transit',
    color: '#3B82F6', light: '#dbeafe', glow: 'rgba(59,130,246,0.3)', emoji: '🔵',
    routes: {
      ground: [{ points: [[95,175],[235,85]] }],
      concourse: [{ points: [[605,262],[405,262]] }],
      erl: [{ points: [[285,292],[285,120]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Main Concourse', floor: 'ground' },
      { icon: '➡️', text: 'Follow BLUE → ERL Escalator', floor: 'concourse' },
      { icon: '⬆️', text: 'Up to ERL Level', floor: 'concourse' },
      { icon: '🧳', text: 'Check-in luggage (optional)', floor: 'erl' },
      { icon: '✈️', text: 'Board KLIA Ekspres / Transit', floor: 'erl' },
    ],
  },
  {
    id: 'ktm', name: 'To KTM Komuter', subtitle: 'Seremban / Tanjung Malim',
    color: '#EF4444', light: '#fee2e2', glow: 'rgba(239,68,68,0.3)', emoji: '🔴',
    routes: {
      ground: [{ points: [[95,175],[235,85]] }],
      concourse: [{ points: [[605,262],[605,210],[200,130],[150,130]] }],
    },
    steps: [
      { icon: '🚪', text: 'Enter from Entrance A', floor: 'ground' },
      { icon: '⬆️', text: 'Escalator up to Main Concourse', floor: 'ground' },
      { icon: '➡️', text: 'Follow RED → KTM area', floor: 'concourse' },
      { icon: '🎫', text: 'Tap card at KTM Gate', floor: 'concourse' },
      { icon: '🚂', text: 'KTM Komuter Platform', floor: 'concourse' },
    ],
  },
  {
    id: 'exit', name: 'Exit / Taxi / Bus', subtitle: 'NU Sentral, Grab, GO KL',
    color: '#A855F7', light: '#ede9fe', glow: 'rgba(168,85,247,0.3)', emoji: '🟣',
    routes: {
      concourse: [{ points: [[285,262],[605,262]] }],
      ground: [{ points: [[235,85],[250,175],[455,178]] }],
    },
    steps: [
      { icon: '⬇️', text: 'Follow PURPLE → Escalator down', floor: 'concourse' },
      { icon: '⬇️', text: 'Down to Ground Level', floor: 'concourse' },
      { icon: '🛒', text: 'NU Sentral Mall (right)', floor: 'ground' },
      { icon: '🚕', text: 'Taxi / Grab (keep walking)', floor: 'ground' },
      { icon: '🚌', text: 'Bus terminal (left side)', floor: 'ground' },
    ],
  },
];

// ============================================
// 2D FLOOR PLAN VIEW
// ============================================
const FloorPlan2D = ({ floor, selectedPath, onBack }) => {
  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  const routes = pathData?.routes[floor.id] || [];
  return (
    <div style={{ animation: 'viewFade 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '8px 14px', color: '#1e293b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          ← 3D View
        </button>
        <div>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em' }}>2D FLOOR PLAN</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            <span style={{ color: pathData?.color || '#64748b', marginRight: '6px' }}>{floor.tag}</span>
            {floor.label}
          </div>
        </div>
      </div>
      <div style={{ padding: '12px', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', overflowX: 'auto' }}>
        <svg viewBox="0 0 800 480" width="100%" style={{ minWidth: '500px', minHeight: '300px' }}>
          <defs><pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/></pattern></defs>
          <rect width="800" height="480" fill="url(#g2)" />
          {floor.elements2D.map(el => (
            <g key={el.id}>
              <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={el.type==='escalator'?8:el.type==='road'||el.type==='walkway'?3:6} fill={el.color} stroke={el.border} strokeWidth={el.type==='gate'?2.5:1.5} strokeDasharray={el.type==='gate'?'8 4':el.type==='paid-zone'?'5 5':'none'} />
              {el.icon && <text x={el.x+el.w/2} y={el.y+(el.sublabel?el.h/2-8:el.h/2-3)} textAnchor="middle" fontSize="20" dominantBaseline="central">{el.icon}</text>}
              {el.label && el.type!=='text-only' && <text x={el.x+el.w/2} y={el.y+(el.icon?el.h/2+12:el.h/2-(el.sublabel?5:0))} textAnchor="middle" fontSize={el.type==='label-zone'?14:el.type==='track'||el.type==='road'||el.type==='walkway'?11:10} fontWeight={el.type==='label-zone'?'800':'700'} fill={el.textColor||'#475569'} dominantBaseline="central">{el.label}</text>}
              {el.sublabel && <text x={el.x+el.w/2} y={el.y+(el.icon?el.h/2+24:el.h/2+10)} textAnchor="middle" fontSize="9" fill={el.textColor||'#94a3b8'} dominantBaseline="central">{el.sublabel}</text>}
              {el.type==='text-only' && <text x={el.x+5} y={el.y+el.h/2} fontSize="10" fontWeight="800" fill={el.textColor} dominantBaseline="central">{el.label}</text>}
            </g>
          ))}
          {routes.map((r,ri) => { const d=r.points.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' '); return (
            <g key={ri}>
              <path d={d} fill="none" stroke={pathData.color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity="0.1"/>
              <path d={d} fill="none" stroke={pathData.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.28"/>
              <path d={d} fill="none" stroke={pathData.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 7"><animate attributeName="stroke-dashoffset" from="0" to="-34" dur="2s" repeatCount="indefinite"/></path>
              {r.points.map((p,pi)=>(<g key={pi}><circle cx={p[0]} cy={p[1]} r="8" fill={pathData.color} opacity="0.14"/><circle cx={p[0]} cy={p[1]} r="5" fill={pathData.color}/><circle cx={p[0]} cy={p[1]} r="2.2" fill="white"/></g>))}
              <circle cx={r.points[r.points.length-1][0]} cy={r.points[r.points.length-1][1]} r="14" fill={pathData.color} opacity="0.12"><animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.12;0.02;0.12" dur="2s" repeatCount="indefinite"/></circle>
            </g>
          );})}
          {!pathData && PATHS.map(p=>(p.routes[floor.id]||[]).map((r,ri)=><path key={`${p.id}-${ri}`} d={r.points.map((pt,i)=>`${i===0?'M':'L'}${pt[0]},${pt[1]}`).join(' ')} fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" strokeDasharray="6 6"/>))}
        </svg>
      </div>
    </div>
  );
};

// ============================================
// ISOMETRIC SLAB
// ============================================
const IsoSlab = ({ floor, yOff, isActive, pathColor, pathLight, onClick, allPaths, selectedPath, cx, sc }) => {
  const W=110, H=80;
  const pts=[[isoX(0,0,cx,sc),isoY(0,0,80,sc)],[isoX(W,0,cx,sc),isoY(W,0,80,sc)],[isoX(W,H,cx,sc),isoY(W,H,80,sc)],[isoX(0,H,cx,sc),isoY(0,H,80,sc)]];
  const d=18;
  const [hv, setHv]=useState(false);
  return (
    <g transform={`translate(0,${yOff})`} style={{cursor:'pointer'}} onClick={onClick} onMouseEnter={()=>setHv(true)} onMouseLeave={()=>setHv(false)}>
      <polygon points={pts.map(([x,y])=>`${x+5},${y+d+8}`).join(' ')} fill="rgba(0,0,0,0.035)"/>
      <polygon points={`${pts[2].join(',')},${pts[3].join(',')},${pts[3][0]},${pts[3][1]+d},${pts[2][0]},${pts[2][1]+d}`} fill={isActive?`${pathColor}28`:'#e2e8f0'} stroke={isActive?`${pathColor}55`:'#cbd5e1'} strokeWidth="0.5"/>
      <polygon points={`${pts[1].join(',')},${pts[2].join(',')},${pts[2][0]},${pts[2][1]+d},${pts[1][0]},${pts[1][1]+d}`} fill={isActive?`${pathColor}18`:'#e8ecf0'} stroke={isActive?`${pathColor}40`:'#cbd5e1'} strokeWidth="0.5"/>
      <polygon points={pts.map(p=>p.join(',')).join(' ')} fill={isActive?`${pathColor}10`:hv?'#f8fafc':'#fff'} stroke={isActive?pathColor:hv?'#94a3b8':'#cbd5e1'} strokeWidth={isActive?2:hv?1.2:0.7}/>
      {[0.25,0.5,0.75].map(t=><g key={t}><line x1={isoX(W*t,0,cx,sc)} y1={isoY(W*t,0,80,sc)} x2={isoX(W*t,H,cx,sc)} y2={isoY(W*t,H,80,sc)} stroke={isActive?`${pathColor}12`:'#e2e8f0'} strokeWidth="0.4"/><line x1={isoX(0,H*t,cx,sc)} y1={isoY(0,H*t,80,sc)} x2={isoX(W,H*t,cx,sc)} y2={isoY(W,H*t,80,sc)} stroke={isActive?`${pathColor}12`:'#e2e8f0'} strokeWidth="0.4"/></g>)}
      {allPaths.map(p=>{const rts=p.routes[floor.id]||[];const isSel=p.id===selectedPath;return rts.map((route,ri)=>{const ipp=route.points.map(([x,y])=>[isoX(x/8,y/6,cx,sc),isoY(x/8,y/6,80,sc)]);return ipp.length>1?(<g key={`${p.id}-${ri}`}>{isSel&&<polyline points={ipp.map(pt=>pt.join(',')).join(' ')} fill="none" stroke={p.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.1"/>}<polyline points={ipp.map(pt=>pt.join(',')).join(' ')} fill="none" stroke={p.color} strokeWidth={isSel?3.5:1.5} strokeLinecap="round" strokeLinejoin="round" opacity={isSel?0.8:0.15} strokeDasharray={isSel?'5 4':'none'}>{isSel&&<animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite"/>}</polyline></g>):null;});})}
      <text x={isoX(W/2,H/2,cx,sc)} y={isoY(W/2,H/2,80,sc)-8} textAnchor="middle" fontSize="22" dominantBaseline="central">{floor.icon}</text>
      <text x={isoX(W/2,H/2,cx,sc)} y={isoY(W/2,H/2,80,sc)+12} textAnchor="middle" fontSize="6" fontWeight="800" fill={isActive?pathColor:'#475569'} dominantBaseline="central">{floor.label}</text>
      <text x={isoX(W/2,H/2,cx,sc)} y={isoY(W/2,H/2,80,sc)+22} textAnchor="middle" fontSize="4.5" fontWeight="600" fill={hv?'#3b82f6':'#94a3b8'} dominantBaseline="central">TAP TO VIEW 2D PLAN</text>
      <g><rect x={isoX(-16,H/2,cx,sc)-16} y={isoY(-16,H/2,80,sc)-12} width="32" height="24" rx="6" fill={isActive?pathColor:'#f1f5f9'} stroke={isActive?pathColor:'#cbd5e1'} strokeWidth="0.8"/><text x={isoX(-16,H/2,cx,sc)} y={isoY(-16,H/2,80,sc)+1} textAnchor="middle" fontSize="10" fontWeight="900" fill={isActive?'white':'#475569'} dominantBaseline="central">{floor.tag}</text></g>
      <text x={isoX(W+14,H/2,cx,sc)} y={isoY(W+14,H/2,80,sc)} fontSize="5.5" fontWeight="700" fill={isActive?pathColor:'#94a3b8'} dominantBaseline="central">{floor.subtitle}</text>
    </g>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const { w } = useWindowSize();
  const mobile = w < 768;
  const [selectedPath, setSelectedPath] = useState(null);
  const [view, setView] = useState('3d');
  const [animStep, setAnimStep] = useState(-1);
  const [panelOpen, setPanelOpen] = useState(!mobile);
  const timerRef = useRef(null);

  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;

  const selectPath = (id) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (selectedPath === id) { setSelectedPath(null); setAnimStep(-1); return; }
    setSelectedPath(id); setAnimStep(0);
    if (mobile) setPanelOpen(false);
    const path = PATHS.find(p => p.id === id);
    let s = 0;
    timerRef.current = setInterval(() => { s++; if (s >= path.steps.length) { clearInterval(timerRef.current); return; } setAnimStep(s); }, 800);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const gap = mobile ? 160 : 200;
  const cx = mobile ? 180 : 340;
  const sc = mobile ? 1.6 : 3.0;
  const svgW = mobile ? 420 : 780;
  const svgH = FLOORS.length * gap + (mobile ? 180 : 240);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans',-apple-system,sans-serif", color: '#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes viewFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: mobile ? '12px 14px' : '14px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.2em' }}>KL SENTRAL • PROTOTYPE</div>
          <h1 style={{ fontSize: mobile ? '15px' : '18px', fontWeight: '900', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🚉 KL Sentral — Colored Floor Signage</h1>
        </div>
        <div style={{ display: 'flex', gap: '3px', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0', flexShrink: 0, overflowX: 'auto' }}>
          {[{ id: '3d', label: '🧊 3D' }, ...FLOORS.map(f => ({ id: f.id, label: f.tag }))].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{ padding: mobile ? '6px 10px' : '7px 13px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: view === tab.id ? 'white' : 'transparent', color: view === tab.id ? '#0f172a' : '#94a3b8', boxShadow: view === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: mobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 60px)' }}>

        {/* SIDE PANEL — collapsible on mobile */}
        {mobile && (
          <button onClick={() => setPanelOpen(!panelOpen)} style={{ position: 'sticky', top: '60px', zIndex: 90, width: '100%', padding: '10px', background: 'white', border: 'none', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {panelOpen ? '▲ Hide destinations' : '▼ Choose destination'}
            {pathData && <span style={{ background: pathData.light, color: pathData.color, padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{pathData.emoji} {pathData.name}</span>}
          </button>
        )}

        {(panelOpen || !mobile) && (
          <div style={{ borderRight: mobile ? 'none' : '1px solid #e2e8f0', padding: mobile ? '12px' : '18px 14px', overflowY: 'auto', maxHeight: mobile ? '50vh' : 'calc(100vh - 60px)', background: 'white', display: 'flex', flexDirection: 'column', gap: '8px', ...(mobile ? { borderBottom: '1px solid #e2e8f0' } : {}) }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '2px' }}>NAK PERGI MANA?</div>

            {PATHS.map((p, i) => {
              const isSel = selectedPath === p.id;
              return (
                <button key={p.id} onClick={() => selectPath(p.id)} style={{ background: isSel ? p.light : 'white', border: isSel ? `2px solid ${p.color}` : '2px solid #e2e8f0', borderRadius: '12px', padding: mobile ? '12px' : '13px 14px', cursor: 'pointer', textAlign: 'left', color: '#0f172a', transition: 'all 0.3s ease', boxShadow: isSel ? `0 3px 12px ${p.glow}` : '0 1px 2px rgba(0,0,0,0.04)', animation: `slideIn 0.3s ease ${i * 0.04}s both` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: isSel ? p.color : p.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{p.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isSel ? p.color : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{p.subtitle}</div>
                    </div>
                    {isSel && <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: '800', flexShrink: 0 }}>✓</div>}
                  </div>
                </button>
              );
            })}

            {/* Steps */}
            {pathData && (
              <div style={{ marginTop: '8px', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', animation: 'viewFade 0.3s ease' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', color: pathData.color, letterSpacing: '0.12em', marginBottom: '10px' }}>PANDUAN STEP-BY-STEP</div>
                <div style={{ height: '3px', borderRadius: '2px', background: '#e2e8f0', marginBottom: '14px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: pathData.color, width: `${((animStep + 1) / pathData.steps.length) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
                {pathData.steps.map((step, i) => {
                  const reached = i <= animStep, current = i === animStep;
                  const fl = FLOORS.find(f => f.id === step.floor);
                  return (
                    <div key={i} style={{ display: 'flex', gap: '9px', marginBottom: '10px', opacity: reached ? 1 : 0.22, transition: 'opacity 0.4s' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: current ? pathData.color : reached ? pathData.light : '#f1f5f9', border: current ? 'none' : `1.5px solid ${reached ? pathData.color : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: current ? `0 0 10px ${pathData.glow}` : 'none' }}>{step.icon}</div>
                        {i < pathData.steps.length - 1 && <div style={{ width: '1.5px', height: '12px', background: '#e2e8f0', marginTop: '2px' }} />}
                      </div>
                      <div style={{ paddingTop: '3px' }}>
                        <div style={{ fontSize: '11px', fontWeight: current ? '700' : '500', color: current ? pathData.color : reached ? '#1e293b' : '#94a3b8' }}>{step.text}</div>
                        <button onClick={(e) => { e.stopPropagation(); setView(step.floor); }} style={{ marginTop: '2px', fontSize: '9px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>{fl?.tag} ↗</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginTop: '4px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', marginBottom: '6px' }}>KEMUDAHAN STESEN</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {[['🚪', 'Entrance'], ['⬆️', 'Escalator'], ['🛗', 'Lift'], ['🎫', 'Ticket'], ['💳', 'Top-Up'], ['🚻', 'Restroom'], ['🕌', 'Surau'], ['🏪', 'Shop'], ['👮', 'Security'], ['🚌', 'Bus'], ['🚕', 'Taxi/Grab'], ['🛒', 'NU Sentral']].map(([ic, lb], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '11px' }}>{ic}</span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>{lb}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN VIEW */}
        <div style={{ padding: mobile ? '12px' : '18px', overflowY: 'auto', maxHeight: mobile ? 'none' : 'calc(100vh - 60px)', background: '#f1f5f9' }}>
          {view === '3d' ? (
            <div style={{ animation: 'viewFade 0.4s ease' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '10px' }}>
                ISOMETRIC 3D — TAP FLOOR UNTUK LIHAT 2D
              </div>
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: mobile ? '10px 4px 20px' : '16px 8px 28px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <svg viewBox={`${mobile ? -20 : -50} -20 ${svgW} ${svgH}`} width="100%" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id="bg"><stop offset="0%" stopColor={pathData ? pathData.color : '#cbd5e1'} stopOpacity="0.04" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                  </defs>
                  <rect x="-50" y="-20" width={svgW + 40} height={svgH + 40} fill="url(#bg)" />

                  {[...FLOORS].reverse().map((floor, ri) => {
                    const fi = FLOORS.length - 1 - ri;
                    const yOff = (FLOORS.length - 1 - fi) * gap;
                    const isActive = pathData && pathData.routes[floor.id];
                    const hasConn = pathData && isActive && fi < FLOORS.length - 1 && pathData.routes[FLOORS[fi + 1]?.id];
                    return (
                      <g key={floor.id}>
                        <IsoSlab floor={floor} yOff={yOff} isActive={!!isActive} pathColor={pathData?.color || '#64748b'} pathLight={pathData?.light} onClick={() => setView(floor.id)} allPaths={PATHS} selectedPath={selectedPath} cx={cx} sc={sc} />
                        {hasConn && (
                          <g>
                            <line x1={cx} y1={yOff + (mobile ? 85 : 115)} x2={cx} y2={yOff + gap - 8} stroke={pathData.color} strokeWidth="2.5" strokeDasharray="6 5" opacity="0.3">
                              <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite" />
                            </line>
                            <rect x={cx - 32} y={yOff + gap / 2 + (mobile ? 28 : 48)} width="64" height="18" rx="5" fill={pathData.light} stroke={pathData.color} strokeWidth="0.8" opacity="0.8" />
                            <text x={cx} y={yOff + gap / 2 + (mobile ? 38 : 58)} textAnchor="middle" fontSize="5" fontWeight="700" fill={pathData.color} dominantBaseline="central">↕ Escalator</text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              {!selectedPath && (
                <div style={{ textAlign: 'center', marginTop: '20px', animation: 'viewFade 0.5s ease 0.3s both' }}>
                  <div style={{ fontSize: '32px', marginBottom: '6px' }}>{mobile ? '👆' : '👈'}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Pilih destinasi untuk lihat laluan berwarna</div>
                </div>
              )}
            </div>
          ) : (
            <FloorPlan2D floor={FLOORS.find(f => f.id === view)} selectedPath={selectedPath} onBack={() => setView('3d')} />
          )}
        </div>
      </div>
    </div>
  );
}
