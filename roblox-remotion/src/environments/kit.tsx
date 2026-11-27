import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Shared building kit for all locations: cached procedural textures + tiny mesh helpers.
 * Everything is procedural (no external assets) and deterministic per frame.
 */

export type V3 = [number, number, number];

// ---------------------------------------------------------------------------
// Texture cache
// ---------------------------------------------------------------------------

const texCache = new Map<string, THREE.Texture>();

function cached(key: string, make: () => THREE.Texture): THREE.Texture {
  let t = texCache.get(key);
  if (!t) {
    t = make();
    texCache.set(key, t);
  }
  return t;
}

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

/** Classic Roblox baseplate stud tile. */
export function studTex(base: string, line: string, rx: number, ry = rx) {
  return cached(`stud:${base}:${line}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = line;
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, 125, 125);
        ctx.beginPath();
        ctx.arc(64, 64, 28, 0, Math.PI * 2);
        ctx.stroke();
      },
      [rx, ry]
    )
  );
}

export function brickTex(base: string, mortar: string, rx: number, ry: number) {
  return cached(`brick:${base}:${mortar}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = mortar;
        ctx.fillRect(0, 0, 128, 128);
        const bh = 16;
        let seed = 11;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        for (let row = 0; row < 8; row++) {
          const off = row % 2 ? 16 : 0;
          for (let x = -32; x < 128; x += 32) {
            const col = new THREE.Color(base).multiplyScalar(0.88 + rnd() * 0.2);
            ctx.fillStyle = `#${col.getHexString()}`;
            ctx.fillRect(x + off + 1.5, row * bh + 1.5, 29, bh - 3);
          }
        }
      },
      [rx, ry]
    )
  );
}

export function sidingTex(base: string, rx: number, ry: number) {
  return cached(`siding:${base}:${rx}:${ry}`, () =>
    canvasTex(
      64,
      64,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 64, 64);
        const dark = `#${new THREE.Color(base).multiplyScalar(0.8).getHexString()}`;
        for (let y = 0; y < 64; y += 16) {
          ctx.fillStyle = dark;
          ctx.fillRect(0, y + 13, 64, 3);
        }
      },
      [rx, ry]
    )
  );
}

export function shingleTex(base: string, rx: number, ry: number) {
  return cached(`shingle:${base}:${rx}:${ry}`, () =>
    canvasTex(
      64,
      64,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 64, 64);
        const dark = `#${new THREE.Color(base).multiplyScalar(0.72).getHexString()}`;
        ctx.fillStyle = dark;
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(0, r * 16 + 14, 64, 2);
          const off = r % 2 ? 8 : 0;
          for (let x = off; x < 64; x += 16) ctx.fillRect(x, r * 16, 2, 16);
        }
      },
      [rx, ry]
    )
  );
}

export function plankTex(base: string, rx: number, ry: number) {
  return cached(`plank:${base}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        const dark = `#${new THREE.Color(base).multiplyScalar(0.78).getHexString()}`;
        ctx.fillStyle = dark;
        for (let y = 0; y < 128; y += 32) {
          ctx.fillRect(0, y, 128, 2);
          ctx.fillRect(((y / 32) % 2) * 64 + 20, y, 2, 32);
        }
      },
      [rx, ry]
    )
  );
}

export function tileTex(base: string, line: string, rx: number, ry: number) {
  return cached(`tile:${base}:${line}:${rx}:${ry}`, () =>
    canvasTex(
      64,
      64,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 64, 64);
        ctx.strokeStyle = line;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 62, 62);
      },
      [rx, ry]
    )
  );
}

/** Premium glazed ceramic subway tile for kitchens and bathrooms with 3D bevel highlights */
export function wallSubwayTileTex(base = '#F1F5F9', grout = '#94A3B8', rx = 8, ry = 6) {
  return cached(`subway:${base}:${grout}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = grout;
        ctx.fillRect(0, 0, 128, 128);
        const th = 32;
        const tw = 64;
        const bCol = new THREE.Color(base);
        const light = `#${bCol.clone().multiplyScalar(1.08).getHexString()}`;
        const mid = `#${bCol.getHexString()}`;
        const dark = `#${bCol.clone().multiplyScalar(0.92).getHexString()}`;
        for (let row = 0; row < 4; row++) {
          const off = row % 2 ? 32 : 0;
          for (let col = -32; col < 128; col += 64) {
            const x = col + off;
            const y = row * th;
            // Tile bevel border
            ctx.fillStyle = dark;
            ctx.fillRect(x + 1.5, y + 1.5, tw - 3, th - 3);
            ctx.fillStyle = light;
            ctx.fillRect(x + 2, y + 2, tw - 4, th - 4);
            ctx.fillStyle = mid;
            ctx.fillRect(x + 3.5, y + 3.5, tw - 7, th - 7);
          }
        }
      },
      [rx, ry]
    )
  );
}

/** Premium designer textured wallpaper with vertical satin stripes and woven cloth texture */
export function wallPaperTex(base = '#BFDBFE', stripe = '#93C5FD', rx = 6, ry = 4) {
  return cached(`wallpaper:${base}:${stripe}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        // Vertical satin stripe rhythm
        const sCol = stripe ?? `#${new THREE.Color(base).multiplyScalar(0.92).getHexString()}`;
        ctx.fillStyle = sCol;
        for (let x = 0; x < 128; x += 32) {
          ctx.fillRect(x + 4, 0, 8, 128);
          ctx.fillRect(x + 18, 0, 2, 128);
        }
        // Micro-woven canvas noise
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.08;
        let seed = 37;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 400; i++) {
          ctx.fillRect(rnd() * 128, rnd() * 128, 2, 2);
        }
        ctx.globalAlpha = 1.0;
      },
      [rx, ry]
    )
  );
}

/** Premium architectural plaster / drywall stippling with subtle multi-scale noise */
export function wallPlasterTex(base = '#F8FAFC', rx = 8, ry = 6) {
  return cached(`plaster:${base}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        const dark = `#${new THREE.Color(base).multiplyScalar(0.93).getHexString()}`;
        const light = `#${new THREE.Color(base).multiplyScalar(1.05).getHexString()}`;
        let seed = 53;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 600; i++) {
          ctx.fillStyle = rnd() > 0.5 ? light : dark;
          const s = 1 + rnd() * 3;
          ctx.fillRect(rnd() * 128, rnd() * 128, s, s);
        }
        ctx.globalAlpha = 1.0;
      },
      [rx, ry]
    )
  );
}

/** Premium polished wood grain for tables, desks, dining counters and furniture */
export function woodGrainTex(base = '#B45309', rx = 2, ry = 2) {
  return cached(`wood:${base}:${rx}:${ry}`, () =>
    canvasTex(
      256,
      256,
      (ctx) => {
        const bCol = new THREE.Color(base);
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 256, 256);
        const plankH = 64;
        let seed = 23;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        // 4 wood planks with grain lines
        for (let p = 0; p < 4; p++) {
          const py = p * plankH;
          // Plank seam
          ctx.fillStyle = `#${bCol.clone().multiplyScalar(0.68).getHexString()}`;
          ctx.fillRect(0, py, 256, 2);

          // Flowing wood grain rings
          for (let g = 0; g < 14; g++) {
            const gy = py + 3 + g * 4.2;
            const darkGrain = `#${bCol.clone().multiplyScalar(0.82 + rnd() * 0.1).getHexString()}`;
            ctx.strokeStyle = darkGrain;
            ctx.lineWidth = 1.2 + rnd() * 0.8;
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.bezierCurveTo(64, gy + (rnd() - 0.5) * 6, 192, gy + (rnd() - 0.5) * 6, 256, gy);
            ctx.stroke();
          }
        }
        // Micro-pore streak noise
        ctx.fillStyle = `#${bCol.clone().multiplyScalar(0.74).getHexString()}`;
        ctx.globalAlpha = 0.18;
        for (let i = 0; i < 350; i++) {
          const x = rnd() * 256;
          const y = rnd() * 256;
          ctx.fillRect(x, y, 6 + rnd() * 12, 1);
        }
        ctx.globalAlpha = 1.0;
      },
      [rx, ry]
    )
  );
}

/** Premium speckled granite / quartz for countertops */
export function counterGraniteTex(base = '#334155', fleck = '#94A3B8', rx = 4, ry = 4) {
  return cached(`granite:${base}:${fleck}:${rx}:${ry}`, () =>
    canvasTex(
      128,
      128,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 128);
        const bCol = new THREE.Color(base);
        const fCol = new THREE.Color(fleck);
        const darkFleck = `#${bCol.clone().multiplyScalar(0.55).getHexString()}`;
        const lightFleck = `#${fCol.clone().multiplyScalar(1.2).getHexString()}`;
        let seed = 71;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle = rnd() > 0.4 ? lightFleck : darkFleck;
          ctx.globalAlpha = 0.25 + rnd() * 0.45;
          const s = 1.2 + rnd() * 2.2;
          ctx.fillRect(rnd() * 128, rnd() * 128, s, s);
        }
        ctx.globalAlpha = 1.0;
      },
      [rx, ry]
    )
  );
}

/** Premium Carrara marble with delicate veins */
export function counterMarbleTex(base = '#F8FAFC', vein = '#94A3B8', rx = 2, ry = 2) {
  return cached(`marble:${base}:${vein}:${rx}:${ry}`, () =>
    canvasTex(
      256,
      256,
      (ctx) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = vein;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.22;
        // 3 major marble veins
        const veins = [
          [[10, 20], [80, 70], [140, 150], [240, 220]],
          [[60, 240], [130, 170], [190, 80], [250, 40]],
          [[0, 140], [90, 120], [170, 160], [256, 130]],
        ];
        for (const pts of veins) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      },
      [rx, ry]
    )
  );
}

export interface TextLine {
  text: string;
  color?: string;
  size?: number; // px at 1024 width
  font?: string;
}

/** Canvas sign / board texture with centered text lines. */
export function textTex(
  lines: TextLine[],
  opts: { w?: number; h?: number; bg?: string; border?: string; borderWidth?: number; radius?: number } = {}
) {
  const { w = 1024, h = 256, bg = '#FFFFFF', border, borderWidth = 24, radius = 0 } = opts;
  const key = `text:${JSON.stringify(lines)}:${w}:${h}:${bg}:${border}:${borderWidth}:${radius}`;
  return cached(key, () =>
    canvasTex(w, h, (ctx) => {
      ctx.fillStyle = bg;
      if (radius) {
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, radius);
        ctx.fill();
      } else ctx.fillRect(0, 0, w, h);
      if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const total = lines.reduce((a, l) => a + (l.size ?? 80) * 1.25, 0);
      let y = h / 2 - total / 2;
      for (const l of lines) {
        const size = l.size ?? 80;
        ctx.font = l.font ?? `900 ${size}px "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = l.color ?? '#111827';
        y += (size * 1.25) / 2;
        ctx.fillText(l.text, w / 2, y);
        y += (size * 1.25) / 2;
      }
    })
  );
}

export function stripeTex(a: string, b: string, n: number) {
  return cached(`stripe:${a}:${b}:${n}`, () =>
    canvasTex(256, 64, (ctx) => {
      const sw = 256 / n;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? b : a;
        ctx.fillRect(i * sw, 0, sw, 64);
      }
    })
  );
}

// ---------------------------------------------------------------------------
// Mesh helpers
// ---------------------------------------------------------------------------

export interface BoxProps {
  p?: V3;
  s: V3;
  c?: string;
  r?: V3;
  map?: THREE.Texture;
  e?: string; // emissive color
  ei?: number; // emissive intensity
  rough?: number;
  metal?: number;
  opacity?: number;
  shadow?: boolean;
  receive?: boolean;
}

export const Box: React.FC<BoxProps> = ({
  p = [0, 0, 0],
  s,
  c = '#FFFFFF',
  r,
  map,
  e,
  ei = 1,
  rough = 0.65,
  metal = 0,
  opacity,
  shadow = false,
  receive = true,
}) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow={receive}>
    <boxGeometry args={s} />
    <meshStandardMaterial
      color={map ? '#FFFFFF' : c}
      map={map}
      emissive={e ?? '#000000'}
      emissiveIntensity={e ? ei : 0}
      roughness={rough}
      metalness={metal}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  </mesh>
);

export const Cyl: React.FC<{
  p?: V3;
  r?: V3;
  rt: number;
  rb?: number;
  h: number;
  c: string;
  seg?: number;
  e?: string;
  ei?: number;
  rough?: number;
  metal?: number;
  shadow?: boolean;
}> = ({ p = [0, 0, 0], r, rt, rb, h, c, seg = 16, e, ei = 1, rough = 0.6, metal = 0, shadow = false }) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
    <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
    <meshStandardMaterial color={c} emissive={e ?? '#000000'} emissiveIntensity={e ? ei : 0} roughness={rough} metalness={metal} />
  </mesh>
);

export const Ball: React.FC<{ p?: V3; rad: number; c: string; sc?: V3; rough?: number; e?: string; ei?: number; shadow?: boolean }> = ({
  p = [0, 0, 0],
  rad,
  c,
  sc,
  rough = 0.6,
  e,
  ei = 1,
  shadow = false,
}) => (
  <mesh position={p} scale={sc} castShadow={shadow} receiveShadow>
    <sphereGeometry args={[rad, 18, 14]} />
    <meshStandardMaterial color={c} roughness={rough} emissive={e ?? '#000000'} emissiveIntensity={e ? ei : 0} />
  </mesh>
);

/** Flat textured panel (sign, poster, board) facing +Z. */
export const Panel: React.FC<{ p?: V3; r?: V3; w: number; h: number; map: THREE.Texture; glow?: number }> = ({
  p = [0, 0, 0],
  r,
  w,
  h,
  map,
  glow = 0,
}) => (
  <mesh position={p} rotation={r}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={map} emissive={glow ? '#FFFFFF' : '#000000'} emissiveMap={glow ? map : null} emissiveIntensity={glow} roughness={0.6} />
  </mesh>
);

/** Triangular prism (gable attic) — ridge along X, triangle in the ZY plane. */
export const Prism: React.FC<{ p?: V3; width: number; depth: number; height: number; c?: string; map?: THREE.Texture }> = ({
  p = [0, 0, 0],
  width,
  depth,
  height,
  c = '#FFFFFF',
  map,
}) => {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-depth / 2, 0);
    shape.lineTo(depth / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
    g.translate(0, 0, -width / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [width, depth, height]);
  return (
    <mesh geometry={geo} position={p} castShadow receiveShadow>
      <meshStandardMaterial color={map ? '#FFFFFF' : c} map={map} roughness={0.7} />
    </mesh>
  );
};

/** Two sloped roof slabs over a gable (ridge along X). */
export const GableRoof: React.FC<{ p?: V3; width: number; depth: number; height: number; color: string; overhang?: number }> = ({
  p = [0, 0, 0],
  width,
  depth,
  height,
  color,
  overhang = 0.8,
}) => {
  const half = depth / 2 + overhang;
  const angle = Math.atan2(height, depth / 2);
  const len = half / Math.cos(angle);
  const map = shingleTex(color, Math.round(width / 2), Math.round(len / 1.5));
  return (
    <group position={p}>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[0, height / 2 - (overhang * Math.tan(angle)) / 2 + 0.15, (s * (half - overhang)) / 2 + (s * overhang) / 2]}
          rotation={[s * angle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + overhang * 2, 0.3, len]} />
          <meshStandardMaterial map={map} roughness={0.8} />
        </mesh>
      ))}
      <Box p={[0, height + 0.12, 0]} s={[width + overhang * 2 + 0.05, 0.3, 0.5]} c={new THREE.Color(color).multiplyScalar(0.7).getStyle()} />
    </group>
  );
};

/** Window with trim frame, sill, cross bars, and glass that glows warm at night. */
export const Window: React.FC<{
  p: V3;
  r?: V3;
  w?: number;
  h?: number;
  trim?: string;
  night?: boolean;
  glass?: string;
  shutters?: string;
  bars?: boolean;
}> = ({ p, r, w = 2.2, h = 2.2, trim = '#F8FAFC', night = false, glass = '#7DD3FC', shutters, bars = true }) => (
  <group position={p} rotation={r}>
    <Box p={[0, 0, 0]} s={[w + 0.36, h + 0.36, 0.16]} c={trim} />
    <Box
      p={[0, 0, 0.06]}
      s={[w, h, 0.1]}
      c={night ? '#FDE68A' : glass}
      e={night ? '#FBBF24' : '#38BDF8'}
      ei={night ? 0.9 : 0.15}
      rough={0.1}
      metal={0.2}
    />
    {bars && (
      <>
        <Box p={[0, 0, 0.13]} s={[w, 0.12, 0.06]} c={trim} />
        <Box p={[0, 0, 0.13]} s={[0.12, h, 0.06]} c={trim} />
      </>
    )}
    <Box p={[0, -h / 2 - 0.22, 0.18]} s={[w + 0.6, 0.16, 0.4]} c={trim} />
    {shutters &&
      [-1, 1].map((s) => <Box key={s} p={[s * (w / 2 + 0.55), 0, 0.02]} s={[0.7, h + 0.3, 0.12]} c={shutters} />)}
  </group>
);

/** Panel door with knob; faces +Z. */
export const Door: React.FC<{ p: V3; r?: V3; w?: number; h?: number; color: string; trim?: string; glassTop?: boolean }> = ({
  p,
  r,
  w = 2.4,
  h = 4.4,
  color,
  trim = '#F8FAFC',
  glassTop = false,
}) => (
  <group position={p} rotation={r}>
    <Box p={[0, h / 2, 0]} s={[w + 0.4, h + 0.3, 0.16]} c={trim} />
    <Box p={[0, h / 2 - 0.1, 0.08]} s={[w, h, 0.14]} c={color} />
    <Box p={[0, h * 0.7, 0.17]} s={[w * 0.66, h * 0.3, 0.04]} c={glassTop ? '#BAE6FD' : new THREE.Color(color).multiplyScalar(0.85).getStyle()} />
    <Box p={[0, h * 0.28, 0.17]} s={[w * 0.66, h * 0.3, 0.04]} c={new THREE.Color(color).multiplyScalar(0.85).getStyle()} />
    <Ball p={[w * 0.36, h * 0.48, 0.24]} rad={0.13} c="#FACC15" rough={0.2} />
  </group>
);
