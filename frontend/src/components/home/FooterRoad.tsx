'use client';
// src/components/home/FooterRoad.tsx
// Full-width footer bottom bar: the copyright text sits over a 3D-style skyline,
// with a two-lane road below where motorbikes, a car and a delivery van drive back and forth.
import React from 'react';
import styles from './FooterRoad.module.css';

/* ───────────── VEHICLES (pseudo-3D: side face + top face + front face) ───────────── */

// Delivery motorbike with a 3D box on the back. Faces right.
function Bike({ box = '#f4872c', boxTop = '#ffb04a', boxSide = '#d4691f', shirt = '#2f9e78' }:
  { box?: string; boxTop?: string; boxSide?: string; shirt?: string }) {
  const Wheel = ({ cx }: { cx: number }) => (
    <g className={styles.spin}>
      <circle cx={cx} cy="43" r="10" fill="#1b1e29" />
      <circle cx={cx} cy="43" r="6.5" fill="#cfd6e6" />
      <circle cx={cx} cy="43" r="2" fill="#1b1e29" />
      <path d={`M${cx} 37 V49 M${cx - 6} 43 H${cx + 6}`} stroke="#1b1e29" strokeWidth="1.2" />
    </g>
  );
  return (
    <svg viewBox="0 0 96 58" className={styles.svg} aria-hidden="true">
      <ellipse cx="48" cy="54" rx="34" ry="3" fill="rgba(0,0,0,.28)" />
      <Wheel cx={22} />
      <Wheel cx={74} />
      {/* delivery box: front face, top face, side face */}
      <rect x="6" y="19" width="24" height="17" rx="1.5" fill={box} />
      <polygon points="6,19 12,14 36,14 30,19" fill={boxTop} />
      <polygon points="30,19 36,14 36,31 30,36" fill={boxSide} />
      <text x="18" y="31" fontSize="7" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="DM Sans, sans-serif">ITEA3</text>
      {/* bike body */}
      <path d="M28 40 L36 30 L58 30 L66 36 L58 42 L34 42 Z" fill="#2c3f86" />
      <polygon points="36,30 58,30 60,27 38,27" fill="#3e5bb8" />
      <path d="M62 24 L72 43" stroke="#2a2f3c" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M58 23 L64 22" stroke="#2a2f3c" strokeWidth="3" strokeLinecap="round" />
      <circle cx="66" cy="27" r="2.6" fill="#ffe9a0" />
      {/* rider */}
      <rect x="38" y="12" width="12" height="18" rx="4" fill={shirt} />
      <path d="M48 17 L60 23" stroke={shirt} strokeWidth="4.4" strokeLinecap="round" />
      <path d="M42 29 L48 40" stroke="#24336b" strokeWidth="4.6" strokeLinecap="round" />
      <circle cx="46" cy="7" r="5" fill="#f1c9a5" />
      <path d="M40.5 7 a5.5 5.5 0 0 1 11 0 z" fill="#ffffff" />
    </svg>
  );
}

// Car. Faces right.
function Car({ body = '#f4872c', top = '#ffb04a', dark = '#c9661a' }: { body?: string; top?: string; dark?: string }) {
  const Wheel = ({ cx }: { cx: number }) => (
    <g>
      <circle cx={cx} cy="42" r="11.5" fill={dark} />
      <g className={styles.spin}>
        <circle cx={cx} cy="42" r="9.5" fill="#1b1e29" />
        <circle cx={cx} cy="42" r="5.5" fill="#cfd6e6" />
        <path d={`M${cx} 37 V47 M${cx - 5} 42 H${cx + 5}`} stroke="#1b1e29" strokeWidth="1.1" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 128 58" className={styles.svg} aria-hidden="true">
      <ellipse cx="64" cy="54" rx="54" ry="3" fill="rgba(0,0,0,.28)" />
      <path d="M6 42 L6 31 Q6 26 12 25 L32 22 L44 10 Q46 8 50 8 L84 8 Q88 8 90 10 L102 22 L116 25 Q121 26 121 31 L121 42 Z" fill={body} />
      <polygon points="46,8 88,8 92,4 50,4" fill={top} />
      <polygon points="121,26 127,23 127,38 121,42" fill={dark} />
      <path d="M47 12 L62 12 L62 22 L36 22 Z" fill="#9fd6ff" />
      <path d="M66 12 L84 12 L96 22 L66 22 Z" fill="#9fd6ff" />
      <path d="M64 22 V40" stroke={dark} strokeWidth="1.2" />
      <rect x="8" y="33" width="112" height="2.5" fill="rgba(255,255,255,.55)" />
      <rect x="118" y="28" width="4" height="4" rx="1" fill="#ffe9a0" />
      <rect x="6" y="29" width="3" height="5" fill="#ff4b4b" />
      <Wheel cx={30} />
      <Wheel cx={98} />
    </svg>
  );
}

// Delivery van with ITEA3 stripe. Faces right (text would mirror, so keep it on right-going lanes).
function Van() {
  const Wheel = ({ cx }: { cx: number }) => (
    <g>
      <circle cx={cx} cy="46" r="11.5" fill="#1d2a5c" />
      <g className={styles.spin}>
        <circle cx={cx} cy="46" r="9.5" fill="#1b1e29" />
        <circle cx={cx} cy="46" r="5.5" fill="#cfd6e6" />
        <path d={`M${cx} 41 V51 M${cx - 5} 46 H${cx + 5}`} stroke="#1b1e29" strokeWidth="1.1" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 150 62" className={styles.svg} aria-hidden="true">
      <ellipse cx="74" cy="58" rx="64" ry="3" fill="rgba(0,0,0,.28)" />
      <rect x="4" y="10" width="92" height="36" rx="2" fill="#ffc21a" />
      <polygon points="4,10 11,4 103,4 96,10" fill="#ffe27a" />
      <polygon points="96,10 103,4 103,40 96,46" fill="#e6a800" />
      <rect x="4" y="30" width="92" height="7" fill="#2c3f86" />
      <text x="50" y="36" fontSize="6.4" fontWeight="800" fontStyle="italic" fill="#ffc21a" textAnchor="middle" fontFamily="DM Sans, sans-serif" letterSpacing=".4">ITEA3 EXPRESS</text>
      <path d="M96 20 L116 20 L130 34 L138 37 Q142 38 142 42 L142 46 L96 46 Z" fill="#2c3f86" />
      <polygon points="96,20 116,20 121,16 101,16" fill="#3e5bb8" />
      <path d="M99 23 L114 23 L125 34 L99 34 Z" fill="#9fd6ff" />
      <rect x="138" y="38" width="4" height="4" fill="#ffe9a0" />
      <Wheel cx={30} />
      <Wheel cx={112} />
    </svg>
  );
}

/* One vehicle on a lane. dir: 'r' drives right, 'l' drives left (artwork is flipped).
   dur = seconds per crossing, delay = negative seconds so vehicles start staggered,
   rest = where it stands if the user prefers reduced motion. */
function Vehicle({ lane, dir, dur, delay, rest, w, children }:
  { lane: 'far' | 'near'; dir: 'r' | 'l'; dur: number; delay: number; rest: string; w: number; children: React.ReactNode }) {
  const style = {
    width: w,
    animationDuration: `${dur}s`,
    animationDelay: `${delay}s`,
    '--rest': rest,
  } as React.CSSProperties;
  return (
    <div className={`${styles.veh} ${lane === 'far' ? styles.far : styles.near} ${dir === 'r' ? styles.toRight : styles.toLeft}`} style={style}>
      <div className={styles.bounce} style={{ animationDelay: `${delay}s` }}>
        <div className={dir === 'l' ? styles.flip : undefined}>{children}</div>
      </div>
    </div>
  );
}

/* ───────────── MAIN COMPONENT ───────────── */
export default function FooterRoad({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      {/* two skyline layers drifting at different speeds (parallax) */}
      <div className={`${styles.sky} ${styles.skyFar}`} aria-hidden="true" />
      <div className={`${styles.sky} ${styles.skyNear}`} aria-hidden="true" />

      {/* the footer text sits on top of the scene */}
      <div className={styles.content}>{children}</div>

      {/* road: raised sidewalk, two lanes, animated centre dashes */}
      <div className={styles.road} aria-hidden="true">
        <div className={styles.walk} />
        <div className={styles.dashes} />

        {/* far lane drives right (smaller) */}
        <Vehicle lane="far" dir="r" dur={17} delay={-3}  rest="18%" w={104}><Van /></Vehicle>
        <Vehicle lane="far" dir="r" dur={11} delay={-8}  rest="64%" w={62}><Bike /></Vehicle>

        {/* near lane drives left (bigger) */}
        <Vehicle lane="near" dir="l" dur={13} delay={-2}  rest="40%" w={108}><Car /></Vehicle>
        <Vehicle lane="near" dir="l" dur={9}  delay={-6}  rest="78%" w={80}><Bike box="#3e5bb8" boxTop="#7f9bea" boxSide="#2c3f86" shirt="#e8591c" /></Vehicle>
        <Vehicle lane="near" dir="l" dur={15} delay={-11} rest="4%"  w={104}><Car body="#f5f7fb" top="#ffffff" dark="#9aa4bd" /></Vehicle>
      </div>
    </div>
  );
}