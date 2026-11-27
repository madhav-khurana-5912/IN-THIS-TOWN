import React from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import {
  Ball,
  Box,
  Cyl,
  Door,
  Panel,
  plankTex,
  textTex,
  tileTex,
  wallSubwayTileTex,
  wallPaperTex,
  wallPlasterTex,
  woodGrainTex,
  counterGraniteTex,
  counterMarbleTex,
  V3,
  Window,
} from './kit';
import { HouseVariant } from './town/buildings';

/**
 * Interior sets. All share one stage layout:
 *   back wall at z = −8, side walls at x = ±13 (z −8 … +10), open toward +Z.
 *   Actors act around x ∈ [−6, 6], z ∈ [−3, 4]; camera at z ≈ 11–16 looking toward −Z.
 * Home interiors take the hero's house `variant`, so each family home has its own palette.
 */

export interface HomePalette {
  wall: string;
  accent: string;
  floor: string;
  sofa: string;
  rug: string;
  blanket: string;
}

export const HOME_PALETTES: Record<HouseVariant, HomePalette> = {
  blue: { wall: '#BFDBFE', accent: '#1E40AF', floor: '#B45309', sofa: '#1E3A8A', rug: '#F59E0B', blanket: '#2563EB' },
  yellow: { wall: '#FEF3C7', accent: '#B91C1C', floor: '#A16207', sofa: '#DC2626', rug: '#2563EB', blanket: '#EF4444' },
  red: { wall: '#E7E5E4', accent: '#7F1D1D', floor: '#78350F', sofa: '#14532D', rug: '#B91C1C', blanket: '#16A34A' },
  white: { wall: '#F1F5F9', accent: '#0F172A', floor: '#D6B48A', sofa: '#334155', rug: '#94A3B8', blanket: '#0F172A' },
  green: { wall: '#D1FAE5', accent: '#065F46', floor: '#B45309', sofa: '#F59E0B', rug: '#7C3AED', blanket: '#A855F7' },
};

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const RoomShell: React.FC<{
  wall: string;
  floorMap: THREE.Texture;
  wallMap?: THREE.Texture;
  sideWall?: string;
  sideWallMap?: THREE.Texture;
  baseboard?: string;
  height?: number;
}> = ({ wall, floorMap, wallMap, sideWall, sideWallMap, baseboard = '#F8FAFC', height = 14 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial map={floorMap} roughness={0.6} />
    </mesh>
    <Box p={[0, height / 2, -8.4]} s={[30, height, 0.8]} c={wall} map={wallMap} rough={0.8} />
    {[-1, 1].map((s) => (
      <Box key={s} p={[s * 13.4, height / 2, 1]} s={[0.8, height, 18]} c={sideWall ?? wall} map={sideWallMap ?? wallMap} rough={0.8} />
    ))}
    <Box p={[0, 0.4, -7.95]} s={[26, 0.8, 0.2]} c={baseboard} />
    {/* ceiling (camera stays in front of it, so shots looking up never see the void) */}
    <Box p={[0, height + 0.3, -1]} s={[28, 0.6, 16]} c="#F1F5F9" />
    <Box p={[0, height - 0.3, -7.9]} s={[26, 0.6, 0.3]} c={baseboard} />
    {[-1, 1].map((s) => (
      <Box key={`b${s}`} p={[s * 12.95, 0.4, 1]} s={[0.2, 0.8, 18]} c={baseboard} />
    ))}
  </group>
);

const WallWindow: React.FC<{ p: V3; r?: V3; night: boolean; w?: number; h?: number; trim?: string; curtains?: string }> = ({
  p,
  r,
  night,
  w = 4.4,
  h = 4.4,
  trim = '#F8FAFC',
  curtains,
}) => (
  <group position={p} rotation={r}>
    <Box s={[w + 0.5, h + 0.5, 0.2]} c={trim} />
    <Box p={[0, 0, 0.08]} s={[w, h, 0.1]} c={night ? '#0B1220' : '#7DD3FC'} e={night ? undefined : '#7DD3FC'} ei={0.35} rough={0.2} />
    {night && <Ball p={[w * 0.25, h * 0.25, 0.15]} rad={0.35} c="#F8FAFC" e="#F8FAFC" ei={1.2} />}
    {!night && <Box p={[-w * 0.2, -h * 0.15, 0.14]} s={[w * 0.5, h * 0.25, 0.02]} c="#BBF7D0" e="#86EFAC" ei={0.25} />}
    <Box p={[0, 0, 0.2]} s={[w, 0.18, 0.08]} c={trim} />
    <Box p={[0, 0, 0.2]} s={[0.18, h, 0.08]} c={trim} />
    {curtains &&
      [-1, 1].map((s) => <Box key={s} p={[s * (w / 2 + 0.3), 0.1, 0.3]} s={[1.1, h + 0.8, 0.2]} c={curtains} />)}
  </group>
);

const Picture: React.FC<{ p: V3; r?: V3; w?: number; h?: number; c: string; frame?: string }> = ({ p, r, w = 1.8, h = 1.4, c, frame = '#78350F' }) => (
  <group position={p} rotation={r}>
    <Box s={[w + 0.25, h + 0.25, 0.1]} c={frame} />
    <Box p={[0, 0, 0.06]} s={[w, h, 0.04]} c={c} />
    <Ball p={[w * 0.15, h * 0.1, 0.1]} rad={Math.min(w, h) * 0.18} c="#FDE68A" />
  </group>
);

const Plant: React.FC<{ p: V3; scale?: number }> = ({ p, scale = 1 }) => (
  <group position={p} scale={scale}>
    <Cyl p={[0, 0.6, 0]} rt={0.6} rb={0.45} h={1.2} c="#B45309" />
    <Ball p={[0, 1.9, 0]} rad={0.9} c="#16A34A" />
    <Ball p={[0.5, 2.5, 0.2]} rad={0.6} c="#22C55E" />
    <Ball p={[-0.5, 2.4, -0.1]} rad={0.6} c="#15803D" />
  </group>
);

const Chair: React.FC<{ p: V3; r?: V3; c?: string; leg?: string }> = ({ p, r, c = '#B45309', leg = '#78350F' }) => {
  const wood = woodGrainTex(c, 1, 1);
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 1.5, 0]} s={[1.6, 0.2, 1.6]} c={c} map={wood} rough={0.45} />
      <Box p={[0, 2.5, -0.72]} s={[1.6, 1.8, 0.16]} c={c} map={wood} rough={0.45} />
      {[
        [-0.65, -0.65],
        [0.65, -0.65],
        [-0.65, 0.65],
        [0.65, 0.65],
      ].map(([x, z], i) => (
        <Box key={i} p={[x, 0.7, z]} s={[0.16, 1.4, 0.16]} c={leg} rough={0.5} />
      ))}
    </group>
  );
};

const Table: React.FC<{ p: V3; w: number; d: number; h?: number; c?: string; leg?: string; marble?: boolean }> = ({
  p,
  w,
  d,
  h = 2.4,
  c = '#92400E',
  leg,
  marble = false,
}) => {
  const topMap = marble ? counterMarbleTex('#F8FAFC', '#94A3B8', 2, 2) : woodGrainTex(c, 2, 2);
  const legMap = woodGrainTex(leg ?? c, 1, 2);
  return (
    <group position={p}>
      <Box p={[0, h, 0]} s={[w, 0.25, d]} c={c} map={topMap} rough={marble ? 0.2 : 0.45} metal={marble ? 0.08 : 0} shadow />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Box key={i} p={[sx * (w / 2 - 0.25), h / 2, sz * (d / 2 - 0.25)]} s={[0.22, h, 0.22]} c={leg ?? c} map={legMap} rough={0.5} />
      ))}
    </group>
  );
};

const Bookshelf: React.FC<{ p: V3; r?: V3; c?: string }> = ({ p, r, c = '#78350F' }) => {
  const wood = woodGrainTex(c, 2, 3);
  const books = ['#DC2626', '#2563EB', '#16A34A', '#FACC15', '#7C3AED', '#F97316', '#0EA5E9'];
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 3.5, 0]} s={[4, 7, 1.4]} c={c} map={wood} rough={0.5} shadow />
      {[1.2, 3.0, 4.8].map((y, row) => (
        <React.Fragment key={y}>
          <Box p={[0, y + 1.3, 0.25]} s={[3.6, 0.15, 1.0]} c={new THREE.Color(c).multiplyScalar(0.8).getStyle()} />
          {books.map((bc, i) => (
            <Box key={i} p={[-1.5 + i * 0.48, y + 0.55 + ((i + row) % 3) * 0.06, 0.35]} s={[0.36, 1.1 + ((i + row) % 3) * 0.12, 0.8]} c={books[(i + row * 2) % books.length]} />
          ))}
        </React.Fragment>
      ))}
    </group>
  );
};

const WallClock: React.FC<{ p: V3; t: number }> = ({ p, t }) => (
  <group position={p}>
    <Cyl r={[Math.PI / 2, 0, 0]} rt={0.9} h={0.15} c="#1F2937" />
    <Cyl r={[Math.PI / 2, 0, 0]} p={[0, 0, 0.06]} rt={0.78} h={0.06} c="#F8FAFC" />
    <Box p={[0, 0, 0.12]} r={[0, 0, -t * 0.05]} s={[0.08, 0.6, 0.03]} c="#111827" />
    <Box p={[0, 0, 0.13]} r={[0, 0, -t * 0.6]} s={[0.06, 0.8, 0.03]} c="#DC2626" />
  </group>
);

const CeilingLamp: React.FC<{ p: V3; night: boolean; c?: string }> = ({ p, night, c = '#FDE68A' }) => (
  <group position={p}>
    <Box p={[0, 1.2, 0]} s={[0.06, 2.4, 0.06]} c="#1F2937" />
    <mesh position={[0, 0, 0]}>
      <coneGeometry args={[1.0, 0.9, 16, 1, true]} />
      <meshStandardMaterial color="#1F2937" side={THREE.DoubleSide} />
    </mesh>
    <Ball p={[0, -0.3, 0]} rad={0.32} c="#FEF9C3" e={c} ei={night ? 2.5 : 0.6} />
  </group>
);

// ---------------------------------------------------------------------------
// CLASSROOM
// ---------------------------------------------------------------------------

const DEFAULT_BOARD = ['WELCOME TO CLASS!', 'RULE #1: BE ON TIME', 'HOMEWORK: PAGE 42'];

export const ClassroomEnvironment: React.FC<{ night?: boolean; boardText?: string[] }> = ({ night = false, boardText = DEFAULT_BOARD }) => {
  const t = useCurrentFrame() / 30;
  const colors = ['#F8FAFC', '#FDE047', '#BAE6FD', '#F8FAFC'];
  const board = textTex(
    boardText.slice(0, 4).map((text, i) => ({ text, color: colors[i % colors.length], size: boardText.length > 3 ? 70 : 84 })),
    { w: 1400, h: 640, bg: '#14532D', border: '#92400E', borderWidth: 30 }
  );
  const poster1 = textTex([{ text: 'READ!', color: '#FFFFFF', size: 160 }], { w: 512, h: 640, bg: '#7C3AED' });
  const poster2 = textTex([{ text: '2+2=4', color: '#111827', size: 130 }], { w: 512, h: 640, bg: '#FDE047' });
  const wallMap = wallPlasterTex('#FEF3C7', 8, 6);
  const deskWood = woodGrainTex('#D97706', 2, 2);
  const teacherDeskWood = woodGrainTex('#78350F', 2, 2);
  return (
    <group>
      <RoomShell wall="#FEF3C7" wallMap={wallMap} floorMap={tileTex('#E2E8F0', '#94A3B8', 24, 16)} sideWall="#FDE68A" />
      {/* chalkboard */}
      <Panel p={[0, 6.6, -7.95]} w={14} h={6.4} map={board} />
      <Box p={[0, 3.25, -7.6]} s={[13, 0.2, 0.6]} c="#92400E" />
      <Box p={[-4, 3.42, -7.5]} s={[0.6, 0.15, 0.25]} c="#F8FAFC" />
      <WallClock p={[0, 11.4, -7.95]} t={t} />
      <Panel p={[-10, 7, -7.95]} w={2.6} h={3.2} map={poster1} />
      <Panel p={[10, 7, -7.95]} w={2.6} h={3.2} map={poster2} />
      {/* windows on the left wall */}
      {[-4, 3].map((z) => (
        <WallWindow key={z} p={[-12.95, 6.5, z]} r={[0, Math.PI / 2, 0]} night={night} w={4.6} h={5} />
      ))}
      {/* door on the right wall */}
      <Door p={[12.95, 0, -3]} r={[0, -Math.PI / 2, 0]} color="#B45309" w={3} h={6.5} glassTop />
      {/* teacher desk + chair + globe + apple */}
      <group position={[-5.5, 0, -4.4]}>
        <Box p={[0, 1.6, 0]} s={[5, 3.2, 2.4]} c="#92400E" map={teacherDeskWood} shadow />
        <Box p={[0, 3.3, 0]} s={[5.3, 0.2, 2.7]} c="#78350F" map={teacherDeskWood} />
        <Ball p={[1.6, 3.75, 0.3]} rad={0.38} c="#EF4444" rough={0.3} />
        <Cyl p={[-1.4, 3.6, 0]} rt={0.12} h={0.5} c="#78350F" />
        <Ball p={[-1.4, 4.4, 0]} rad={0.6} c="#2563EB" />
        <Box p={[0, 3.5, -0.2]} s={[1.6, 0.25, 1.1]} c="#F8FAFC" />
      </group>
      {/* student desks with an aisle at x ∈ [−3, 3] */}
      {[-9.5, -5.5, 5.5, 9.5].flatMap((x) =>
        [0.5, 4.5].map((z) => (
          <group key={`${x}:${z}`} position={[x, 0, z]}>
            <Box p={[0, 2.2, 0]} s={[3.0, 0.25, 2.0]} c="#D97706" map={deskWood} shadow />
            <Box p={[0, 1.4, 0.1]} s={[2.6, 0.8, 1.6]} c="#475569" metal={0.3} />
            {[-1.2, 1.2].map((lx) => (
              <Box key={lx} p={[lx, 1.0, -0.6]} s={[0.15, 2.0, 0.15]} c="#475569" metal={0.4} />
            ))}
            <Chair p={[0, 0, 1.8]} r={[0, Math.PI, 0]} c="#2563EB" leg="#475569" />
            <Box p={[0.5, 2.4, -0.2]} s={[1.0, 0.12, 0.8]} c={x > 0 ? '#F8FAFC' : '#FDE68A'} />
          </group>
        ))
      )}
      <Bookshelf p={[10.5, 0, -7]} c="#92400E" />
      <Plant p={[-11.6, 0, -6.6]} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// SCHOOL HALLWAY
// ---------------------------------------------------------------------------

export const HallwayEnvironment: React.FC<{ night?: boolean }> = ({ night = false }) => {
  const banner = textTex([{ text: 'GO TOWN TIGERS!', color: '#FACC15', size: 120 }], { w: 1400, h: 220, bg: '#1E3A8A', border: '#FACC15', borderWidth: 14 });
  const board = textTex(
    [
      { text: 'NEWS', color: '#DC2626', size: 90 },
      { text: 'TALENT SHOW FRIDAY', color: '#111827', size: 46 },
      { text: 'LOST: RED BACKPACK', color: '#111827', size: 46 },
    ],
    { w: 800, h: 560, bg: '#D6A35C', border: '#78350F', borderWidth: 26 }
  );
  const exit = textTex([{ text: 'EXIT', color: '#FFFFFF', size: 150 }], { w: 512, h: 220, bg: '#DC2626' });
  const lockerColors = ['#2563EB', '#1D4ED8'];
  const wallMap = wallSubwayTileTex('#E0F2FE', '#93C5FD', 10, 6);
  return (
    <group>
      <RoomShell wall="#E0F2FE" wallMap={wallMap} floorMap={tileTex('#F1F5F9', '#CBD5E1', 30, 20)} baseboard="#1E3A8A" height={13} />
      {/* checkered floor accent */}
      <Box p={[0, 0.02, 0]} s={[26, 0.02, 3]} c="#1E3A8A" receive />
      {/* lockers along the back wall, split by a classroom door */}
      {Array.from({ length: 16 }, (_, i) => -12.4 + i * 1.55)
        .filter((x) => x < -2.4 || x > 2.4)
        .map((x, i) => (
          <group key={x} position={[x, 0, -7.4]}>
            <Box p={[0, 3.6, 0]} s={[1.5, 7.2, 1.2]} c={lockerColors[i % 2]} rough={0.35} metal={0.3} shadow />
            {[6.2, 5.9, 5.6].map((y) => (
              <Box key={y} p={[0, y, 0.61]} s={[0.9, 0.08, 0.04]} c="#0F172A" />
            ))}
            <Box p={[0.5, 3.8, 0.62]} s={[0.14, 0.6, 0.06]} c="#CBD5E1" metal={0.6} />
            <Box p={[0, 7.25, 0.05]} s={[1.5, 0.12, 1.3]} c="#1E3A8A" />
          </group>
        ))}
      <Door p={[0, 0, -7.95]} color="#B45309" w={3.4} h={6.6} glassTop />
      <Panel p={[0, 7.4, -7.95]} w={2.6} h={0.8} map={textTex([{ text: 'ROOM 101', color: '#FFFFFF', size: 120 }], { w: 640, h: 200, bg: '#334155' })} />
      <Panel p={[0, 10.4, -7.95]} w={14} h={2.2} map={banner} />
      {/* bulletin board + fountain + trophy case on the side walls */}
      <Panel p={[-12.95, 5.4, 2]} r={[0, Math.PI / 2, 0]} w={5} h={3.5} map={board} />
      <group position={[-12.6, 0, -3]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 2.4, 0.4]} s={[1.6, 0.8, 1.0]} c="#CBD5E1" metal={0.6} rough={0.3} />
        <Box p={[0, 1.2, 0.2]} s={[0.4, 2.0, 0.4]} c="#94A3B8" metal={0.5} />
      </group>
      <group position={[12.4, 0, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <Box p={[0, 3.5, 0]} s={[5, 7, 1.2]} c="#78350F" />
        <Box p={[0, 4.2, 0.62]} s={[4.4, 5, 0.05]} c="#BAE6FD" opacity={0.35} rough={0.05} />
        {[-1.4, 0, 1.4].map((x, i) => (
          <group key={x} position={[x, 2.6 + (i % 2) * 2.4, 0]}>
            <Cyl p={[0, 0.3, 0]} rt={0.25} rb={0.35} h={0.6} c="#FACC15" metal={0.8} rough={0.2} />
            <Ball p={[0, 0.9, 0]} rad={0.35} c="#FACC15" />
          </group>
        ))}
      </group>
      <group position={[12.95, 0, -4.5]} rotation={[0, -Math.PI / 2, 0]}>
        <Door p={[0, 0, 0]} color="#64748B" w={3} h={6.5} />
        <Panel p={[0, 7.2, 0.1]} w={1.8} h={0.8} map={exit} glow={0.5} />
      </group>
      {/* ceiling lights strip glow */}
      {[-8, 0, 8].map((x) => (
        <Box key={x} p={[x, 12.8, -2]} s={[4, 0.15, 1.2]} c="#F8FAFC" e="#F8FAFC" ei={night ? 1.5 : 0.6} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// LIVING ROOM
// ---------------------------------------------------------------------------

const GrandfatherClock: React.FC<{ p: V3; t: number; creepy?: boolean }> = ({ p, t, creepy = true }) => {
  const swing = Math.sin(t * 4.2) * 0.28;
  const eyeTwitch = Math.sin(t * 14.0) > 0.82 ? 0.09 : 0;
  return (
    <group position={p}>
      {/* Dedicated spotlight on the clock so it's vivid in the dark room */}
      <pointLight position={[0, 6.0, 2.5]} intensity={24} distance={16} color="#FFFBEB" />
      {/* Clock dark mahogany wood cabinet */}
      <Box p={[0, 4.2, 0]} s={[2.4, 8.4, 1.6]} c="#3B1705" shadow />
      <Box p={[0, 8.6, 0]} s={[2.8, 1.6, 1.8]} c="#2E1003" />
      {/* Glass door display */}
      <Box p={[0, 3.8, 0.74]} s={[1.7, 5.2, 0.08]} c="#BAE6FD" opacity={0.35} rough={0.05} />
      {/* Swinging Human Tongue Pendulum */}
      <group position={[0, 6.0, 0.2]} rotation={[0, 0, swing]}>
        <Box p={[0, -1.8, 0]} s={[0.08, 3.6, 0.08]} c="#78350F" />
        {/* Fleshy red/pink tongue shape with emissive glow */}
        <group position={[0, -3.6, 0]}>
          <Box p={[0, 0, 0]} s={[0.62, 1.25, 0.26]} c="#E11D48" e="#BE123C" ei={0.7} />
          <Box p={[0, -0.52, 0]} s={[0.54, 0.46, 0.24]} c="#BE123C" e="#9F1239" ei={0.7} />
          <Box p={[0, 0.14, 0.12]} s={[0.08, 0.95, 0.06]} c="#881337" />
        </group>
      </group>
      {/* Ornate Clock Dial Face */}
      <group position={[0, 8.6, 0.84]}>
        <Cyl r={[Math.PI / 2, 0, 0]} rt={0.94} h={0.12} c="#FEF08A" e="#FEF08A" ei={0.6} />
        {/* Clock markings */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
          <Box key={i} p={[Math.sin(a) * 0.7, Math.cos(a) * 0.7, 0.07]} s={[0.07, 0.2, 0.02]} c="#1C1917" />
        ))}
        {/* Ticking clock hands */}
        <Box p={[0, 0.28, 0.08]} r={[0, 0, -t * 0.12]} s={[0.07, 0.58, 0.02]} c="#1C1917" />
        <Box p={[0, 0.38, 0.09]} r={[0, 0, -t * 0.9]} s={[0.05, 0.78, 0.02]} c="#DC2626" />
        {/* Bloodshot Human Eyes twitching behind dial with piercing glow */}
        {creepy && (
          <group position={[0, 0.04, -0.04]}>
            {[-0.34, 0.34].map((ex, i) => (
              <group key={i} position={[ex, eyeTwitch, 0]}>
                <Ball p={[0, 0, 0]} rad={0.26} c="#FFF1F2" e="#EF4444" ei={0.4} />
                {/* Red veins */}
                <Box p={[0, 0, 0.21]} s={[0.34, 0.04, 0.02]} c="#EF4444" />
                <Box p={[0, 0, 0.21]} s={[0.04, 0.34, 0.02]} c="#EF4444" />
                {/* Bloodshot black pupil with eerie red center */}
                <Ball p={[0, 0, 0.19]} rad={0.13} c="#991B1B" e="#DC2626" ei={1.4} />
                <Ball p={[0, 0, 0.23]} rad={0.06} c="#000000" />
              </group>
            ))}
          </group>
        )}
      </group>
    </group>
  );
};

const ChimneyFireplace: React.FC<{ p: V3; night?: boolean }> = ({ p, night = false }) => (
  <group position={p}>
    <Box p={[0, 3.6, 0]} s={[4.8, 7.2, 2.0]} c="#7F1D1D" shadow />
    <Box p={[0, 7.3, 0.1]} s={[5.4, 0.4, 2.4]} c="#3B1705" />
    {/* Dark chimney flue / hearth cavity */}
    <Box p={[0, 2.0, 0.4]} s={[3.0, 3.8, 1.6]} c="#050505" />
    {/* Red warning ember glow */}
    <Box p={[0, 0.3, 0.4]} s={[2.2, 0.4, 1.0]} c="#DC2626" e="#EF4444" ei={night ? 2.0 : 1.0} />
    <pointLight position={[0, 2.5, 2.0]} intensity={night ? 26 : 12} color="#DC2626" distance={22} />
  </group>
);

export const LivingRoomEnvironment: React.FC<{ variant?: HouseVariant; night?: boolean }> = ({ variant = 'blue', night = false }) => {
  const pal = HOME_PALETTES[variant];
  const frame = useCurrentFrame();
  const tvGlow = 0.6 + 0.25 * Math.sin(frame * 0.7);
  const wallMap = wallPaperTex(pal.wall, pal.accent, 8, 5);
  return (
    <group>
      <RoomShell wall={pal.wall} wallMap={wallMap} floorMap={plankTex(pal.floor, 10, 7)} />
      {night && <pointLight position={[0, 9, 0]} intensity={18} distance={30} color="#FFE7B0" />}
      {/* sofa against back wall, facing camera */}
      <group position={[0, 0, -5.6]}>
        <Box p={[0, 1.0, 0.2]} s={[9, 1.4, 3.4]} c={pal.sofa} shadow />
        <Box p={[0, 2.6, -1.2]} s={[9, 2.4, 1.0]} c={pal.sofa} />
        {[-1, 1].map((s) => (
          <Box key={s} p={[s * 4.8, 1.8, 0.2]} s={[0.9, 2.2, 3.4]} c={pal.sofa} />
        ))}
        {[-2.1, 2.1].map((x) => (
          <Box key={x} p={[x, 1.85, 0.5]} s={[4, 0.5, 2.6]} c={new THREE.Color(pal.sofa).multiplyScalar(1.15).getStyle()} />
        ))}
        <Box p={[-3, 2.8, -0.4]} r={[-0.25, 0, 0.15]} s={[1.3, 1.3, 0.4]} c={pal.rug} />
        <Box p={[3, 2.8, -0.4]} r={[-0.25, 0, -0.15]} s={[1.3, 1.3, 0.4]} c="#F8FAFC" />
      </group>
      {/* windows + pictures on back wall */}
      <WallWindow p={[-8.4, 6.2, -7.95]} night={night} curtains={pal.accent} w={3.6} h={4.4} />
      <WallWindow p={[8.4, 6.2, -7.95]} night={night} curtains={pal.accent} w={3.6} h={4.4} />
      <Picture p={[-2, 6.6, -7.95]} c="#38BDF8" />
      <Picture p={[1.4, 7.2, -7.95]} w={2.2} h={1.6} c="#86EFAC" />
      {/* Grandfather Clock with Tongue Pendulum & Twitching Eyes */}
      <GrandfatherClock p={[-5.0, 0, -7.0]} t={frame / 30} creepy />
      {/* Brick Fireplace with Chimney Flue */}
      <ChimneyFireplace p={[5.0, 0, -7.0]} night={night} />
      {/* rug + coffee table */}
      <Box p={[0, 0.05, -0.6]} s={[11, 0.1, 6]} c={pal.rug} />
      <Box p={[0, 0.06, -0.6]} s={[10, 0.1, 5]} c={new THREE.Color(pal.rug).multiplyScalar(1.2).getStyle()} />
      <Table p={[0, 0, -1.4]} w={4.2} d={2} h={1.2} c="#78350F" />
      <Cyl p={[0.8, 1.6, -1.4]} rt={0.25} h={0.6} c="#F8FAFC" />
      {/* TV on the left wall */}
      <group position={[-12.3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 1.0, 0.3]} s={[6, 2, 1.6]} c="#1F2937" shadow />
        <Box p={[0, 4.4, 0]} s={[5.6, 3.2, 0.25]} c="#0F172A" />
        <Box p={[0, 4.4, 0.14]} s={[5.2, 2.8, 0.02]} c="#38BDF8" e="#0EA5E9" ei={tvGlow} />
      </group>
      {/* armchair right + lamp + plant + bookshelf */}
      <group position={[9.4, 0, -1.6]} rotation={[0, -0.6, 0]}>
        <Box p={[0, 1.0, 0]} s={[3.2, 1.4, 3]} c={pal.accent} shadow />
        <Box p={[0, 2.5, -1.2]} s={[3.2, 2.2, 0.7]} c={pal.accent} />
      </group>
      <group position={[11.2, 0, -6.4]}>
        <Cyl p={[0, 3, 0]} rt={0.08} h={6} c="#1F2937" />
        <mesh position={[0, 6.2, 0]}>
          <cylinderGeometry args={[0.6, 1.0, 1.2, 16, 1, true]} />
          <meshStandardMaterial color="#FEF3C7" emissive="#FDE68A" emissiveIntensity={night ? 1.4 : 0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Plant p={[-11.4, 0, -6.6]} scale={1.2} />
      <Bookshelf p={[12.3, 0, 5]} r={[0, -Math.PI / 2, 0]} />
      <Door p={[12.95, 0, -2.5]} r={[0, -Math.PI / 2, 0]} color="#92400E" w={3} h={6.5} />
      <CeilingLamp p={[0, 11, -1]} night={night} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// ROCKING CHAIR
// ---------------------------------------------------------------------------

export const RockingChair: React.FC<{
  p: V3;
  r?: V3;
  c?: string;
  rocking?: boolean;
}> = ({ p, r, c = '#78350F', rocking = true }) => {
  const frame = useCurrentFrame();
  const wood = woodGrainTex(c, 2, 2);
  const rockAngle = rocking ? Math.sin(frame * 0.08) * 0.03 : 0;

  return (
    <group position={p} rotation={r}>
      <group rotation={[rockAngle, 0, 0]}>
        {/* Curved rocker runners on the floor (left & right) */}
        {[-1.0, 1.0].map((sx, i) => (
          <group key={i} position={[sx, 0.22, 0]}>
            {/* Rocker runner rail */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[0.08, 0.08, 3.2, 12]} />
              <meshStandardMaterial map={wood} roughness={0.45} />
            </mesh>
            {/* Upturned front and back rocker tips */}
            <mesh position={[0, 0.12, 1.5]} rotation={[0.45, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 0.16, 0.4]} />
              <meshStandardMaterial map={wood} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.12, -1.5]} rotation={[-0.45, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 0.16, 0.4]} />
              <meshStandardMaterial map={wood} roughness={0.45} />
            </mesh>
          </group>
        ))}

        {/* 4 turned spindle legs connecting runners to seat */}
        {[
          [-0.85, 0.95, -0.8],
          [0.85, 0.95, -0.8],
          [-0.85, 0.95, 0.8],
          [0.85, 0.95, 0.8],
        ].map(([lx, ly, lz], i) => (
          <Cyl key={i} p={[lx, ly, lz]} rt={0.07} rb={0.09} h={1.5} c={c} />
        ))}

        {/* Contoured wooden seat slab */}
        <Box p={[0, 1.72, 0]} s={[2.2, 0.22, 2.0]} c={c} map={wood} rough={0.4} shadow />

        {/* Curved armrests */}
        {[-1.05, 1.05].map((ax, i) => (
          <group key={i}>
            <Box p={[ax, 2.65, 0.1]} s={[0.22, 0.12, 1.9]} c={c} map={wood} rough={0.4} />
            <Cyl p={[ax, 2.18, 0.8]} rt={0.06} h={0.9} c={c} />
          </group>
        ))}

        {/* Tall Windsor spindle backrest with high curved headrail */}
        <group position={[0, 1.82, -0.85]} rotation={[-0.14, 0, 0]}>
          <Box p={[0, 2.3, 0]} s={[2.3, 0.28, 0.2]} c={c} map={wood} rough={0.4} shadow />
          {[-0.8, -0.48, -0.16, 0.16, 0.48, 0.8].map((sx, i) => (
            <Cyl key={i} p={[sx, 1.15, 0]} rt={0.045} rb={0.055} h={2.2} c={c} />
          ))}
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// KITCHEN
// ---------------------------------------------------------------------------

export const KitchenEnvironment: React.FC<{ variant?: HouseVariant; night?: boolean }> = ({ variant = 'blue', night = false }) => {
  const pal = HOME_PALETTES[variant];
  const frame = useCurrentFrame();
  const cabinet = '#F8FAFC';
  const counterTop = '#334155';
  const subwayMap = wallSubwayTileTex(pal.wall, '#94A3B8', 12, 6);
  const graniteMap = counterGraniteTex('#1E293B', '#64748B', 8, 2);
  const cabinetWood = woodGrainTex(cabinet, 2, 2);
  return (
    <group>
      <RoomShell wall={pal.wall} wallMap={subwayMap} floorMap={tileTex('#F8FAFC', '#CBD5E1', 20, 14)} />
      {night && <pointLight position={[0, 9, 0]} intensity={18} distance={30} color="#FFE7B0" />}
      {/* Front Entrance Door on Left Wall (burst open when kicked) */}
      <group position={[-12.8, 0, 1.0]}>
        {/* Door frame trim */}
        <Box p={[0, 4.0, 0]} s={[0.4, 8.0, 4.4]} c="#451A03" />
        {/* Open doorway dark opening / entrance hall behind */}
        <Box p={[-0.35, 3.8, 0]} s={[0.2, 7.6, 3.8]} c="#0F172A" />
        {/* Swung-open heavy front door (kicked open inward into kitchen) */}
        <group position={[0.4, 0, -1.8]} rotation={[0, 1.25, 0]}>
          <Door p={[0, 0, 0]} r={[0, Math.PI / 2, 0]} color="#78350F" trim="#451A03" w={3.6} h={7.6} />
        </group>
      </group>
      {/* Grandpa's Authentic Rocking Chair */}
      <RockingChair p={[5.4, 0, 1.2]} r={[0, -0.4, 0]} c="#78350F" />
      {/* Burned pan clattered on floor right in front of the rocking chair */}
      <group position={[3.8, 0.08, 1.2]} rotation={[0.08, 0.45, 0.15]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.6, 0.16, 20]} />
          <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.95, 0.04, 0]} rotation={[0, 0, 0.12]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.18]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.04, 16]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.95} />
        </mesh>
      </group>
      {/* checker floor accent */}
      {Array.from({ length: 12 }, (_, i) => i).map((i) => (
        <Box key={i} p={[-11 + i * 2, 0.015, -6.5 + (i % 2) * 2]} s={[2, 0.02, 2]} c={pal.accent} receive />
      ))}
      {/* base cabinets + countertop along back wall */}
      <Box p={[0, 1.6, -7.0]} s={[20, 3.2, 2]} c={cabinet} map={cabinetWood} shadow />
      <Box p={[0, 3.3, -6.9]} s={[20.4, 0.25, 2.3]} c={counterTop} map={graniteMap} rough={0.25} />
      {Array.from({ length: 8 }, (_, i) => -8.75 + i * 2.5).map((x) => (
        <React.Fragment key={x}>
          <Box p={[x, 1.6, -5.98]} s={[2.3, 2.8, 0.06]} c="#E2E8F0" map={cabinetWood} />
          <Box p={[x + 0.8, 2.4, -5.92]} s={[0.12, 0.6, 0.08]} c="#94A3B8" metal={0.6} />
        </React.Fragment>
      ))}
      {/* upper cabinets */}
      {[-8.5, -5.5, 5.5, 8.5].map((x) => (
        <Box key={x} p={[x, 8.6, -7.4]} s={[2.8, 2.8, 1.2]} c={cabinet} map={cabinetWood} shadow />
      ))}
      {/* sink under window */}
      <WallWindow p={[0, 7.0, -7.95]} night={night} w={5} h={3.4} curtains={pal.accent} />
      <Box p={[0, 3.33, -6.8]} s={[3, 0.1, 1.5]} c="#94A3B8" metal={0.7} rough={0.2} />
      <Box p={[0, 4.0, -7.5]} s={[0.2, 1.2, 0.2]} c="#CBD5E1" metal={0.8} />
      <Box p={[0, 4.6, -7.1]} s={[0.2, 0.2, 0.9]} c="#CBD5E1" metal={0.8} />
      {/* stove + oven + pot */}
      <group position={[5.5, 0, -7]}>
        <Box p={[0, 1.6, 0]} s={[3, 3.2, 2.1]} c="#E5E7EB" metal={0.3} />
        <Box p={[0, 1.4, 1.06]} s={[2.4, 1.8, 0.05]} c="#111827" />
        <Box p={[0, 3.3, 0.05]} s={[3, 0.2, 2.2]} c="#111827" />
        {[
          [-0.7, -0.4],
          [0.7, -0.4],
          [-0.7, 0.5],
          [0.7, 0.5],
        ].map(([x, z], i) => (
          <Cyl key={i} p={[x, 3.42, z]} rt={0.42} h={0.05} c="#374151" e={i === 0 ? '#EF4444' : undefined} ei={0.6} />
        ))}
        <Cyl p={[-0.7, 3.95, -0.4]} rt={0.6} h={1.0} c="#94A3B8" metal={0.8} rough={0.25} />
        <Ball p={[-0.7, 4.8 + ((frame * 0.05) % 1.5), -0.4]} rad={0.3 + ((frame * 0.05) % 1.5) * 0.2} c="#F8FAFC" />
        <Box p={[0, 8.6, -0.3]} s={[3.2, 1.2, 1.6]} c="#94A3B8" metal={0.6} />
      </group>
      {/* fridge */}
      <group position={[-11.2, 0, -6.6]}>
        <Box p={[0, 4.2, 0]} s={[3, 8.4, 2.6]} c="#E5E7EB" metal={0.4} rough={0.3} shadow />
        <Box p={[0, 5.6, 1.31]} s={[2.9, 0.06, 0.04]} c="#94A3B8" />
        <Box p={[1.1, 6.8, 1.36]} s={[0.15, 1.4, 0.12]} c="#94A3B8" metal={0.7} />
        <Box p={[1.1, 3.6, 1.36]} s={[0.15, 2.0, 0.12]} c="#94A3B8" metal={0.7} />
        <Box p={[-0.5, 6.6, 1.33]} s={[0.8, 0.9, 0.02]} c="#FDE047" />
        <Box p={[0.3, 4.2, 1.33]} s={[0.9, 0.7, 0.02]} c="#F472B6" />
      </group>
      {/* small dining table on the right */}
      <Table p={[8.4, 0, 2.4]} w={4.6} d={3.2} c="#B45309" />
      <Chair p={[8.4, 0, 4.6]} r={[0, Math.PI, 0]} c={pal.accent} />
      <Chair p={[11.0, 0, 2.4]} r={[0, -Math.PI / 2, 0]} c={pal.accent} />
      <Box p={[8, 2.8, 2.2]} s={[1.0, 0.1, 1.0]} c="#F8FAFC" />
      <Ball p={[9, 2.9, 2.6]} rad={0.3} c="#F97316" />
      <CeilingLamp p={[8.4, 9.6, 2.4]} night={night} />
      <WallClock p={[-6, 9.6, -7.95]} t={frame / 30} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// KID BEDROOM
// ---------------------------------------------------------------------------

export const BedroomEnvironment: React.FC<{ variant?: HouseVariant; night?: boolean }> = ({ variant = 'blue', night = false }) => {
  const pal = HOME_PALETTES[variant];
  const frame = useCurrentFrame();
  const wallMap = wallPlasterTex(pal.wall, 8, 6);
  const bedWood = woodGrainTex('#78350F', 2, 2);
  const wardrobeWood = woodGrainTex('#B45309', 2, 4);
  const poster = textTex([{ text: 'GAME ON', color: '#FFFFFF', size: 110 }], { w: 512, h: 640, bg: pal.accent });
  return (
    <group>
      <RoomShell wall={pal.wall} wallMap={wallMap} floorMap={plankTex(pal.floor, 10, 7)} />
      {night && <pointLight position={[-6, 6, -2]} intensity={10} distance={18} color="#FFD58A" />}
      <Box p={[-1, 0.06, 0]} s={[9, 0.12, 6]} c={pal.rug} />
      {/* bed: headboard against back wall, left side */}
      <group position={[-7, 0, -4.4]}>
        <Box p={[0, 0.8, 0]} s={[4.4, 1.6, 6.6]} c="#78350F" map={bedWood} shadow />
        <Box p={[0, 2.5, -3.0]} s={[4.4, 3.2, 0.6]} c="#78350F" map={bedWood} />
        <Box p={[0, 1.75, 0.1]} s={[4.0, 0.7, 6.0]} c="#F8FAFC" />
        <Box p={[0, 1.88, 0.9]} s={[4.1, 0.75, 4.2]} c={pal.blanket} shadow />
        <Box p={[0, 2.3, -2.0]} s={[2.8, 0.45, 1.4]} c="#FFFFFF" />
      </group>
      {/* nightstand + lamp */}
      <group position={[-11.4, 0, -6.4]}>
        <Box p={[0, 1.2, 0]} s={[2, 2.4, 2]} c="#92400E" map={bedWood} />
        <Cyl p={[0, 2.8, 0]} rt={0.12} h={0.8} c="#1F2937" />
        <Cyl p={[0, 3.5, 0]} rt={0.4} rb={0.7} h={0.8} c="#FEF3C7" e="#FDE68A" ei={night ? 1.8 : 0.2} />
      </group>
      {/* window */}
      <WallWindow p={[0.5, 6.6, -7.95]} night={night} curtains={pal.blanket} />
      {/* desk with computer + gaming chair */}
      <group position={[7.4, 0, -6.2]}>
        <Table p={[0, 0, 0]} w={5.2} d={2.6} h={2.6} c="#F8FAFC" leg="#94A3B8" />
        <Box p={[0, 4.3, -0.6]} s={[3.4, 2.1, 0.2]} c="#0F172A" />
        <Box p={[0, 4.3, -0.48]} s={[3.1, 1.8, 0.02]} c="#22C55E" e="#16A34A" ei={0.5 + 0.2 * Math.sin(frame * 0.3)} />
        <Box p={[0, 3.0, -0.6]} s={[0.3, 0.6, 0.3]} c="#0F172A" />
        <Box p={[0, 2.8, 0.4]} s={[2.2, 0.1, 0.7]} c="#1F2937" />
        <Box p={[2.0, 3.6, -0.6]} s={[0.8, 1.8, 1.4]} c="#111827" e="#7C3AED" ei={0.3} />
        <Chair p={[0, 0, 2.2]} r={[0, Math.PI + 0.3, 0]} c="#DC2626" leg="#111827" />
      </group>
      {/* wardrobe on right wall */}
      <group position={[12.0, 0, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <Box p={[0, 4.4, 0]} s={[5, 8.8, 1.8]} c="#B45309" map={wardrobeWood} shadow />
        <Box p={[0, 4.4, 0.92]} s={[0.08, 8.4, 0.04]} c="#78350F" />
        {[-0.4, 0.4].map((x) => (
          <Box key={x} p={[x, 4.4, 0.95]} s={[0.12, 0.8, 0.1]} c="#FACC15" />
        ))}
      </group>
      <Panel p={[-4.6, 7.4, -7.95]} w={2.4} h={3} map={poster} />
      <Picture p={[5.6, 8.4, -7.95]} c="#F472B6" w={1.6} h={1.6} />
      {/* toy shelf */}
      <Box p={[-12.6, 6.4, 1]} s={[0.8, 0.2, 4]} c="#92400E" />
      <Box p={[-12.5, 7.0, 0]} s={[0.6, 1.0, 0.6]} c="#EF4444" />
      <Ball p={[-12.5, 6.9, 1.6]} rad={0.45} c="#3B82F6" />
      <Box p={[-12.5, 7.1, 2.5]} s={[0.5, 1.2, 0.5]} c="#FACC15" />
    </group>
  );
};
