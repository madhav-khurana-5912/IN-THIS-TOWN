import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useCurrentFrame } from 'remotion';
import { HairSystem } from './HairSystem';
import { AnimationMode, ExpressionId, PropId } from '../types/schema';
import {
  CHARACTER_PRESETS,
  CharacterLook,
  normalizeAccessories,
  resolveColor,
  resolveHairColors,
  resolveSkin,
} from '../characters/look';
import { createJeansTexture, createSleeveTexture, createTopTexture, shade, sleeveColorFor } from '../characters/clothing';
import { FacialHairMesh, HeadAccessory } from '../characters/Accessories';

interface R6CharacterProps {
  /** Full look from the character constructor (see src/characters/look.ts). */
  look?: CharacterLook;
  position: [number, number, number];
  rotationY: number;
  rotationX?: number;
  rotationZ?: number;
  anim: AnimationMode;
  expression: ExpressionId;
  prop?: PropId;
  /** Whether the voiceover is currently vocalizing speech audio at this frame. */
  isSpeaking?: boolean;
}

interface FaceExtras {
  freckles?: boolean;
  blush?: boolean;
  stubble?: string;
  talking?: boolean;
}

function createFaceTexture(skinColor: string, expression: ExpressionId, extras: FaceExtras = {}): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.52;

  if (extras.stubble) {
    ctx.fillStyle = extras.stubble;
    ctx.globalAlpha = 0.45;
    let sd = 7;
    const rnd = () => {
      sd = (sd * 16807) % 2147483647;
      return (sd - 1) / 2147483646;
    };
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI;
      const r = Math.sqrt(rnd());
      const x = cx + Math.cos(a) * r * 190;
      const y = cy + 70 + Math.sin(a) * r * 150;
      if (Math.abs(x - cx) < 70 && y < cy + 110) continue; // keep the mouth clear
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
  if (extras.blush) {
    ctx.fillStyle = '#F472B6';
    ctx.globalAlpha = 0.32;
    ctx.beginPath();
    ctx.ellipse(cx - 118, cy + 22, 34, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 118, cy + 22, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (extras.freckles) {
    ctx.fillStyle = '#9A5B34';
    ctx.globalAlpha = 0.7;
    const dots = [[-128, 14], [-110, 26], [-96, 10], [-120, 36], [-90, 30], [128, 14], [110, 26], [96, 10], [120, 36], [90, 30]];
    for (const [dx, dy] of dots) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#141414';
  ctx.strokeStyle = '#141414';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (expression === 'sleeping') {
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx - 72, cy - 22, 30, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + 72, cy - 22, 30, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy + 52);
    ctx.lineTo(cx + 28, cy + 52);
    ctx.stroke();
  } else if (expression === 'shocked' || expression === 'panic') {
    // Expressive Roblox terror/shock face like ref_1_t25
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.ellipse(cx - 70, cy - 34, 34, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx + 70, cy - 34, 34, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Constricted pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(cx - 70, cy - 34, 11, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 70, cy - 34, 11, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised worried eyebrows
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(cx - 108, cy - 88);
    ctx.lineTo(cx - 38, cy - 102);
    ctx.moveTo(cx + 108, cy - 88);
    ctx.lineTo(cx + 38, cy - 102);
    ctx.stroke();

    if (!extras.talking) {
      // Clenched tense shock mouth when listening/silent
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(cx - 44, cy + 34, 88, 28, 8);
      ctx.fill();
      ctx.lineWidth = 11;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 48);
      ctx.lineTo(cx + 40, cy + 48);
      ctx.stroke();
    }
  } else if (expression === 'angry') {
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(cx - 105, cy - 84);
    ctx.lineTo(cx - 32, cy - 52);
    ctx.moveTo(cx + 105, cy - 84);
    ctx.lineTo(cx + 32, cy - 52);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 68, cy - 26, 20, 28, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 68, cy - 26, 20, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(cx, cy + 88, 52, 1.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();
  } else if (expression === 'cool') {
    // Worried/smirk face with expressive brows like ref_5_t2
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(cx - 102, cy - 78);
    ctx.lineTo(cx - 40, cy - 92);
    ctx.moveTo(cx + 102, cy - 78);
    ctx.lineTo(cx + 40, cy - 92);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 66, cy - 32, 20, 28, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 66, cy - 32, 20, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.roundRect(cx - 64, cy + 24, 128, 54, 22);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 51);
    ctx.lineTo(cx + 60, cy + 51);
    ctx.stroke();
  } else if (expression === 'laugh') {
    // Happy curved-eye laugh like ref_5_t20
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx - 66, cy - 24, 28, 1.1 * Math.PI, 1.9 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 66, cy - 24, 28, 1.1 * Math.PI, 1.9 * Math.PI, false);
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 68, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - 58, cy + 20, 116, 20);
  } else if (expression === 'deadpan') {
    // Tired/unimpressed eyes like ref_3_t2 & ref_4_t2
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx - 100, cy - 42);
    ctx.lineTo(cx - 34, cy - 42);
    ctx.moveTo(cx + 34, cy - 42);
    ctx.lineTo(cx + 100, cy - 42);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 66, cy - 22, 16, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 66, cy - 22, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 52, cy + 48);
    ctx.lineTo(cx + 52, cy + 48);
    ctx.stroke();
  } else if (expression === 'sad') {
    // Sad downturned eyebrows and mouth with tear
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx - 96, cy - 68);
    ctx.lineTo(cx - 38, cy - 84);
    ctx.moveTo(cx + 96, cy - 68);
    ctx.lineTo(cx + 38, cy - 84);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 66, cy - 32, 18, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 66, cy - 32, 18, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy + 72, 54, 1.18 * Math.PI, 1.82 * Math.PI, false);
    ctx.stroke();

    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(cx - 42, cy + 12, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (expression === 'forced_smile') {
    // Horrifying forced toothy grimace with trembling blood drops down chin
    ctx.lineWidth = 13;
    // Strained high curved brows
    ctx.beginPath();
    ctx.arc(cx - 68, cy - 64, 30, 1.25 * Math.PI, 1.85 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 68, cy - 64, 30, 1.15 * Math.PI, 1.75 * Math.PI, false);
    ctx.stroke();

    // Wide bulging terrified eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx - 68, cy - 30, 26, 32, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 68, cy - 30, 26, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Constricted shaking pupils
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx - 68, cy - 30, 8, 0, Math.PI * 2);
    ctx.arc(cx + 68, cy - 30, 8, 0, Math.PI * 2);
    ctx.fill();

    // Strained wide toothy grimace
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - 86, cy + 24, 172, 56, 16);
    ctx.fill();
    ctx.lineWidth = 13;
    ctx.stroke();

    // Gritted teeth vertical lines
    ctx.lineWidth = 4;
    for (let tx = -60; tx <= 60; tx += 20) {
      ctx.beginPath();
      ctx.moveTo(cx + tx, cy + 26);
      ctx.lineTo(cx + tx, cy + 78);
      ctx.stroke();
    }
    // Center horizontal bite line
    ctx.beginPath();
    ctx.moveTo(cx - 82, cy + 52);
    ctx.lineTo(cx + 82, cy + 52);
    ctx.stroke();

    // Red blood trickling down from both mouth corners
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(cx - 92, cy + 50, 10, 42, 4);
    ctx.roundRect(cx + 82, cy + 50, 10, 46, 4);
    ctx.fill();
  } else if (expression === 'bloody_smile') {
    // Permanent Glasgow carved bloody smile with hollow void eyes
    ctx.lineWidth = 15;
    // Hollow black eyes
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(cx - 68, cy - 32, 28, 38, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 68, cy - 32, 28, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny glowing white/red pinpricks
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(cx - 68, cy - 32, 5, 0, Math.PI * 2);
    ctx.arc(cx + 68, cy - 32, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wide sliced bloody grin curving high up cheeks
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 108, 0.18 * Math.PI, 0.82 * Math.PI, false);
    ctx.stroke();

    // Sliced vertical stitches/cuts
    for (let cxOffset = -85; cxOffset <= 85; cxOffset += 24) {
      const yOffset = cy + 58 + Math.abs(cxOffset) * 0.18;
      ctx.beginPath();
      ctx.moveTo(cx + cxOffset, yOffset - 14);
      ctx.lineTo(cx + cxOffset, yOffset + 14);
      ctx.stroke();
    }
    ctx.strokeStyle = '#141414';
  } else if (expression === 'watcher_face') {
    // Featureless pitch-black face with two piercing glowing red slit eyes
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#DC2626';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(cx - 65, cy - 20, 24, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 65, cy - 20, 24, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Classic warm Roblox smile with eyebrows
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx - 66, cy - 58, 32, 1.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 66, cy - 58, 32, 1.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 66, cy - 30, 17, 27, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 66, cy - 30, 17, 27, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 78, 0.22 * Math.PI, 0.78 * Math.PI, false);
    ctx.stroke();
  }

  if (extras.talking && expression !== 'sleeping') {
    // Clear expression mouth region
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 85, cy + 10, 170, 110);

    // Open animated mouth showing teeth and interior
    ctx.fillStyle = '#111111';
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 50, 42, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White upper teeth bar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - 30, cy + 24, 60, 16, 4);
    ctx.fill();

    // Tongue hint
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 62, 22, 12, 0, 0, Math.PI);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function applyBoxUVs(mesh: THREE.Mesh | null, sx: number, sy: number, sz: number) {
  if (!mesh || !mesh.geometry) return;
  const geo = mesh.geometry;
  if (geo.userData.boxUvApplied) return;
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const uv = geo.attributes.uv;
  if (!pos || !norm || !uv) return;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nx = Math.abs(norm.getX(i));
    const ny = Math.abs(norm.getY(i));
    const nz = Math.abs(norm.getZ(i));
    if (nz >= nx && nz >= ny) {
      uv.setXY(i, x / sx + 0.5, y / sy + 0.5);
    } else if (nx >= ny) {
      uv.setXY(i, z / sz + 0.5, y / sy + 0.5);
    } else {
      uv.setXY(i, x / sx + 0.5, z / sz + 0.5);
    }
  }
  uv.needsUpdate = true;
  geo.userData.boxUvApplied = true;
}

function createWordCounterTexture(prop: PropId): THREE.CanvasTexture | null {
  const configs: Partial<Record<PropId, { label: string; sub?: string; border: string; glow: string; textCol: string }>> = {
    counter_high: { label: '912,450', sub: 'WORDS LEFT', border: '#38BDF8', glow: '#0284C7', textCol: '#F8FAFC' },
    counter_mid: { label: '42,810', sub: 'WORDS LEFT', border: '#4ADE80', glow: '#16A34A', textCol: '#F8FAFC' },
    counter_bully: { label: '614,200', sub: 'WORDS LEFT', border: '#C084FC', glow: '#9333EA', textCol: '#F8FAFC' },
    mouth_tape: { label: '912,450', sub: 'WORDS LEFT', border: '#38BDF8', glow: '#0284C7', textCol: '#F8FAFC' },
    counter_3: { label: '3', sub: 'WORDS LEFT', border: '#F59E0B', glow: '#D97706', textCol: '#FDE047' },
    counter_2: { label: '2', sub: 'WORDS LEFT!', border: '#F97316', glow: '#EA580C', textCol: '#FFEDD5' },
    counter_1: { label: '1', sub: 'WORD LEFT!', border: '#EF4444', glow: '#DC2626', textCol: '#FEE2E2' },
    counter_0: { label: '0', sub: 'SILENT FOREVER', border: '#FACC15', glow: '#EAB308', textCol: '#FEF08A' },
    counter_100: { label: '100', sub: 'WORDS LEFT', border: '#38BDF8', glow: '#0284C7', textCol: '#F8FAFC' },
    counter_99: { label: '99', sub: 'WORDS LEFT', border: '#38BDF8', glow: '#0284C7', textCol: '#F8FAFC' },
    counter_98: { label: '98', sub: 'WORDS LEFT', border: '#4ADE80', glow: '#16A34A', textCol: '#F8FAFC' },
    counter_50: { label: '50', sub: 'WORDS LEFT', border: '#C084FC', glow: '#9333EA', textCol: '#F8FAFC' },
    counter_12: { label: '12', sub: 'WORDS LEFT', border: '#F97316', glow: '#EA580C', textCol: '#FFEDD5' },
  };
  const cfg = configs[prop];
  if (!cfg) return null;

  const w = 512;
  const h = 220;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, w, h);

  // Dark rounded hologram pill with glowing border
  ctx.fillStyle = 'rgba(9, 13, 22, 0.90)';
  ctx.strokeStyle = cfg.border;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, h - 32, 48);
  ctx.fill();
  ctx.stroke();

  // Main number
  ctx.fillStyle = cfg.textCol;
  ctx.font = cfg.label.length <= 2 ? '900 112px "Segoe UI", Arial, sans-serif' : '900 84px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.label, w / 2, h * 0.44);

  // Subtitle label
  if (cfg.sub) {
    ctx.fillStyle = cfg.border;
    ctx.font = '800 28px "Segoe UI", Arial, sans-serif';
    ctx.fillText(cfg.sub, w / 2, h * 0.80);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Smoothly beveled Roblox cylinder head geometry (rounded top and bottom rims).
 */
function buildBeveledHeadGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const r = 0.62;
  const h = 1.15;
  const bevel = 0.16;
  const halfH = h / 2;

  pts.push(new THREE.Vector2(0, -halfH));
  // Bottom bevel
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - bevel + Math.cos(a) * bevel, -halfH + bevel + Math.sin(a) * bevel));
  }
  // Top bevel
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - bevel + Math.cos(a) * bevel, halfH - bevel + Math.sin(a) * bevel));
  }
  pts.push(new THREE.Vector2(0, halfH));

  return new THREE.LatheGeometry(pts, 32);
}

// ---------------------------------------------------------------------------
// Body-part building blocks
// ---------------------------------------------------------------------------

const ArmSleeve: React.FC<{
  skin: string;
  sleeves: 'long' | 'short' | 'none';
  color: string;
  texture: THREE.Texture;
  gloves?: string;
}> = ({ skin, sleeves, color, texture, gloves }) => {
  const long = sleeves === 'long';
  const cy = long ? -0.2 : 0.16;
  const hh = long ? 1.44 : 0.74;
  const th = long ? 1.34 : 0.66;
  // With sleeves the skin block only reaches a little inside the sleeve, so the
  // shoulder top is covered by clothing instead of showing a skin cap.
  const skinTop = sleeves === 'none' ? 0.5 : cy - hh / 2 + 0.2;
  const skinH = gloves === 'welder' ? 0.6 : skinTop + 1.5;
  return (
    <>
      <RoundedBox position={[0, skinTop - skinH / 2, 0]} args={[0.98, skinH, 0.98]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={skin} roughness={0.4} />
      </RoundedBox>
      {sleeves !== 'none' && (
        <>
          <RoundedBox position={[0, cy, 0]} args={[1.03, hh, 1.03]} radius={0.07} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color={color} roughness={0.48} />
          </RoundedBox>
          <mesh position={[0, cy, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.04, th, 0.94]} />
            <meshStandardMaterial map={texture} roughness={0.48} />
          </mesh>
          <mesh position={[0, cy, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.94, th, 1.04]} />
            <meshStandardMaterial map={texture} roughness={0.48} />
          </mesh>
        </>
      )}
    </>
  );
};

/** Heavy welder's leather gauntlet glove with hollow, limp, empty fingertips */
const WelderGloveMesh: React.FC<{ left?: boolean }> = ({ left = false }) => (
  <group position={[0, -1.15, 0]}>
    {/* Thick flared leather gauntlet sleeve cuff */}
    <mesh position={[0, 0.28, 0]} castShadow>
      <cylinderGeometry args={[0.62, 0.54, 0.6, 16]} />
      <meshStandardMaterial color="#9A3412" roughness={0.75} />
    </mesh>
    {/* Raised welt seam */}
    <mesh position={[0, 0.56, 0]}>
      <torusGeometry args={[0.62, 0.05, 8, 20]} />
      <meshStandardMaterial color="#78350F" roughness={0.8} />
    </mesh>
    {/* Thick padded leather glove palm */}
    <RoundedBox position={[0, -0.16, 0]} args={[0.96, 0.52, 0.9]} radius={0.12} castShadow>
      <meshStandardMaterial color="#B45309" roughness={0.75} />
    </RoundedBox>
    {/* Leather thumb */}
    <RoundedBox position={[left ? 0.42 : -0.42, -0.12, 0.22]} args={[0.26, 0.38, 0.3]} radius={0.08} castShadow>
      <meshStandardMaterial color="#9A3412" roughness={0.75} />
    </RoundedBox>
    {/* HOLLOW, LIMP, COLLAPSED FINGERTIPS - distinctly hollow / flat and dangling! */}
    <group position={[0, -0.46, 0]}>
      {[-0.26, -0.09, 0.09, 0.26].map((fx, i) => (
        <group key={i} position={[fx, 0, 0]} rotation={[0.25, 0, (i - 1.5) * 0.06]}>
          {/* Flat limp hollow tube */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.44, 0.06]} />
            <meshStandardMaterial color="#78350F" roughness={0.85} />
          </mesh>
          {/* Dark hollow opening void at tip */}
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.13, 0.02, 0.05]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
        </group>
      ))}
    </group>
  </group>
);

const Leg: React.FC<{
  bottomStyle: 'pants' | 'jeans' | 'shorts' | 'skirt';
  bottomColor: string;
  legColor: string;
  jeansTexture: THREE.Texture | null;
  shoeStyle: 'sneakers' | 'boots' | 'formal';
  shoeColor: string;
  soleColor: string;
}> = ({ bottomStyle, bottomColor, legColor, jeansTexture, shoeStyle, shoeColor, soleColor }) => {
  const fullPants = bottomStyle === 'pants' || bottomStyle === 'jeans';
  return (
    <>
      <RoundedBox position={[0, -0.84, 0]} args={[1.0, 1.68, 1.0]} radius={0.06} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={fullPants ? bottomColor : legColor} roughness={0.5} />
      </RoundedBox>
      {bottomStyle === 'jeans' && jeansTexture && (
        <>
          <mesh position={[0, -0.84, 0]}>
            <boxGeometry args={[1.005, 1.6, 0.95]} />
            <meshStandardMaterial map={jeansTexture} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.84, 0]}>
            <boxGeometry args={[0.95, 1.6, 1.005]} />
            <meshStandardMaterial map={jeansTexture} roughness={0.7} />
          </mesh>
        </>
      )}
      {bottomStyle === 'shorts' && (
        <RoundedBox position={[0, -0.38, 0]} args={[1.04, 0.8, 1.04]} radius={0.06} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={bottomColor} roughness={0.55} />
        </RoundedBox>
      )}
      {shoeStyle === 'boots' ? (
        <RoundedBox position={[0, -1.64, 0.03]} args={[1.05, 0.6, 1.08]} radius={0.06} castShadow>
          <meshStandardMaterial color={shoeColor} roughness={0.55} />
        </RoundedBox>
      ) : (
        <RoundedBox position={[0, -1.8, 0.02]} args={[1.01, 0.28, 1.04]} radius={0.05} castShadow>
          <meshStandardMaterial
            color={shoeColor}
            roughness={shoeStyle === 'formal' ? 0.18 : 0.45}
            metalness={shoeStyle === 'formal' ? 0.15 : 0}
          />
        </RoundedBox>
      )}
      <RoundedBox position={[0, -1.96, 0.02]} args={[1.02, 0.08, 1.05]} radius={0.02}>
        <meshStandardMaterial color={soleColor} roughness={0.4} />
      </RoundedBox>
    </>
  );
};

/** Flared skirt hanging from the hips (attached to the torso, so legs swing under it). */
const Skirt: React.FC<{ color: string }> = ({ color }) => (
  <group position={[0, -1.42, 0]} scale={[1, 1, 0.58]}>
    <mesh rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.43, 1.72, 0.92, 4, 1]} />
      <meshStandardMaterial color={color} roughness={0.55} flatShading />
    </mesh>
  </group>
);

export const R6Character: React.FC<R6CharacterProps> = ({
  look: lookProp,
  position,
  rotationY,
  rotationX = 0,
  rotationZ = 0,
  anim,
  expression,
  prop = 'none',
  isSpeaking = true,
}) => {
  const frame = useCurrentFrame();
  const look = lookProp ?? CHARACTER_PRESETS.kid_boy;

  // ---- resolve the constructor look into concrete colors ----
  const skin = resolveSkin(look.skin);
  const hair = resolveHairColors(look.hair);
  const topStyle = look.top.style;
  const topColor = resolveColor(look.top.color);
  const topSecondary = look.top.secondary
    ? resolveColor(look.top.secondary)
    : topStyle === 'tshirt'
    ? topColor
    : shade(topColor, 0.6);
  const sleeves =
    look.top.sleeves ??
    (topStyle === 'tank' ? 'none' : topStyle === 'tshirt' || topStyle === 'polo' || topStyle === 'dress' ? 'short' : 'long');
  const sleeveColor = sleeveColorFor(topStyle, topColor, topSecondary);
  const bottom =
    topStyle === 'dress' ? { style: 'skirt' as const, color: look.top.color, legs: look.bottom.legs } : look.bottom;
  const bottomColor = resolveColor(bottom.color);
  const legColor = resolveColor(bottom.legs, skin);
  const shoeStyle = look.shoes.style ?? 'sneakers';
  const shoeColor = resolveColor(look.shoes.color);
  const soleColor = resolveColor(look.shoes.sole, shoeStyle === 'sneakers' ? '#F8FAFC' : shade(shoeColor, 0.55));
  const accessories = normalizeAccessories(look.accessories);
  const facialHair = look.facialHair ?? 'none';
  const facialHairColor = resolveColor(look.facialHairColor, hair.color);

  const headGeo = useMemo(() => buildBeveledHeadGeometry(), []);
  const faceTextureClosed = useMemo(
    () =>
      createFaceTexture(skin, expression, {
        freckles: look.freckles,
        blush: look.blush,
        stubble: facialHair === 'stubble' || facialHair === 'beard' ? facialHairColor : undefined,
        talking: false,
      }),
    [skin, expression, look.freckles, look.blush, facialHair, facialHairColor]
  );
  const faceTextureOpen = useMemo(
    () =>
      createFaceTexture(skin, expression, {
        freckles: look.freckles,
        blush: look.blush,
        stubble: facialHair === 'stubble' || facialHair === 'beard' ? facialHairColor : undefined,
        talking: true,
      }),
    [skin, expression, look.freckles, look.blush, facialHair, facialHairColor]
  );
  const torsoMaterials = useMemo(() => {
    const mk = (face: 'front' | 'back' | 'side') =>
      new THREE.MeshStandardMaterial({ map: createTopTexture(topStyle, topColor, topSecondary, skin, face), roughness: 0.5 });
    const side = mk('side');
    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
    return [side, side, side, side, mk('front'), mk('back')];
  }, [topStyle, topColor, topSecondary, skin]);
  const sleeveTexture = useMemo(
    () => createSleeveTexture(topStyle, topColor, topSecondary),
    [topStyle, topColor, topSecondary]
  );
  const jeansTexture = useMemo(
    () => (bottom.style === 'jeans' ? createJeansTexture(bottomColor) : null),
    [bottom.style, bottomColor]
  );
  const counterTexture = useMemo(() => createWordCounterTexture(prop), [prop]);
  const legProps = {
    bottomStyle: bottom.style,
    bottomColor,
    legColor,
    jeansTexture,
    shoeStyle,
    shoeColor,
    soleColor,
  };

  // Deterministic frame-based procedural joint rotations (30 fps)
  const t = frame / 30;

  let torsoOffsetY = 3.0;
  let torsoOffsetX = 0;
  let torsoRotX = 0;
  let torsoRotY = 0;
  let torsoRotZ = 0;

  let neckRotX = 0;
  let neckRotY = 0;
  let neckRotZ = 0;

  let rShoulderX = 0;
  let rShoulderZ = 0;
  let lShoulderX = 0;
  let lShoulderZ = 0;

  let rHipX = 0;
  let rHipZ = 0;
  let lHipX = 0;
  let lHipZ = 0;

  if (anim === 'idle') {
    const breath = Math.sin(t * 2.0);
    torsoOffsetY = 3.0;
    rShoulderZ = -0.05 - breath * 0.015;
    lShoulderZ = 0.05 + breath * 0.015;
    rShoulderX = Math.sin(t * 1.2) * 0.03;
    lShoulderX = -Math.sin(t * 1.2) * 0.03;
    neckRotY = Math.sin(t * 1.0) * 0.06;
  } else if (anim === 'sleep') {
    const snore = Math.sin(t * 2.5);
    torsoOffsetY = 3.0;
    rShoulderZ = -0.15;
    lShoulderZ = 0.15;
    neckRotX = 0.1 + snore * 0.05;
  } else if (anim === 'walk') {
    const speed = 7.5;
    const swing = Math.sin(t * speed);
    torsoOffsetY = 3.0 + Math.abs(Math.cos(t * speed)) * 0.08;
    rShoulderX = swing * 0.75;
    lShoulderX = -swing * 0.75;
    rHipX = -swing * 0.75;
    lHipX = swing * 0.75;
    torsoRotY = swing * 0.06;
  } else if (anim === 'sprint') {
    const speed = 15.0;
    const swing = Math.sin(t * speed);
    torsoOffsetY = 3.0 + Math.abs(Math.cos(t * speed)) * 0.18;
    torsoRotX = 0.22;
    rShoulderX = swing * 1.4;
    lShoulderX = -swing * 1.4;
    rShoulderZ = -0.12;
    lShoulderZ = 0.12;
    rHipX = -swing * 1.2;
    lHipX = swing * 1.2;
    neckRotX = -0.18;
    neckRotY = Math.sin(t * 10) * 0.1;
  } else if (anim === 'jump') {
    rShoulderX = -2.85;
    lShoulderX = -2.85;
    rShoulderZ = -0.2;
    lShoulderZ = 0.2;
    rHipX = -0.45;
    lHipX = 0.45;
    neckRotX = -0.15;
  } else if (anim === 'wave') {
    rShoulderX = -2.75;
    rShoulderZ = -0.25 + Math.sin(t * 10.0) * 0.35;
    lShoulderX = Math.sin(t * 1.5) * 0.05;
    neckRotY = -0.12;
  } else if (anim === 'point') {
    torsoOffsetY = 3.0;
    rShoulderX = -1.45;
    rShoulderZ = -0.1;
    neckRotY = -0.12;
  } else if (anim === 'panting') {
    const heave = Math.sin(t * 4.0);
    torsoOffsetY = 3.0;
    torsoRotX = 0.18;
    rShoulderX = 0.2 + heave * 0.05;
    lShoulderX = 0.2 + heave * 0.05;
    neckRotX = -0.12 + heave * 0.06;
    rHipX = -0.18;
    lHipX = -0.18;
  } else if (anim === 'knocked') {
    torsoRotY = t * 10.0;
    torsoRotZ = 0.35;
    rShoulderX = -2.2;
    lShoulderX = -2.2;
    rHipX = 0.5;
    lHipX = -0.5;
  } else if (anim === 'celebrate' || anim === 'dance') {
    const beat = t * 6.0;
    const sway = Math.sin(beat);
    torsoOffsetX = sway * 0.2;
    torsoOffsetY = 3.0 + Math.abs(Math.cos(beat * 2)) * 0.12;
    torsoRotZ = -sway * 0.08;
    torsoRotY = Math.cos(beat) * 0.25;
    rShoulderZ = -0.85 + Math.sin(beat * 2) * 0.4;
    lShoulderZ = 0.85 + Math.cos(beat * 2) * 0.4;
    rShoulderX = -2.2 + sway * 0.3;
    lShoulderX = -2.2 - sway * 0.3;
    rHipZ = sway * 0.15;
    lHipZ = sway * 0.15;
    neckRotY = -sway * 0.2;
  } else if (anim === 'talk') {
    // Stable planted standing pose with expressive arm gestures and natural speech cadence
    torsoOffsetY = 3.0;
    torsoRotX = 0.05; // Gentle static engagement lean (NO cyclic oscillation)
    torsoRotY = Math.sin(t * 1.5) * 0.08;
    rShoulderX = -1.15 + Math.sin(t * 3.0) * 0.28;
    rShoulderZ = -0.28 + Math.cos(t * 2.2) * 0.12;
    lShoulderX = -0.35 + Math.sin(t * 1.8) * 0.15;
    lShoulderZ = 0.15;
    neckRotX = Math.sin(t * 2.4) * 0.06; // Speech nod
    neckRotY = Math.sin(t * 1.6) * 0.1;
    // Ground legs vertically to prevent any pelvic rocking/humping
    rHipX = -0.05;
    lHipX = -0.05;
  } else if (anim === 'shout') {
    // Powerful planted shout stance: arms high, chest forward, wide legs, NO pelvic oscillation
    torsoOffsetY = 3.0;
    torsoRotX = 0.16; // Static forward lean
    torsoRotY = 0;
    rShoulderX = -2.15;
    rShoulderZ = -0.55;
    lShoulderX = -2.15;
    lShoulderZ = 0.55;
    neckRotX = -0.26; // Head tilted back shouting
    neckRotY = Math.sin(t * 24.0) * 0.03; // Subtle vocal vibration
    rHipX = -0.16; // Counter-rotated to keep legs strictly vertical
    lHipX = -0.16;
    rHipZ = -0.08; // Sturdy wide stance
    lHipZ = 0.08;
  } else if (anim === 'argue') {
    // Confrontational stance: one hand pointing forward, static slight twist
    torsoOffsetY = 3.0;
    torsoRotX = 0.10;
    torsoRotY = -0.15;
    rShoulderX = -1.45 + Math.sin(t * 3.6) * 0.2;
    rShoulderZ = -0.14;
    lShoulderX = 0.2;
    lShoulderZ = 0.18;
    neckRotX = -0.08;
    neckRotY = -0.15 + Math.sin(t * 3.6) * 0.06;
    rHipX = -0.10;
    lHipX = -0.10;
  } else if (anim === 'cower') {
    // Defensive crouch shielding head
    torsoOffsetY = 2.78;
    torsoRotX = -0.12;
    rShoulderX = -2.25;
    rShoulderZ = 0.42;
    lShoulderX = -2.25;
    lShoulderZ = -0.42;
    neckRotX = 0.32;
    neckRotY = 0.25;
    rHipX = 0.22;
    lHipX = 0.22;
  } else if (anim === 'plead') {
    // Pleading posture: hands held together in front of chest
    torsoOffsetY = 2.95;
    torsoRotX = 0.06;
    rShoulderX = -1.35;
    rShoulderZ = 0.32;
    lShoulderX = -1.35;
    lShoulderZ = -0.32;
    neckRotX = -0.14;
    neckRotY = Math.sin(t * 1.8) * 0.08;
    rHipX = -0.06;
    lHipX = -0.06;
  } else if (anim === 'despair') {
    // Agony posture: hands clutching head/temples
    torsoOffsetY = 2.85;
    torsoRotX = 0.12;
    rShoulderX = -2.65;
    rShoulderZ = 0.58;
    lShoulderX = -2.65;
    lShoulderZ = -0.58;
    neckRotX = 0.28;
    rHipX = -0.12;
    lHipX = -0.12;
  } else if (anim === 'fume') {
    // Rigid trembling anger: clenched fists, static upright posture
    const tremble = Math.sin(t * 26.0) * 0.015;
    torsoOffsetY = 3.0;
    torsoRotX = 0.06;
    rShoulderX = 0.22 + tremble;
    rShoulderZ = -0.18;
    lShoulderX = 0.22 + tremble;
    lShoulderZ = 0.18;
    neckRotX = -0.06;
    neckRotY = tremble * 1.2;
    rHipX = -0.06;
    lHipX = -0.06;
  } else if (anim === 'punch') {
    // Aggressive forward punch: right arm drives straight out, left guards, torso snaps
    const cycle = (t * 8.0) % (Math.PI * 2);
    const punchStrike = Math.sin(cycle);
    torsoOffsetY = 2.95;
    torsoRotX = 0.15;
    torsoRotY = -0.35 + punchStrike * 0.25;
    rShoulderX = -1.65 - punchStrike * 0.95;
    rShoulderZ = -0.15;
    lShoulderX = -1.2;
    lShoulderZ = 0.35;
    neckRotX = -0.12;
    neckRotY = 0.25;
    rHipX = 0.25;
    lHipX = -0.35;
  } else if (anim === 'shove') {
    // Two-handed violent forward shove
    const shoveStrike = Math.sin((t * 6.0) % (Math.PI * 2));
    torsoOffsetY = 2.9;
    torsoRotX = 0.22 + shoveStrike * 0.12;
    rShoulderX = -1.8 - shoveStrike * 0.6;
    lShoulderX = -1.8 - shoveStrike * 0.6;
    rShoulderZ = -0.18;
    lShoulderZ = 0.18;
    neckRotX = -0.15;
    rHipX = -0.25;
    lHipX = 0.25;
  } else if (anim === 'recoil') {
    // Staggering backward from impact
    const recoilOsc = Math.sin(t * 12.0) * Math.exp(-(t % 1.5) * 2.5);
    torsoOffsetY = 2.85;
    torsoRotX = -0.28 + recoilOsc * 0.1;
    torsoRotZ = 0.15;
    rShoulderX = 0.45;
    rShoulderZ = -0.55;
    lShoulderX = 0.45;
    lShoulderZ = 0.55;
    neckRotX = 0.35;
    neckRotY = -0.15;
    rHipX = -0.35;
    lHipX = 0.25;
  } else if (anim === 'fight') {
    // Dynamic boxing bounce: bobbing and weaving with fists up
    const bob = Math.abs(Math.sin(t * 10.0)) * 0.12;
    const weave = Math.sin(t * 5.0) * 0.15;
    torsoOffsetY = 2.92 + bob;
    torsoRotX = 0.12;
    torsoRotY = weave;
    rShoulderX = -1.35 + Math.sin(t * 10.0) * 0.25;
    rShoulderZ = -0.22;
    lShoulderX = -1.45 + Math.cos(t * 10.0) * 0.25;
    lShoulderZ = 0.22;
    neckRotX = -0.1;
    rHipX = -0.15;
    lHipX = 0.15;
  } else if (anim === 'cook') {
    // Active cooking at stove: left hand holds pot/pan, right arm actively stirs in circular rhythm
    const stirX = Math.sin(t * 6.5) * 0.22;
    const stirZ = Math.cos(t * 6.5) * 0.22;
    torsoOffsetY = 2.98;
    torsoRotX = 0.14;
    torsoRotY = 0.08;
    rShoulderX = -1.35 + stirX;
    rShoulderZ = -0.25 + stirZ;
    lShoulderX = -1.25;
    lShoulderZ = 0.28;
    neckRotX = 0.22;
    neckRotY = 0.05;
    rHipX = -0.14;
    lHipX = -0.14;
  } else if (anim === 'drop_pan') {
    // Pan dropped in horror: hands fly up in shock, recoiling
    torsoOffsetY = 2.82;
    torsoRotX = -0.18;
    rShoulderX = -2.1;
    rShoulderZ = -0.45;
    lShoulderX = -2.1;
    lShoulderZ = 0.45;
    neckRotX = -0.22;
    rHipX = 0.18;
    lHipX = 0.18;
  } else if (anim === 'collapse') {
    // Total physical collapse onto rug: lying face forward/sideways, limbs limp
    torsoOffsetY = 0.72;
    torsoRotX = 1.38;
    torsoRotZ = 0.42;
    torsoRotY = 0.25;
    rShoulderX = -0.65;
    rShoulderZ = -0.55;
    lShoulderX = -0.35;
    lShoulderZ = 0.65;
    neckRotX = 0.45;
    neckRotY = 0.35;
    rHipX = 0.15;
    lHipX = -0.45;
  } else if (anim === 'tackle') {
    // Airborne or forward violent tackle lunge: both arms grappling forward
    torsoOffsetY = 2.35;
    torsoRotX = 0.68;
    torsoRotY = Math.sin(t * 12.0) * 0.08;
    rShoulderX = -1.95;
    rShoulderZ = 0.35;
    lShoulderX = -1.95;
    lShoulderZ = -0.35;
    neckRotX = -0.22;
    rHipX = -0.72;
    lHipX = 0.55;
  } else if (anim === 'choke') {
    // Hoisted off the ground by neck: clawing at throat, legs kicking desperately
    const kick = Math.sin(t * 14.0);
    torsoOffsetY = 4.25 + Math.sin(t * 18.0) * 0.08;
    torsoRotX = -0.28;
    torsoRotZ = kick * 0.08;
    rShoulderX = -2.42;
    rShoulderZ = 0.65;
    lShoulderX = -2.42;
    lShoulderZ = -0.65;
    neckRotX = -0.55;
    neckRotY = Math.sin(t * 22.0) * 0.06;
    rHipX = kick * 0.55;
    lHipX = -kick * 0.55;
    rHipZ = 0.18;
    lHipZ = -0.18;
  }

  // Hold pan elevated at cooking/counter height when holding pan
  if (prop === 'pan' && anim !== 'cower' && anim !== 'despair' && anim !== 'shout') {
    rShoulderX = Math.min(rShoulderX, -1.25);
    rShoulderZ = -0.16;
  }

  const isTalkingAnim = anim === 'talk' || anim === 'shout' || anim === 'argue';
  // Mouth only flaps when this actor is in a talking animation AND vocal speech is actively playing
  const isMouthOpen = isTalkingAnim && isSpeaking && Math.floor(frame / 3) % 2 === 0;
  const activeFaceTexture = isMouthOpen ? faceTextureOpen : faceTextureClosed;

  return (
    <group position={position} rotation={[rotationX, rotationY, rotationZ]} scale={look.scale ?? 1}>
      {/* Optional Creepy Shadow Tendrils under feet (like Shadow Tag ref_4_t2) */}
      {prop === 'creepy_shadow' && (
        <group position={[0, 0.04, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.45, 24]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = (i / 6) * Math.PI * 2 + Math.sin(t * 4 + i) * 0.15;
            return (
              <mesh
                key={i}
                position={[Math.cos(ang) * 1.5, 0.01, Math.sin(ang) * 1.5]}
                rotation={[-Math.PI / 2, 0, -ang]}
              >
                <coneGeometry args={[0.22, 1.3, 4]} />
                <meshBasicMaterial color="#050505" />
              </mesh>
            );
          })}
        </group>
      )}

      {/* HumanoidRootPart / Torso Pivot */}
      <group
        position={[torsoOffsetX, torsoOffsetY, 0]}
        rotation={[torsoRotX, torsoRotY, torsoRotZ]}
      >
        {/* 1. TORSO (2 x 2 x 1 studs) with textured clothing */}
        <RoundedBox args={[2.0, 2.0, 1.0]} radius={0.08} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={topColor} roughness={0.5} />
        </RoundedBox>
        <mesh castShadow receiveShadow material={torsoMaterials}>
          <boxGeometry args={[1.90, 1.90, 1.01]} />
        </mesh>
        {bottom.style === 'skirt' && <Skirt color={bottomColor} />}

        {/* Backpack prop on back of torso */}
        {prop === 'backpack' && (
          <group position={[0, 0.1, -0.72]}>
            <RoundedBox args={[1.5, 1.6, 0.55]} radius={0.12} smoothness={3} castShadow>
              <meshStandardMaterial color="#EF4444" roughness={0.5} />
            </RoundedBox>
            <RoundedBox position={[0, -0.25, -0.25]} args={[1.1, 0.75, 0.25]} radius={0.08} castShadow>
              <meshStandardMaterial color="#B91C1C" roughness={0.5} />
            </RoundedBox>
          </group>
        )}

        {/* 2. NECK & HEAD */}
        <group position={[0, 1.0, 0]} rotation={[neckRotX, neckRotY, neckRotZ]}>
          <group position={[0, 0.62, 0]}>
            {/* Beveled Roblox Cylinder Head */}
            <mesh geometry={headGeo} castShadow receiveShadow>
              <meshStandardMaterial color={skin} roughness={0.38} />
            </mesh>
            {/* Front Face Decal Wrap (+Z) */}
            <mesh>
              <cylinderGeometry args={[0.626, 0.626, 0.94, 28, 1, true, -Math.PI / 3, (2 * Math.PI) / 3]} />
              <meshStandardMaterial map={activeFaceTexture} roughness={0.38} />
            </mesh>

            <FacialHairMesh type={facialHair} color={facialHairColor} />

            {/* Sculpted Layered Hair System */}
            <HairSystem style={look.hair.style} color={hair.color} highlight={hair.highlight} ombre={hair.ombre} />

            {/* Hats, glasses, headphones, bows... */}
            {accessories.map((acc, i) => (
              <HeadAccessory key={`${acc.type}-${i}`} spec={acc} />
            ))}

            {/* Optional Glowing Halo above Head (like The Three Tokens ref_5) */}
            {(prop === 'halo_gold' || prop === 'halo_red' || prop === 'counter_0') && (
              <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.58, 0.08, 12, 32]} />
                <meshStandardMaterial
                  color={prop === 'halo_red' ? '#EF4444' : '#FDE047'}
                  emissive={prop === 'halo_red' ? '#DC2626' : '#FACC15'}
                  emissiveIntensity={0.85}
                  roughness={0.2}
                />
              </mesh>
            )}

            {/* White X Tape over Mouth at Night (for 'mouth_tape' prop) */}
            {prop === 'mouth_tape' && (
              <group position={[0, -0.18, 0.635]}>
                <mesh rotation={[0, 0, 0.35]}>
                  <boxGeometry args={[0.46, 0.11, 0.02]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
                </mesh>
                <mesh rotation={[0, 0, -0.35]}>
                  <boxGeometry args={[0.46, 0.11, 0.02]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
                </mesh>
              </group>
            )}

            {/* Floating 3D Word Counter Hologram above Head */}
            {counterTexture && (
              <group
                position={[0, 1.38 + Math.sin(t * 4) * 0.04, 0]}
                rotation={[0, -rotationY - torsoRotY - neckRotY, 0]}
                scale={
                  prop === 'counter_2' || prop === 'counter_1'
                    ? [1.22, 1.22, 1.22]
                    : prop === 'counter_3' || prop === 'counter_0'
                    ? [1.12, 1.12, 1.12]
                    : [1.0, 1.0, 1.0]
                }
              >
                <mesh>
                  <planeGeometry args={[1.95, 0.84]} />
                  <meshBasicMaterial map={counterTexture} transparent side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </group>
        </group>

        {/* 3. RIGHT ARM (-1.5 X) with 3D Sleeve + Exposed Skin Hand */}
        <group position={[-1.5, 0.5, 0]} rotation={[rShoulderX, 0, rShoulderZ]}>
          <ArmSleeve skin={skin} sleeves={sleeves} color={sleeveColor} texture={sleeveTexture} gloves={look.gloves} />
          {look.gloves === 'welder' && <WelderGloveMesh left={false} />}

          {/* Held Props in Right Hand */}
          {prop === 'bloxy_cola' && (
            <group position={[0, -1.55, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.24, 0.24, 0.72, 16]} />
                <meshStandardMaterial color="#92400E" roughness={0.25} metalness={0.3} />
              </mesh>
            </group>
          )}

          {prop === 'hammer' && (
            <group position={[0, -1.45, 0.55]} rotation={[Math.PI / 3, 0, 0]}>
              {/* Wooden handle */}
              <mesh castShadow>
                <cylinderGeometry args={[0.08, 0.10, 1.8, 12]} />
                <meshStandardMaterial color="#78350F" roughness={0.6} />
              </mesh>
              {/* Iron hammer head */}
              <RoundedBox position={[0, 0.85, 0]} args={[0.28, 0.28, 0.85]} radius={0.05} castShadow>
                <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
              </RoundedBox>
            </group>
          )}

          {prop === 'binoculars' && (
            <group position={[0.45, -1.35, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              {[-0.22, 0.22].map((bx, i) => (
                <group key={i} position={[bx, 0, 0]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.18, 0.14, 0.65, 16]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 0.33, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
                    <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.4} />
                  </mesh>
                </group>
              ))}
            </group>
          )}

          {prop === 'pointer' && (
            <group position={[0, -1.45, 0.6]} rotation={[Math.PI / 3, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.08, 2.6, 12]} />
                <meshStandardMaterial color="#FDE047" />
              </mesh>
            </group>
          )}

          {prop === 'pan' && (
            <group position={[0, -1.5, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.55, 0.5, 0.16, 20]} />
                <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.3} />
              </mesh>
            </group>
          )}
        </group>

        {/* 4. LEFT ARM (+1.5 X) with 3D Sleeve + Exposed Skin Hand */}
        <group position={[1.5, 0.5, 0]} rotation={[lShoulderX, 0, lShoulderZ]}>
          <ArmSleeve skin={skin} sleeves={sleeves} color={sleeveColor} texture={sleeveTexture} gloves={look.gloves} />
          {look.gloves === 'welder' && <WelderGloveMesh left={true} />}
          {/* Red Lie Tokens on Left Arm (like ref_5_t10) */}
          {(prop === 'halo_gold' || prop === 'halo_red') &&
            [-0.45, -0.80, -1.15].map((ty, idx) => (
              <mesh key={idx} position={[0.52, ty, 0.12]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.13, 0.13, 0.06, 16]} />
                <meshStandardMaterial color="#DC2626" roughness={0.3} />
              </mesh>
            ))}
        </group>

        {/* 5. RIGHT LEG (-0.5 X) with Pants + Shoe + White Sole */}
        <group position={[-0.5, -1.0, 0]} rotation={[rHipX, 0, rHipZ]}>
          <Leg {...legProps} />
        </group>

        {/* 6. LEFT LEG (+0.5 X) with Pants + Shoe + White Sole */}
        <group position={[0.5, -1.0, 0]} rotation={[lHipX, 0, lHipZ]}>
          <Leg {...legProps} />
        </group>
      </group>
    </group>
  );
};
