import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// RESPONSIVE HOOK
// ============================================
function useWindowSize() {
  const [s, setS] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => { const fn = () => setS({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  return s;
}

// ============================================
// KL SENTRAL DATA
// ============================================
const FLOORS = [
  { id: 'erl', tag: 'L3', label: 'ERL Level', subtitle: 'KLIA Ekspres & Transit', icon: '✈️' },
  { id: 'lrt', tag: 'L2', label: 'LRT & MRT Level', subtitle: 'Kelana Jaya & Kajang Line', icon: '🚈' },
  { id: 'concourse', tag: 'L1', label: 'Main Concourse', subtitle: 'KTM Komuter & Connections', icon: '🚂' },
  { id: 'ground', tag: 'G', label: 'Ground Level', subtitle: 'Entrances, Taxi & Bus', icon: '🚪' },
];

const PATHS = [
  { id: 'lrt', name: 'LRT Kelana Jaya', subtitle: 'Ampang Park / Putra Heights', color: '#F59E0B', light: '#fef3c7', glow: 'rgba(245,158,11,0.3)', emoji: '🟠', keywords: ['lrt', 'kelana', 'ampang', 'putra', 'light rail', 'train'] },
  { id: 'mrt', name: 'MRT Kajang Line', subtitle: 'Muzium Negara / Kajang', color: '#10B981', light: '#d1fae5', glow: 'rgba(16,185,129,0.3)', emoji: '🟢', keywords: ['mrt', 'kajang', 'muzium', 'metro', 'subway'] },
  { id: 'erl', name: 'KLIA (Airport)', subtitle: 'KLIA Ekspres / Transit', color: '#3B82F6', light: '#dbeafe', glow: 'rgba(59,130,246,0.3)', emoji: '🔵', keywords: ['klia', 'airport', 'erl', 'ekspres', 'transit', 'flight', 'plane', 'lapangan terbang'] },
  { id: 'ktm', name: 'KTM Komuter', subtitle: 'Seremban / Tanjung Malim', color: '#EF4444', light: '#fee2e2', glow: 'rgba(239,68,68,0.3)', emoji: '🔴', keywords: ['ktm', 'komuter', 'seremban', 'tanjung malim', 'commuter'] },
  { id: 'exit', name: 'Exit / Taxi / Bus', subtitle: 'NU Sentral, Grab, GO KL', color: '#A855F7', light: '#ede9fe', glow: 'rgba(168,85,247,0.3)', emoji: '🟣', keywords: ['exit', 'keluar', 'taxi', 'grab', 'bus', 'nu sentral', 'mall', 'shopping'] },
];

// Crowd data (simulated real-time)
const useCrowdData = () => {
  const [data, setData] = useState({});
  useEffect(() => {
    const gen = () => {
      const d = {};
      FLOORS.forEach(f => { d[f.id] = Math.random(); });
      ['platform1', 'platform2', 'ticketing', 'escalatorA', 'escalatorB', 'entrance', 'hall'].forEach(z => { d[z] = Math.random(); });
      setData(d);
    };
    gen();
    const t = setInterval(gen, 4000);
    return () => clearInterval(t);
  }, []);
  return data;
};

const crowdColor = (v) => v > 0.7 ? '#EF4444' : v > 0.4 ? '#F59E0B' : '#10B981';
const crowdLabel = (v) => v > 0.7 ? 'Crowded' : v > 0.4 ? 'Moderate' : 'Clear';

// ============================================
// ISO HELPERS
// ============================================
const isoX = (x, y, cx, s) => cx + (x - y) * s;
const isoY = (x, y, cy, s) => cy + (x + y) * (s * 0.5);

// ============================================
// ISOMETRIC SLAB
// ============================================
const IsoSlab = ({ floor, yOff, isActive, pathColor, onClick, cx, sc, crowdVal, showCrowd }) => {
  const W = 110, H = 80;
  const pts = [[isoX(0, 0, cx, sc), isoY(0, 0, 80, sc)], [isoX(W, 0, cx, sc), isoY(W, 0, 80, sc)], [isoX(W, H, cx, sc), isoY(W, H, 80, sc)], [isoX(0, H, cx, sc), isoY(0, H, 80, sc)]];
  const d = 18;
  const [hv, setHv] = useState(false);
  const cc = showCrowd ? crowdColor(crowdVal || 0) : null;

  return (
    <g transform={`translate(0,${yOff})`} style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)}>
      <polygon points={pts.map(([x, y]) => `${x + 5},${y + d + 8}`).join(' ')} fill="rgba(0,0,0,0.03)" />
      <polygon points={`${pts[2].join(',')},${pts[3].join(',')},${pts[3][0]},${pts[3][1] + d},${pts[2][0]},${pts[2][1] + d}`} fill={showCrowd ? `${cc}25` : isActive ? `${pathColor}28` : '#e2e8f0'} stroke={showCrowd ? `${cc}55` : isActive ? `${pathColor}55` : '#cbd5e1'} strokeWidth="0.5" />
      <polygon points={`${pts[1].join(',')},${pts[2].join(',')},${pts[2][0]},${pts[2][1] + d},${pts[1][0]},${pts[1][1] + d}`} fill={showCrowd ? `${cc}18` : isActive ? `${pathColor}18` : '#e8ecf0'} stroke={showCrowd ? `${cc}40` : isActive ? `${pathColor}40` : '#cbd5e1'} strokeWidth="0.5" />
      <polygon points={pts.map(p => p.join(',')).join(' ')} fill={showCrowd ? `${cc}08` : isActive ? `${pathColor}10` : hv ? '#f8fafc' : '#fff'} stroke={showCrowd ? cc : isActive ? pathColor : hv ? '#94a3b8' : '#cbd5e1'} strokeWidth={isActive || showCrowd ? 2 : hv ? 1.2 : 0.7} />
      {[0.25, 0.5, 0.75].map(t => <g key={t}><line x1={isoX(W * t, 0, cx, sc)} y1={isoY(W * t, 0, 80, sc)} x2={isoX(W * t, H, cx, sc)} y2={isoY(W * t, H, 80, sc)} stroke="#e2e8f0" strokeWidth="0.3" /><line x1={isoX(0, H * t, cx, sc)} y1={isoY(0, H * t, 80, sc)} x2={isoX(W, H * t, cx, sc)} y2={isoY(W, H * t, 80, sc)} stroke="#e2e8f0" strokeWidth="0.3" /></g>)}
      <text x={isoX(W / 2, H / 2, cx, sc)} y={isoY(W / 2, H / 2, 80, sc) - 8} textAnchor="middle" fontSize="22" dominantBaseline="central">{floor.icon}</text>
      <text x={isoX(W / 2, H / 2, cx, sc)} y={isoY(W / 2, H / 2, 80, sc) + 12} textAnchor="middle" fontSize="6" fontWeight="800" fill={showCrowd ? cc : isActive ? pathColor : '#475569'} dominantBaseline="central">{floor.label}</text>
      <text x={isoX(W / 2, H / 2, cx, sc)} y={isoY(W / 2, H / 2, 80, sc) + 22} textAnchor="middle" fontSize="4.5" fontWeight="600" fill={hv ? '#3b82f6' : '#94a3b8'} dominantBaseline="central">TAP TO VIEW 2D</text>
      {/* Tag */}
      <g><rect x={isoX(-16, H / 2, cx, sc) - 16} y={isoY(-16, H / 2, 80, sc) - 12} width="32" height="24" rx="6" fill={showCrowd ? cc : isActive ? pathColor : '#f1f5f9'} stroke={showCrowd ? cc : isActive ? pathColor : '#cbd5e1'} strokeWidth="0.8" /><text x={isoX(-16, H / 2, cx, sc)} y={isoY(-16, H / 2, 80, sc) + 1} textAnchor="middle" fontSize="10" fontWeight="900" fill={isActive || showCrowd ? 'white' : '#475569'} dominantBaseline="central">{floor.tag}</text></g>
      {/* Right label */}
      <text x={isoX(W + 14, H / 2, cx, sc)} y={isoY(W + 14, H / 2, 80, sc)} fontSize="5.5" fontWeight="700" fill={isActive ? pathColor : '#94a3b8'} dominantBaseline="central">{floor.subtitle}</text>
      {/* Crowd badge */}
      {showCrowd && crowdVal !== undefined && (
        <g>
          <rect x={isoX(W + 14, H / 2, cx, sc)} y={isoY(W + 14, H / 2, 80, sc) + 8} width="50" height="16" rx="4" fill={cc} opacity="0.15" />
          <circle cx={isoX(W + 14, H / 2, cx, sc) + 7} cy={isoY(W + 14, H / 2, 80, sc) + 16} r="3" fill={cc}>
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x={isoX(W + 14, H / 2, cx, sc) + 14} y={isoY(W + 14, H / 2, 80, sc) + 16.5} fontSize="5" fontWeight="700" fill={cc} dominantBaseline="central">{crowdLabel(crowdVal)}</text>
        </g>
      )}
    </g>
  );
};

// ============================================
// AI CHATBOT COMPONENT
// ============================================
const AIChatbot = ({ onSelectPath, selectedPath }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! 👋 I'm your KL Sentral AI Navigator. Tell me where you want to go — in any language!\n\nContoh: \"Saya nak pergi KLIA\", \"How to get to LRT?\", \"去机场怎么走？\"" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an AI navigator kiosk at KL Sentral station in Malaysia. Your job is to help travelers find their way using the colored floor signage system.

Available destinations and their colored paths:
- ORANGE (🟠): LRT Kelana Jaya Line (to Ampang Park, Putra Heights, etc.)
- GREEN (🟢): MRT Kajang Line (to Muzium Negara, Kajang, etc.)
- BLUE (🔵): KLIA Airport (KLIA Ekspres / KLIA Transit)
- RED (🔴): KTM Komuter (to Seremban, Tanjung Malim, etc.)
- PURPLE (🟣): Exit / Taxi / Grab / Bus / NU Sentral Mall

Rules:
1. Detect the user's language and respond in the SAME language
2. Be friendly, concise (2-3 sentences max)
3. Always tell them which COLOR to follow
4. MUST end your response with exactly one of these tags on a new line: [PATH:lrt] or [PATH:mrt] or [PATH:erl] or [PATH:ktm] or [PATH:exit]
5. If unclear, ask a short clarifying question (no tag needed)
6. If they ask about monorail, tell them to follow PURPLE to exit, then use the covered walkway to KL Monorail station`,
          messages: [{ role: "user", content: userMsg }],
        })
      });

      const data = await response.json();
      const reply = data.content?.map(c => c.text || '').join('') || "Sorry, I couldn't process that. Try again!";

      // Extract path tag
      const tagMatch = reply.match(/\[PATH:(\w+)\]/);
      const cleanReply = reply.replace(/\[PATH:\w+\]/g, '').trim();

      setMessages(prev => [...prev, { role: 'assistant', text: cleanReply }]);

      if (tagMatch) {
        const pathId = tagMatch[1];
        if (PATHS.find(p => p.id === pathId)) {
          setTimeout(() => onSelectPath(pathId), 600);
        }
      }
    } catch (err) {
      // Fallback: local keyword matching
      const lower = userMsg.toLowerCase();
      let matched = null;
      for (const p of PATHS) {
        if (p.keywords.some(k => lower.includes(k))) { matched = p; break; }
      }
      if (matched) {
        setMessages(prev => [...prev, { role: 'assistant', text: `Follow the ${matched.emoji} ${matched.color === '#F59E0B' ? 'ORANGE' : matched.color === '#10B981' ? 'GREEN' : matched.color === '#3B82F6' ? 'BLUE' : matched.color === '#EF4444' ? 'RED' : 'PURPLE'} line on the floor to reach ${matched.name}! Look for the colored path at your feet and follow it.` }]);
        setTimeout(() => onSelectPath(matched.id), 600);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "I can help you find: LRT, MRT, KLIA (Airport), KTM Komuter, or Exit/Taxi/Bus. Which one?" }]);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
              background: m.role === 'user' ? '#3b82f6' : '#f1f5f9',
              color: m.role === 'user' ? 'white' : '#1e293b',
              fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap',
              borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
              borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '14px',
            }}>
              {m.role === 'assistant' && <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>🤖 AI Navigator</span>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 18px', borderRadius: '14px', background: '#f1f5f9', fontSize: '13px', color: '#94a3b8' }}>
              ● ● ●
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', background: 'white' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type destination... (any language)"
          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white',
          fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, flexShrink: 0,
        }}>Send</button>
      </div>
    </div>
  );
};

// ============================================
// AR VIEW COMPONENT
// ============================================
const ARView = ({ selectedPath }) => {
  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const t = setInterval(() => setPulse(p => (p + 1) % 100), 50); return () => clearInterval(t); }, []);

  return (
    <div style={{ background: '#0f172a', borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '100%', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Camera simulation */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)', opacity: 0.9 }} />
      {/* Grid overlay (floor tiles) */}
      <svg viewBox="0 0 400 300" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="argrid" width="50" height="40" patternUnits="userSpaceOnUse" patternTransform="skewX(-15)">
            <rect width="50" height="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#argrid)" />

        {pathData && (
          <g>
            {/* AR colored path on floor */}
            <line x1="200" y1="290" x2="200" y2="80" stroke={pathData.color} strokeWidth="28" opacity="0.15" strokeLinecap="round" />
            <line x1="200" y1="290" x2="200" y2="80" stroke={pathData.color} strokeWidth="16" opacity="0.3" strokeLinecap="round" />
            <line x1="200" y1="290" x2="200" y2="80" stroke={pathData.color} strokeWidth="6" opacity="0.8" strokeLinecap="round" strokeDasharray="12 10">
              <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.5s" repeatCount="indefinite" />
            </line>

            {/* AR arrows */}
            {[0, 1, 2, 3].map(i => {
              const y = 240 - i * 50;
              const op = Math.max(0, 1 - Math.abs((pulse % 40) - i * 10) / 15);
              return (
                <g key={i} opacity={0.4 + op * 0.6}>
                  <polygon points={`200,${y - 15} 185,${y + 5} 215,${y + 5}`} fill={pathData.color} />
                </g>
              );
            })}

            {/* Distance indicator */}
            <rect x="140" y="60" width="120" height="36" rx="8" fill={pathData.color} opacity="0.9" />
            <text x="200" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" dominantBaseline="central">{pathData.name}</text>
            <text x="200" y="86" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.8)" dominantBaseline="central">~120m ahead</text>
          </g>
        )}

        {!pathData && (
          <g>
            <text x="200" y="140" textAnchor="middle" fontSize="28">📱</text>
            <text x="200" y="170" textAnchor="middle" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.4)">Point camera at floor</text>
            <text x="200" y="185" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">Select a destination first</text>
          </g>
        )}
      </svg>

      {/* Camera frame overlay */}
      <div style={{ position: 'absolute', inset: '12px', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '12px', pointerEvents: 'none' }}>
        {/* Corner brackets */}
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
          <div key={i} style={{ position: 'absolute', [y ? 'bottom' : 'top']: '-1px', [x ? 'right' : 'left']: '-1px', width: '24px', height: '24px', border: `2px solid ${pathData?.color || 'rgba(255,255,255,0.3)'}`, borderRadius: '2px', [y ? 'borderTop' : 'borderBottom']: 'none', [x ? 'borderLeft' : 'borderRight']: 'none' }} />
        ))}
      </div>

      {/* AR label */}
      <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', color: 'white', letterSpacing: '0.1em' }}>
        📷 AR CAMERA VIEW (Simulated)
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const { w } = useWindowSize();
  const mobile = w < 768;
  const [selectedPath, setSelectedPath] = useState(null);
  const [aiMode, setAiMode] = useState('paths'); // paths, chatbot, crowd, ar, access, scan
  const [accessibility, setAccessibility] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const crowd = useCrowdData();

  const pathData = selectedPath ? PATHS.find(p => p.id === selectedPath) : null;
  const gap = mobile ? 155 : 195;
  const cx = mobile ? 170 : 340;
  const sc = mobile ? 1.5 : 3.0;
  const svgH = FLOORS.length * gap + (mobile ? 170 : 230);

  // Smart scan simulation
  const doScan = () => {
    setScanActive(true);
    setScanResult(null);
    setTimeout(() => {
      const randomPath = PATHS[Math.floor(Math.random() * (PATHS.length - 1))]; // exclude exit
      setScanResult(randomPath);
      setSelectedPath(randomPath.id);
      setScanActive(false);
    }, 2000);
  };

  const AI_MODES = [
    { id: 'paths', label: '🗺️ Paths', title: 'Route Selection' },
    { id: 'chatbot', label: '🤖 AI Chat', title: 'AI Navigator' },
    { id: 'crowd', label: '📊 Crowd', title: 'Live Crowd Heatmap' },
    { id: 'ar', label: '📱 AR View', title: 'AR Camera Guide' },
    { id: 'access', label: '♿ Access', title: 'Accessibility Router' },
    { id: 'scan', label: '💳 Scan', title: 'Smart Card Scan' },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans',-apple-system,sans-serif", color: '#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes viewFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scanPulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}70%{box-shadow:0 0 0 20px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        input:focus{border-color:#3b82f6!important}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: mobile ? '10px 12px' : '12px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.2em' }}>KL SENTRAL • AI-ENHANCED PROTOTYPE</div>
          <h1 style={{ fontSize: mobile ? '14px' : '17px', fontWeight: '900', color: '#0f172a' }}>🚉 KL Sentral — Smart Floor Signage</h1>
        </div>
      </div>

      {/* AI MODE TABS */}
      <div style={{ padding: '8px 12px', background: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', display: 'flex', gap: '5px', WebkitOverflowScrolling: 'touch' }}>
        {AI_MODES.map(m => (
          <button key={m.id} onClick={() => setAiMode(m.id)} style={{
            padding: mobile ? '7px 12px' : '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontSize: mobile ? '11px' : '12px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0,
            background: aiMode === m.id ? '#0f172a' : '#f1f5f9',
            color: aiMode === m.id ? 'white' : '#64748b',
            transition: 'all 0.2s',
          }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{ display: mobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 105px)' }}>

        {/* LEFT PANEL */}
        <div style={{ borderRight: mobile ? 'none' : '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: mobile ? (aiMode === 'chatbot' || aiMode === 'ar' ? '55vh' : 'auto') : 'calc(100vh - 105px)', overflowY: 'auto', ...(mobile ? { borderBottom: '1px solid #e2e8f0' } : {}) }}>

          {/* MODE: PATHS */}
          {aiMode === 'paths' && (
            <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', marginBottom: '2px' }}>NAK PERGI MANA?</div>
              {PATHS.map((p, i) => {
                const isSel = selectedPath === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPath(isSel ? null : p.id)} style={{
                    background: isSel ? p.light : 'white', border: isSel ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                    borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', textAlign: 'left', color: '#0f172a',
                    boxShadow: isSel ? `0 3px 12px ${p.glow}` : '0 1px 2px rgba(0,0,0,0.03)',
                    animation: `slideIn 0.25s ease ${i * 0.04}s both`, transition: 'all 0.25s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: isSel ? p.color : p.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>{p.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: isSel ? p.color : '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.subtitle}</div>
                      </div>
                      {isSel && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: '800', flexShrink: 0 }}>✓</div>}
                    </div>
                  </button>
                );
              })}
              {accessibility && pathData && (
                <div style={{ padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '12px', color: '#1e40af' }}>
                  ♿ <b>Accessibility Mode:</b> Route adjusted to use Lifts instead of Escalators
                </div>
              )}
            </div>
          )}

          {/* MODE: CHATBOT */}
          {aiMode === 'chatbot' && (
            <AIChatbot onSelectPath={setSelectedPath} selectedPath={selectedPath} />
          )}

          {/* MODE: CROWD */}
          {aiMode === 'crowd' && (
            <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>📊 LIVE CROWD DENSITY</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Real-time crowd monitoring (simulated). Updates every 4 seconds.</div>
              {FLOORS.map(f => {
                const v = crowd[f.id] || 0;
                return (
                  <div key={f.id} style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{f.icon} {f.tag} — {f.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: crowdColor(v), background: `${crowdColor(v)}15`, padding: '2px 8px', borderRadius: '6px' }}>{crowdLabel(v)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: crowdColor(v), width: `${v * 100}%`, transition: 'all 1s ease' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{Math.round(v * 100)}% capacity</div>
                  </div>
                );
              })}
              <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '11px', color: '#166534' }}>
                💡 <b>AI Tip:</b> {crowd.erl < 0.4 ? 'ERL level is clear — great time to travel!' : crowd.ground > 0.7 ? 'Ground level is busy — use Entrance B for less crowd.' : 'Moderate traffic across station. Normal flow.'}
              </div>
            </div>
          )}

          {/* MODE: AR */}
          {aiMode === 'ar' && (
            <div style={{ padding: '12px', height: mobile ? '45vh' : '100%' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', marginBottom: '8px' }}>📱 AR CAMERA NAVIGATION</div>
              <ARView selectedPath={selectedPath} />
            </div>
          )}

          {/* MODE: ACCESSIBILITY */}
          {aiMode === 'access' && (
            <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>♿ ACCESSIBILITY SETTINGS</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AI auto-adjusts routes for users with mobility needs.</div>

              {[
                { id: 'wheelchair', label: 'Wheelchair / OKU', icon: '♿', desc: 'Routes use lifts, avoid stairs & escalators' },
                { id: 'elderly', label: 'Elderly / Senior', icon: '👴', desc: 'Shorter routes, avoid crowded paths' },
                { id: 'visual', label: 'Visual Impairment', icon: '👁️', desc: 'High-contrast paths, audio guidance points' },
                { id: 'luggage', label: 'Heavy Luggage', icon: '🧳', desc: 'Wide paths, lift priority, porter points' },
              ].map((opt, i) => (
                <button key={opt.id} onClick={() => { setAccessibility(opt.id === 'wheelchair' ? !accessibility : accessibility); }}
                  style={{
                    background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px',
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: (opt.id === 'wheelchair' && accessibility) ? '#10b981' : '#e2e8f0', transition: 'background 0.3s', display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transform: (opt.id === 'wheelchair' && accessibility) ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.3s' }} />
                  </div>
                </button>
              ))}

              {accessibility && (
                <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '12px', color: '#1e40af', animation: 'viewFade 0.3s ease' }}>
                  ♿ <b>Wheelchair Mode Active</b> — All routes now prioritize lifts. Escalator paths replaced with lift-accessible alternatives. Select a destination to see your adjusted route.
                </div>
              )}
            </div>
          )}

          {/* MODE: SCAN */}
          {aiMode === 'scan' && (
            <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', alignSelf: 'flex-start' }}>💳 SMART CARD SCAN</div>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>Tap your Touch 'n Go / ticket to auto-detect destination and activate the colored path.</div>

              <button onClick={doScan} disabled={scanActive} style={{
                width: '160px', height: '160px', borderRadius: '50%', border: '3px solid #3b82f6',
                background: scanActive ? '#eff6ff' : 'white', cursor: scanActive ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '40px', transition: 'all 0.3s',
                animation: scanActive ? 'scanPulse 1.5s infinite' : 'none',
                boxShadow: '0 4px 20px rgba(59,130,246,0.15)',
              }}>
                {scanActive ? (
                  <div style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : '💳'}
                <span style={{ fontSize: '12px', fontWeight: '700', color: scanActive ? '#3b82f6' : '#64748b' }}>
                  {scanActive ? 'Scanning...' : 'Tap to Scan'}
                </span>
              </button>

              {scanResult && (
                <div style={{ padding: '14px 18px', background: scanResult.light, border: `2px solid ${scanResult.color}`, borderRadius: '14px', textAlign: 'center', animation: 'viewFade 0.4s ease', width: '100%' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{scanResult.emoji}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: scanResult.color }}>{scanResult.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Destination detected! Follow the colored path.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: 3D MAP */}
        <div style={{ padding: mobile ? '12px' : '16px', overflowY: 'auto', maxHeight: mobile ? 'none' : 'calc(100vh - 105px)', background: '#f1f5f9' }}>
          <div style={{ animation: 'viewFade 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em' }}>
                {aiMode === 'crowd' ? '📊 3D CROWD HEATMAP' : 'ISOMETRIC 3D MAP'}
              </div>
              {pathData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: pathData.light, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${pathData.color}40` }}>
                  <span style={{ fontSize: '12px' }}>{pathData.emoji}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: pathData.color }}>{pathData.name}</span>
                  {accessibility && <span style={{ fontSize: '10px' }}>♿</span>}
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: mobile ? '8px 2px 16px' : '14px 6px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <svg viewBox={`${mobile ? -15 : -50} -20 ${mobile ? 400 : 780} ${svgH}`} width="100%" style={{ display: 'block' }}>
                <defs>
                  <radialGradient id="bg"><stop offset="0%" stopColor={pathData ? pathData.color : '#cbd5e1'} stopOpacity="0.04" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient>
                </defs>
                <rect x="-60" y="-20" width="800" height={svgH + 40} fill="url(#bg)" />

                {[...FLOORS].reverse().map((floor, ri) => {
                  const fi = FLOORS.length - 1 - ri;
                  const yOff = (FLOORS.length - 1 - fi) * gap;
                  const isActive = pathData && (
                    (floor.id === 'ground') ||
                    (floor.id === 'concourse' && ['lrt', 'mrt', 'erl', 'ktm', 'exit'].includes(selectedPath)) ||
                    (floor.id === 'lrt' && ['lrt', 'mrt'].includes(selectedPath)) ||
                    (floor.id === 'erl' && selectedPath === 'erl')
                  );
                  const hasConn = isActive && fi < FLOORS.length - 1;

                  return (
                    <g key={floor.id}>
                      <IsoSlab floor={floor} yOff={yOff} isActive={!!isActive}
                        pathColor={pathData?.color || '#64748b'} onClick={() => { }}
                        cx={cx} sc={sc}
                        crowdVal={crowd[floor.id]}
                        showCrowd={aiMode === 'crowd'}
                      />
                      {hasConn && pathData && (
                        <g>
                          <line x1={cx} y1={yOff + (mobile ? 82 : 110)} x2={cx} y2={yOff + gap - 6}
                            stroke={aiMode === 'crowd' ? crowdColor(crowd[floor.id] || 0) : pathData.color}
                            strokeWidth="2.5" strokeDasharray="6 5" opacity="0.3">
                            <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite" />
                          </line>
                          <rect x={cx - 30} y={yOff + gap / 2 + (mobile ? 26 : 46)} width="60" height="16" rx="5"
                            fill={pathData.light} stroke={pathData.color} strokeWidth="0.8" opacity="0.8" />
                          <text x={cx} y={yOff + gap / 2 + (mobile ? 35 : 55)} textAnchor="middle" fontSize="4.5" fontWeight="700"
                            fill={pathData.color} dominantBaseline="central">
                            {accessibility ? '🛗 Lift' : '↕ Escalator'}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend bar */}
            {aiMode === 'crowd' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                {[['#10B981', 'Clear (<40%)'], ['#F59E0B', 'Moderate (40-70%)'], ['#EF4444', 'Crowded (>70%)']].map(([c, l], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>{l}</span>
                  </div>
                ))}
              </div>
            )}

            {!selectedPath && aiMode !== 'crowd' && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{mobile ? '👆' : '👈'}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                  {aiMode === 'chatbot' ? 'Ask the AI chatbot for directions!' : aiMode === 'scan' ? 'Tap your card to auto-detect route!' : 'Pilih destinasi untuk lihat laluan'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
