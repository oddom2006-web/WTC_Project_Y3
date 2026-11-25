'use client';
// src/components/home/FooterScene.tsx
// Isometric animated logistics scene (warehouse, trucks, forklift, workers) — pure SVG + CSS, no images.
import React from 'react';
import styles from './BannerScene.module.css';

/* ───────────── ISOMETRIC MATH ─────────────
   World axes: x runs down-right, y runs down-left, z is up.
   U = pixels per world unit. P() converts world (x,y,z) → screen (px,py). */
const U  = 18;
const C  = 0.866 * U;      // horizontal step per unit of x or y
const S  = 0.5   * U;      // vertical step per unit of x or y
const OX = 175, OY = 92;   // where world (0,0,0) lands in the SVG

const P = (x: number, y: number, z = 0): [number, number] =>
  [OX + (x - y) * C, OY + (x + y) * S - z * U];

// Turn a list of world points into an SVG "points" string
const pts = (a: [number, number, number][]) =>
  a.map(([x, y, z]) => P(x, y, z).map(n => n.toFixed(1)).join(',')).join(' ');

// Pixel distance of a world move — used for CSS animation variables
const mv = (dx: number, dy: number, dz = 0) => ({
  '--dx': `${((dx - dy) * C).toFixed(1)}px`,
  '--dy': `${((dx + dy) * S - dz * U).toFixed(1)}px`,
}) as React.CSSProperties;

/* ───────────── PALETTE ─────────────
   Theme-dependent colours are CSS variables (see the .module.css file). */
const YEL   = { top: '#ffe27a', left: '#ffc21a', right: '#e6a800' };   // truck / forklift yellow
const NAVY  = { top: '#3e5bb8', left: '#2c3f86', right: '#22316a' };   // truck cab
const CRATE = { top: '#ffd98a', left: '#f2ab3c', right: '#d98a1f' };   // cardboard crates
const DARK  = { top: '#3a3f52', left: '#2a2e3d', right: '#20232f' };   // chassis, masts

type Face = { top: string; left: string; right: string };

/* ───────────── PRIMITIVES ───────────── */
// An isometric box. w = size along x, d = size along y, h = height.
function Box({ x, y, z = 0, w, d, h, c }: { x: number; y: number; z?: number; w: number; d: number; h: number; c: Face }) {
  return (
    <g className={styles.edge}>
      {/* +y side (faces front-left) */}
      <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} style={{ fill: c.left }} />
      {/* +x side (faces front-right) */}
      <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} style={{ fill: c.right }} />
      {/* top */}
      <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} style={{ fill: c.top }} />
    </g>
  );
}

// Flat quad on a plane, e.g. windows or road markings
const Quad = ({ p, fill, cls }: { p: [number, number, number][]; fill: string; cls?: string }) =>
  <polygon points={pts(p)} style={{ fill }} className={cls} />;

// Wheel drawn on the +y face of a vehicle
function Wheel({ x, y, z = 0.5 }: { x: number; y: number; z?: number }) {
  const [px, py] = P(x, y, z);
  return (
    <g>
      <ellipse cx={px} cy={py} rx={5.6} ry={6} fill="#1c1f29" />
      <ellipse cx={px} cy={py} rx={2.4} ry={2.6} fill="#cfd6e6" />
    </g>
  );
}

// Stack of crates on a pallet. cols along x, rows along y.
function Stack({ x, y, cols, rows, layers }: { x: number; y: number; cols: number; rows: number; layers: number }) {
  const s = 1.15, pal = 0.2, out: React.ReactNode[] = [];
  out.push(<Box key="pal" x={x - 0.05} y={y - 0.05} w={cols * s + 0.1} d={rows * s + 0.1} h={pal} c={{ top: '#ffcf70', left: '#f0a030', right: '#c9801a' }} />);
  // Draw back-to-front, bottom-to-top so faces overlap correctly
  for (let l = 0; l < layers; l++)
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        out.push(<Box key={`${l}-${i}-${j}`} x={x + i * s} y={y + j * s} z={pal + l * 0.95} w={s - 0.04} d={s - 0.04} h={0.95} c={CRATE} />);
  return <g>{out}</g>;
}

// Little worker. (x,y) is where the feet are standing.
function Worker({ x, y, shirt = '#ff8a1f', carry = false }: { x: number; y: number; shirt?: string; carry?: boolean }) {
  const [px, py] = P(x, y, 0);
  return (
    <g transform={`translate(${px} ${py})`}>
      <ellipse cx="0" cy="0.5" rx="5" ry="2" fill="rgba(0,0,0,.22)" />
      <g className={styles.bob}>
        <rect x="-3" y="-6" width="6" height="6" rx="1" fill="#25336b" />            {/* legs */}
        <rect x="-3.6" y="-13.4" width="7.2" height="7.6" rx="1.8" fill={shirt} />   {/* vest */}
        <circle cx="0" cy="-16.8" r="3.2" fill="#f1c9a5" />                          {/* head */}
        <path d="M-3.5 -17 a3.5 3.5 0 0 1 7 0z" fill="#ffc21a" />                    {/* helmet */}
        {carry && <rect x="1.2" y="-12" width="6" height="5.5" fill="#f2ab3c" stroke="#b9741a" strokeWidth=".6" />}
      </g>
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const [px, py] = P(x + 0.15, y + 0.15, 1.7);
  return (
    <g>
      <Box x={x} y={y} w={0.3} d={0.3} h={1.6} c={{ top: '#a0643a', left: '#8a5230', right: '#6e4024' }} />
      <g className={styles.sway}>
        <circle cx={px} cy={py} r="11" fill="#5fbf3a" />
        <circle cx={px - 3.5} cy={py - 3.5} r="6.5" fill="#86dc57" />
      </g>
    </g>
  );
}

/* ───────────── TRUCK ─────────────
   cabFirst=false → cab at the +x end (driving down-right).
   cabFirst=true  → cab at the -x end; the +x end is the open rear, facing the viewer. */
function Truck({ x, y, cabFirst = false, open = false }: { x: number; y: number; cabFirst?: boolean; open?: boolean }) {
  const cargoX = cabFirst ? x + 1.25 : x;
  const cabX   = cabFirst ? x        : x + 3.45;
  const yd = 1.7, tail = cargoX + 3.45;           // truck width (y) and x of the rear face
  const [lx, ly] = P(cargoX + 0.35, y + yd, 1.0);  // where the "DELIVERY" text sits
  return (
    <g>
      <Box x={x} y={y} z={0.15} w={4.7} d={yd} h={0.4} c={DARK} />                                 {/* chassis */}
      <Box x={cargoX} y={y} z={0.5} w={3.45} d={yd} h={1.95} c={YEL} />                            {/* cargo box */}
      <Box x={cabX} y={y} z={0.5} w={1.25} d={yd} h={1.35} c={NAVY} />                             {/* cab */}
      {/* navy stripe + text on the cargo side */}
      <Quad p={[[cargoX, y + yd, 0.85], [cargoX + 3.45, y + yd, 0.85], [cargoX + 3.45, y + yd, 1.2], [cargoX, y + yd, 1.2]]} fill="#2c3f86" />
      <text transform={`matrix(0.866 0.5 0 1 ${lx} ${ly})`} fontSize="6.4" fontWeight="800" fontStyle="italic" fill="#2c3f86" fontFamily="DM Sans, sans-serif" letterSpacing=".5">DELIVERY</text>
      {/* windows */}
      <Quad p={[[cabX + 0.12, y + yd, 1.15], [cabX + 1.13, y + yd, 1.15], [cabX + 1.13, y + yd, 1.75], [cabX + 0.12, y + yd, 1.75]]} fill="#bcd6ff" />
      {!cabFirst && <Quad p={[[cabX + 1.25, y + 0.15, 1.1], [cabX + 1.25, y + yd - 0.15, 1.1], [cabX + 1.25, y + yd - 0.15, 1.75], [cabX + 1.25, y + 0.15, 1.75]]} fill="#9fc3ff" />}
      {!cabFirst && <Quad p={[[cabX + 1.25, y + 0.2, 0.65], [cabX + 1.25, y + 0.5, 0.65], [cabX + 1.25, y + 0.5, 0.85], [cabX + 1.25, y + 0.2, 0.85]]} fill="#fff6c8" />}
      {/* open rear: dark interior, crates inside, door flap */}
      {cabFirst && open && (
        <g>
          <Quad p={[[tail + 0.02, y + 0.12, 0.62], [tail + 0.02, y + yd - 0.12, 0.62], [tail + 0.02, y + yd - 0.12, 2.35], [tail + 0.02, y + 0.12, 2.35]]} fill="#2a2418" />
          <Box x={tail - 0.9} y={y + 0.2} z={0.62} w={0.85} d={0.62} h={0.62} c={CRATE} />
          <Box x={tail - 0.9} y={y + 0.9} z={0.62} w={0.85} d={0.62} h={0.62} c={CRATE} />
          <Box x={tail - 0.9} y={y + 0.55} z={1.24} w={0.85} d={0.62} h={0.62} c={CRATE} />
        </g>
      )}
      <Wheel x={x + 0.9} y={y + yd} />
      <Wheel x={x + 3.7} y={y + yd} />
    </g>
  );
}

/* ───────────── FORKLIFT (faces +x) ───────────── */
function Forklift({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Box x={x} y={y} z={0.3} w={1.5} d={1.0} h={0.75} c={YEL} />
      <Box x={x + 0.1} y={y + 0.05} z={1.05} w={0.08} d={0.08} h={0.8} c={DARK} />
      <Box x={x + 0.1} y={y + 0.87} z={1.05} w={0.08} d={0.08} h={0.8} c={DARK} />
      <Box x={x - 0.05} y={y} z={1.85} w={1.0} d={1.0} h={0.08} c={DARK} />
      <Box x={x + 1.5} y={y + 0.1} w={0.12} d={0.8} h={1.9} c={DARK} />
      {/* fork + load rise and lower together */}
      <g className={styles.lift}>
        <Box x={x + 1.62} y={y + 0.12} z={0.18} w={1.0} d={0.1} h={0.07} c={DARK} />
        <Box x={x + 1.62} y={y + 0.72} z={0.18} w={1.0} d={0.1} h={0.07} c={DARK} />
        <Box x={x + 1.7} y={y + 0.14} z={0.25} w={0.85} d={0.7} h={0.7} c={CRATE} />
      </g>
      <Wheel x={x + 0.35} y={y + 1.0} z={0.3} />
      <Wheel x={x + 1.2}  y={y + 1.0} z={0.3} />
    </g>
  );
}

/* ───────────── MAIN SCENE ───────────── */
export default function FooterScene() {
  const WX0 = 2, WX1 = 12, WY0 = 0.8, WY1 = 5, WH = 3.6, RIDGE = 5.4, WYM = 2.9;  // warehouse bounds
  const ribs = Array.from({ length: 19 }, (_, i) => WX0 + 0.5 + i * 0.5);          // roof ribs

  return (
    <section className={styles.wrap} aria-hidden="true">
      <div className={styles.card}>
        <svg className={styles.scene} viewBox="0 -60 540 470" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="fs-glow" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="var(--glow)" stopOpacity=".55" />
              <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="260" cy="250" rx="270" ry="170" fill="url(#fs-glow)" />

          {/* drifting clouds */}
          <g className={styles.cloudA}><ellipse cx="70" cy="40" rx="30" ry="9" className={styles.cloud} /><ellipse cx="90" cy="34" rx="20" ry="8" className={styles.cloud} /></g>
          <g className={styles.cloudB}><ellipse cx="420" cy="28" rx="26" ry="8" className={styles.cloud} /><ellipse cx="438" cy="23" rx="16" ry="7" className={styles.cloud} /></g>

          {/* ── ground slab ── */}
          <Quad p={[[0, 0, -0.5], [22, 0, -0.5], [22, 10.5, -0.5], [0, 10.5, -0.5]]} fill="var(--ground-r)" />
          <Quad p={[[0, 10.5, 0], [22, 10.5, 0], [22, 10.5, -0.5], [0, 10.5, -0.5]]} fill="var(--ground-l)" />
          <Quad p={[[22, 0, 0], [22, 10.5, 0], [22, 10.5, -0.5], [22, 0, -0.5]]} fill="var(--ground-r)" />
          <Quad p={[[0, 0, 0], [22, 0, 0], [22, 10.5, 0], [0, 10.5, 0]]} fill="var(--ground-top)" />

          {/* ── road with centre dashes ── */}
          <Quad p={[[0, 6.2, 0.01], [22, 6.2, 0.01], [22, 10.2, 0.01], [0, 10.2, 0.01]]} fill="var(--road)" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = P(0.6 + i * 1.8, 8.2, 0.02), b = P(1.5 + i * 1.8, 8.2, 0.02);
            return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--road-line)" strokeWidth="2" strokeLinecap="round" />;
          })}

          {/* left crate stack + front-left tree */}
          <Stack x={0.3} y={1.4} cols={1} rows={2} layers={2} />
          <Tree x={0.5} y={4.7} />

          {/* ── WAREHOUSE ── */}
          <g className={styles.edge}>
            {/* front-left wall (y = WY1) */}
            <Quad p={[[WX0, WY1, 0], [WX1, WY1, 0], [WX1, WY1, WH], [WX0, WY1, WH]]} fill="var(--wall-l)" />
            <Quad p={[[WX0, WY1, 0], [WX1, WY1, 0], [WX1, WY1, 0.35], [WX0, WY1, 0.35]]} fill="#f2a42a" />
            {[3.2, 5.4, 7.6].map(wx => (
              <Quad key={wx} p={[[wx, WY1, 1.5], [wx + 1.0, WY1, 1.5], [wx + 1.0, WY1, 2.6], [wx, WY1, 2.6]]} fill="#4d7cf0" />
            ))}
            {/* gable end (x = WX1) */}
            <Quad p={[[WX1, WY0, 0], [WX1, WY1, 0], [WX1, WY1, WH], [WX1, WYM, RIDGE], [WX1, WY0, WH]]} fill="var(--wall-r)" />
            {/* loading door: dark opening + sliding shutter */}
            <Quad p={[[WX1, 2.0, 0], [WX1, 3.9, 0], [WX1, 3.9, 2.5], [WX1, 2.0, 2.5]]} fill="#1b2037" />
            <g className={styles.shutter}>
              <Quad p={[[WX1, 2.0, 0], [WX1, 3.9, 0], [WX1, 3.9, 2.5], [WX1, 2.0, 2.5]]} fill="#9aa4bd" />
              {[0.5, 1.0, 1.5, 2.0].map(z => (
                <line key={z} x1={P(WX1, 2.0, z)[0]} y1={P(WX1, 2.0, z)[1]} x2={P(WX1, 3.9, z)[0]} y2={P(WX1, 3.9, z)[1]} stroke="rgba(0,0,0,.25)" strokeWidth=".8" />
              ))}
            </g>
            {/* roof: back slope, then front slope */}
            <Quad p={[[WX0, WY0, WH], [WX1, WY0, WH], [WX1, WYM, RIDGE], [WX0, WYM, RIDGE]]} fill="#2f55bd" />
            <Quad p={[[WX0, WYM, RIDGE], [WX1, WYM, RIDGE], [WX1, WY1 + 0.2, WH - 0.15], [WX0, WY1 + 0.2, WH - 0.15]]} fill="#4a78e6" />
            {ribs.map(rx => (
              <g key={rx} stroke="rgba(255,255,255,.22)" strokeWidth=".8">
                <line x1={P(rx, WYM, RIDGE)[0]} y1={P(rx, WYM, RIDGE)[1]} x2={P(rx, WY1 + 0.2, WH - 0.15)[0]} y2={P(rx, WY1 + 0.2, WH - 0.15)[1]} />
                <line x1={P(rx, WY0, WH)[0]} y1={P(rx, WY0, WH)[1]} x2={P(rx, WYM, RIDGE)[0]} y2={P(rx, WYM, RIDGE)[1]} />
              </g>
            ))}
          </g>

          {/* crate stacks beside the warehouse */}
          <Stack x={14}   y={0.8} cols={2} rows={2} layers={2} />
          <Stack x={16.8} y={0.8} cols={2} rows={1} layers={3} />
          <Stack x={19.2} y={1.2} cols={1} rows={2} layers={2} />
          <Tree x={20.6} y={4.6} />

          {/* small pile in front of the warehouse wall (drawn before the truck) */}
          <Stack x={9.4} y={5.3} cols={1} rows={1} layers={2} />

          {/* forklift shuttling between the stacks */}
          <g className={styles.shuttle} style={mv(3, 0)}>
            <Forklift x={13.4} y={4.0} />
          </g>

          {/* parked delivery truck with open rear (rear faces the viewer) */}
          <Truck x={3} y={6.45} cabFirst open />

          {/* workers: one carries a crate from the truck rear to the pile */}
          <Worker x={12.8} y={5.4} shirt="#2f8f5b" />
          <g className={styles.carry} style={mv(2.2, 0)}>
            <Worker x={8.0} y={7.1} carry />
          </g>

          {/* driving truck: loops along the front lane */}
          <g className={styles.drive} style={mv(29, 0)}>
            <g className={styles.bob}><Truck x={-4} y={8.5} /></g>
          </g>

          <Worker x={1.8} y={5.7} shirt="#e8591c" />
        </svg>
      </div>
    </section>
  );
}