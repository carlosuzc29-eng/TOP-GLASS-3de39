'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SilhouetteKey, WindowZone } from '@/types/domain';

interface CarSilhouetteProps {
  bodyType: SilhouetteKey;
  frontShade?: number | null;
  rearShade?: number | null;
  windshieldShade?: number | null;
  sunroofShade?: number | null;
  highlightedZones?: WindowZone[];
  className?: string;
}

interface VehicleGeometry {
  bodyMain: string;
  bodyHighlight: string;
  lowerSkirt: string;
  sideCrease: string;
  fenderVent?: string;
  headlight: string;
  taillight: string;
  wheelArches: string[];
  wheels: Array<{ cx: number; cy: number; r: number }>;
  windows: Record<WindowZone, string>;
  mirror: string;
}

/**
 * Live tint preview.
 * - 'suv' renders a real studio photograph of a Lamborghini Urus with traced
 *   glass masks (see PHOTO_STAGES). Each glass zone is rebuilt as clear glass,
 *   then a neutral film layer is animated to the selected VLT%.
 * - Other body types fall back to the vector side profiles below until a
 *   studio photo is added for them in PHOTO_STAGES.
 */
const GEOMETRIES: Record<SilhouetteKey, VehicleGeometry> = {
  // LAMBORGHINI URUS — Signature sharp coupe-SUV profile, hexagonal arches, aggressive nose
  suv: {
    bodyMain:
      'M 38 174 L 40 154 L 54 132 L 106 118 L 166 108 L 240 68 L 372 62 L 454 66 L 526 98 L 570 108 L 580 124 L 576 154 L 566 174 L 516 174 L 504 134 L 456 126 L 424 148 L 414 174 L 210 174 L 198 134 L 150 126 L 118 148 L 108 174 Z',
    bodyHighlight:
      'M 64 131 L 166 112 L 244 72 L 368 66 L 448 70 L 520 100 L 564 110 L 560 116 L 512 108 L 440 82 L 246 84 L 168 118 L 62 136 Z',
    lowerSkirt:
      'M 38 174 L 40 162 L 108 164 L 108 174 Z M 208 164 L 416 162 L 414 174 L 210 174 Z M 514 162 L 574 156 L 566 174 L 516 174 Z',
    sideCrease:
      'M 196 132 L 434 114 M 214 152 L 412 142 M 266 116 L 274 162 M 368 112 L 372 158',
    fenderVent: 'M 206 122 L 236 118 L 232 132 L 204 134 Z',
    headlight: 'M 48 138 L 96 124 L 104 132 L 54 144 Z',
    taillight: 'M 546 104 L 576 112 L 574 122 L 542 114 Z',
    wheelArches: [
      'M 102 174 L 112 140 L 146 120 L 182 124 L 204 146 L 214 174',
      'M 408 174 L 418 140 L 452 120 L 488 124 L 510 146 L 520 174',
    ],
    wheels: [
      { cx: 158, cy: 170, r: 34 },
      { cx: 464, cy: 170, r: 34 },
    ],
    windows: {
      windshield: 'M 176 107 L 242 72 L 254 72 L 194 107 Z',
      front: 'M 202 108 L 258 73 L 348 70 L 344 106 Z',
      rear: 'M 356 70 L 436 72 L 458 102 L 354 106 Z',
      back: 'M 444 72 L 478 74 L 514 98 L 468 101 Z',
      sunroof: 'M 262 66 L 386 62 L 382 67 L 266 70 Z',
    },
    mirror: 'M 208 106 L 228 100 L 234 108 L 214 112 Z',
  },

  // COUPE — Low-slung exotic red 2-door profile
  coupe: {
    bodyMain:
      'M 40 174 L 44 152 L 66 134 L 136 120 L 196 112 L 268 78 L 366 74 L 446 92 L 522 112 L 572 120 L 578 144 L 568 174 L 514 174 L 502 138 L 456 132 L 424 150 L 414 174 L 210 174 L 198 138 L 152 132 L 120 150 L 110 174 Z',
    bodyHighlight:
      'M 72 136 L 196 116 L 270 82 L 364 78 L 440 96 L 518 116 L 566 124 L 560 130 L 510 122 L 432 106 L 272 92 L 198 122 L 70 142 Z',
    lowerSkirt:
      'M 40 174 L 42 164 L 110 164 L 110 174 Z M 208 164 L 416 164 L 414 174 L 210 174 Z M 514 162 L 572 158 L 568 174 L 514 174 Z',
    sideCrease: 'M 204 140 L 428 122 M 234 154 L 408 146',
    fenderVent: 'M 380 124 L 412 120 L 408 142 L 376 144 Z',
    headlight: 'M 54 140 L 106 128 L 112 134 L 60 146 Z',
    taillight: 'M 546 118 L 576 124 L 574 132 L 542 126 Z',
    wheelArches: [
      'M 104 174 L 114 144 L 148 126 L 184 128 L 204 148 L 214 174',
      'M 408 174 L 418 144 L 452 126 L 488 128 L 508 148 L 518 174',
    ],
    wheels: [
      { cx: 158, cy: 170, r: 33 },
      { cx: 464, cy: 170, r: 33 },
    ],
    windows: {
      windshield: 'M 202 111 L 270 80 L 282 80 L 220 111 Z',
      front: 'M 228 112 L 286 81 L 382 80 L 372 112 Z',
      rear: 'M 390 82 L 434 92 L 450 110 L 382 112 Z',
      back: 'M 438 93 L 486 108 L 464 111 L 434 95 Z',
      sunroof: 'M 288 75 L 364 74 L 360 79 L 292 79 Z',
    },
    mirror: 'M 232 110 L 250 105 L 256 112 L 238 116 Z',
  },

  // SEDAN — Sport executive 4-door in Rosso Mars
  sedan: {
    bodyMain:
      'M 38 174 L 42 150 L 58 130 L 122 118 L 184 110 L 252 74 L 376 72 L 452 94 L 528 112 L 572 120 L 578 146 L 568 174 L 514 174 L 502 138 L 456 130 L 424 148 L 414 174 L 210 174 L 198 138 L 152 130 L 120 148 L 110 174 Z',
    bodyHighlight:
      'M 64 132 L 184 114 L 256 78 L 372 76 L 446 98 L 524 116 L 566 124 L 560 130 L 516 122 L 440 106 L 258 88 L 186 120 L 62 138 Z',
    lowerSkirt:
      'M 38 174 L 40 164 L 110 164 L 110 174 Z M 208 164 L 416 164 L 414 174 L 210 174 Z M 514 162 L 572 158 L 568 174 L 514 174 Z',
    sideCrease: 'M 198 132 L 432 120 M 214 152 L 412 146',
    headlight: 'M 50 136 L 100 124 L 106 132 L 56 142 Z',
    taillight: 'M 548 116 L 576 122 L 574 132 L 544 126 Z',
    wheelArches: [
      'M 104 174 L 114 144 L 148 124 L 184 128 L 204 148 L 214 174',
      'M 408 174 L 418 144 L 452 124 L 488 128 L 508 148 L 518 174',
    ],
    wheels: [
      { cx: 158, cy: 170, r: 33 },
      { cx: 464, cy: 170, r: 33 },
    ],
    windows: {
      windshield: 'M 190 109 L 254 76 L 266 76 L 208 109 Z',
      front: 'M 216 110 L 270 77 L 352 76 L 348 110 Z',
      rear: 'M 360 76 L 430 84 L 452 108 L 358 110 Z',
      back: 'M 436 86 L 488 108 L 464 110 L 432 88 Z',
      sunroof: 'M 274 71 L 368 71 L 364 75 L 278 75 Z',
    },
    mirror: 'M 220 108 L 238 102 L 244 110 L 226 114 Z',
  },

  // LARGE SUV / MINIVAN
  large_suv: {
    bodyMain:
      'M 34 174 L 38 148 L 50 124 L 112 112 L 160 106 L 218 60 L 496 58 L 542 64 L 568 106 L 578 126 L 576 174 L 518 174 L 506 134 L 458 126 L 426 148 L 416 174 L 206 174 L 194 134 L 146 126 L 114 148 L 104 174 Z',
    bodyHighlight:
      'M 56 126 L 160 110 L 222 64 L 494 62 L 538 68 L 562 108 L 554 114 L 528 76 L 224 74 L 162 116 L 56 132 Z',
    lowerSkirt:
      'M 34 174 L 36 162 L 104 164 L 104 174 Z M 204 164 L 418 162 L 416 174 L 206 174 Z M 516 162 L 576 158 L 576 174 L 518 174 Z',
    sideCrease: 'M 192 128 L 438 118 M 210 150 L 414 144',
    headlight: 'M 44 130 L 92 120 L 98 128 L 48 138 Z',
    taillight: 'M 552 104 L 574 108 L 574 128 L 550 124 Z',
    wheelArches: [
      'M 98 174 L 108 140 L 144 120 L 180 124 L 200 146 L 210 174',
      'M 410 174 L 420 140 L 456 120 L 492 124 L 512 146 L 522 174',
    ],
    wheels: [
      { cx: 154, cy: 170, r: 34 },
      { cx: 466, cy: 170, r: 34 },
    ],
    windows: {
      windshield: 'M 168 105 L 222 64 L 234 64 L 184 105 Z',
      front: 'M 192 106 L 238 66 L 326 65 L 324 106 Z',
      rear: 'M 336 65 L 434 65 L 434 106 L 334 106 Z',
      back: 'M 444 65 L 532 68 L 552 104 L 444 106 Z',
      sunroof: 'M 244 59 L 444 58 L 440 63 L 248 63 Z',
    },
    mirror: 'M 198 104 L 218 98 L 224 106 L 204 110 Z',
  },

  // PICKUP SINGLE CAB
  pickup_single: {
    bodyMain:
      'M 36 174 L 40 146 L 54 122 L 136 110 L 182 106 L 230 62 L 332 62 L 342 106 L 572 106 L 578 132 L 576 174 L 516 174 L 504 134 L 456 126 L 424 148 L 414 174 L 210 174 L 198 134 L 150 126 L 118 148 L 108 174 Z',
    bodyHighlight:
      'M 60 124 L 182 110 L 234 66 L 328 66 L 338 110 L 568 110 L 568 118 L 332 116 L 232 76 L 184 116 L 60 130 Z',
    lowerSkirt:
      'M 36 174 L 38 162 L 108 164 L 108 174 Z M 208 164 L 416 162 L 414 174 L 210 174 Z M 514 162 L 576 158 L 576 174 L 516 174 Z',
    sideCrease: 'M 196 126 L 560 120',
    headlight: 'M 46 128 L 94 120 L 98 130 L 50 138 Z',
    taillight: 'M 556 112 L 576 112 L 576 134 L 556 134 Z',
    wheelArches: [
      'M 102 174 L 112 138 L 148 120 L 184 124 L 204 146 L 214 174',
      'M 408 174 L 418 138 L 454 120 L 490 124 L 510 146 L 520 174',
    ],
    wheels: [
      { cx: 158, cy: 170, r: 35 },
      { cx: 464, cy: 170, r: 35 },
    ],
    windows: {
      windshield: 'M 190 105 L 234 66 L 246 66 L 206 105 Z',
      front: 'M 214 106 L 250 68 L 322 68 L 326 106 Z',
      rear: 'M 328 68 L 334 68 L 336 106 L 330 106 Z',
      back: 'M 326 68 L 332 68 L 334 106 L 328 106 Z',
      sunroof: 'M 254 62 L 318 62 L 316 66 L 256 66 Z',
    },
    mirror: 'M 220 104 L 240 98 L 246 106 L 226 110 Z',
  },

  // PICKUP CREW CAB
  pickup_crew: {
    bodyMain:
      'M 34 174 L 38 146 L 50 122 L 128 110 L 172 106 L 218 62 L 408 62 L 418 106 L 574 106 L 580 132 L 576 174 L 518 174 L 506 134 L 458 126 L 426 148 L 416 174 L 206 174 L 194 134 L 146 126 L 114 148 L 104 174 Z',
    bodyHighlight:
      'M 56 124 L 172 110 L 222 66 L 404 66 L 414 110 L 570 110 L 570 118 L 408 116 L 220 76 L 174 116 L 56 130 Z',
    lowerSkirt:
      'M 34 174 L 36 162 L 104 164 L 104 174 Z M 204 164 L 418 162 L 416 174 L 206 174 Z M 516 162 L 576 158 L 576 174 L 518 174 Z',
    sideCrease: 'M 192 126 L 562 120',
    headlight: 'M 44 128 L 90 120 L 94 130 L 48 138 Z',
    taillight: 'M 558 112 L 578 112 L 578 134 L 558 134 Z',
    wheelArches: [
      'M 98 174 L 108 138 L 144 120 L 180 124 L 200 146 L 210 174',
      'M 410 174 L 420 138 L 456 120 L 492 124 L 512 146 L 522 174',
    ],
    wheels: [
      { cx: 154, cy: 170, r: 35 },
      { cx: 466, cy: 170, r: 35 },
    ],
    windows: {
      windshield: 'M 180 105 L 222 66 L 234 66 L 196 105 Z',
      front: 'M 204 106 L 238 68 L 314 68 L 314 106 Z',
      rear: 'M 324 68 L 398 68 L 402 106 L 324 106 Z',
      back: 'M 402 68 L 410 68 L 414 106 L 406 106 Z',
      sunroof: 'M 244 62 L 368 62 L 364 66 L 248 66 Z',
    },
    mirror: 'M 210 104 L 230 98 L 236 106 L 216 110 Z',
  },
};


/* ------------------------------------------------------------------------- */
/*  Tint model                                                               */
/* ------------------------------------------------------------------------- */

/** VLT used when a zone has no film selected. */
const FACTORY_CLEAR_VLT = 78; // untreated front doors / windshield
const FACTORY_PRIVACY_VLT = 20; // OEM privacy glass on SUV rear doors

/**
 * Opacity of the neutral charcoal film layer laid over *clear* glass so the
 * result transmits roughly `vlt`% of the light. Interpolated between measured
 * anchor points so every value (not only the 7 catalog steps) renders correctly.
 */
const TINT_CURVE: Array<[number, number]> = [
  [0, 0.97],
  [5, 0.94],
  [15, 0.84],
  [20, 0.78],
  [22, 0.75],
  [33, 0.62],
  [40, 0.53],
  [56, 0.36],
  [70, 0.2],
  [78, 0.1],
  [100, 0],
];

export function vltToTintOpacity(vlt: number): number {
  const v = Math.min(100, Math.max(0, vlt));
  for (let i = 1; i < TINT_CURVE.length; i++) {
    const [x1, y1] = TINT_CURVE[i]!;
    if (v <= x1) {
      const [x0, y0] = TINT_CURVE[i - 1]!;
      return y0 + ((v - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 0;
}

function resolveZoneVlt(
  zone: WindowZone,
  shades: {
    front: number | null | undefined;
    rear: number | null | undefined;
    windshield: number | null | undefined;
    sunroof: number | null | undefined;
  },
): number {
  switch (zone) {
    case 'front':
      return shades.front ?? FACTORY_CLEAR_VLT;
    case 'rear':
    case 'back':
      return shades.rear ?? FACTORY_PRIVACY_VLT;
    case 'windshield':
      return shades.windshield ?? FACTORY_CLEAR_VLT;
    case 'sunroof':
      return shades.sunroof ?? FACTORY_PRIVACY_VLT;
  }
}

const TINT_TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };
const TINT_COLOR = '#06080a'; // neutral ceramic charcoal

/* ------------------------------------------------------------------------- */
/*  Photographic stage (real vehicle photo + traced glass masks)             */
/* ------------------------------------------------------------------------- */

interface PhotoStage {
  src: string;
  label: string;
  width: number;
  height: number;
  /** Y offset of the crop inside the original photo (paths use original coords). */
  offsetY: number;
  /** Traced glass outlines, in original photo pixel coordinates. */
  windows: Partial<Record<WindowZone, string>>;
  /** Parts that sit in front of the glass (e.g. mirror) and must never be tinted. */
  occluders: string[];
  /**
   * How much to lift the photo inside each zone to reconstruct "clear glass"
   * (the photo already carries factory tint). 1 = untouched.
   */
  clearLift: Partial<Record<WindowZone, { gain: number; haze: number }>>;
}

const PHOTO_STAGES: Partial<Record<SilhouetteKey, PhotoStage>> = {
  suv: {
    src: '/vehicles/urus-studio.webp',
    label: 'Lamborghini Urus',
    width: 1920,
    height: 1000,
    offsetY: 250,
    windows: {
      windshield:
        'M 600 549 L 646 506 L 692 462 L 746 420 L 800 399 L 900 396 L 1000 395 L 1176 400 L 1142 440 L 1108 494 L 1076 546 L 900 549 Z',
      front:
        'M 1158 562 L 1163 512 L 1176 480 L 1200 440 L 1232 407 L 1270 398 L 1366 400 L 1372 414 L 1410 559 Z',
      rear: 'M 1397 409 L 1440 414 L 1540 441 L 1600 465 L 1640 490 L 1670 514 L 1685 528 L 1671 540 L 1590 547 L 1440 558 Z',
    },
    occluders: [
      // Side mirror housing + arm
      'M 1147 532 L 1173 510 L 1197 488 L 1220 480 L 1247 478 L 1293 485 L 1320 500 L 1333 520 L 1332 535 L 1320 541 L 1207 548 L 1160 556 L 1146 551 Z',
    ],
    clearLift: {
      windshield: { gain: 1.25, haze: 0.04 },
      front: { gain: 4.2, haze: 0.09 },
      rear: { gain: 4.2, haze: 0.09 },
    },
  },
};

function PhotoTintStage({
  stage,
  zoneVlt,
  highlightedZones,
}: {
  stage: PhotoStage;
  zoneVlt: Record<WindowZone, number>;
  highlightedZones: WindowZone[];
}) {
  const uid = useId().replace(/:/g, '');
  const zones = (Object.keys(stage.windows) as WindowZone[]).filter((z) => stage.windows[z]);
  const describe = zones.map((z) => `${z} ${zoneVlt[z]}%`).join(', ');

  return (
    <svg
      viewBox={`0 0 ${stage.width} ${stage.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full"
      role="img"
      aria-label={`Live tint preview on ${stage.label}: ${describe} VLT`}
    >
      <defs>
        {zones.map((zone) => (
          <clipPath key={zone} id={`${uid}-clip-${zone}`}>
            <path d={stage.windows[zone]} transform={`translate(0 ${-stage.offsetY})`} />
          </clipPath>
        ))}
        <clipPath id={`${uid}-occluders`}>
          {stage.occluders.map((d, i) => (
            <path key={i} d={d} transform={`translate(0 ${-stage.offsetY})`} />
          ))}
        </clipPath>
        {/* "Clear glass" reconstructions: lift the photo so the cabin shows through */}
        {zones.map((zone) => {
          const { gain, haze } = stage.clearLift[zone] ?? { gain: 1, haze: 0 };
          return (
            <filter key={zone} id={`${uid}-lift-${zone}`} colorInterpolationFilters="sRGB">
              <feColorMatrix type="saturate" values="0.6" />
              <feComponentTransfer>
                <feFuncR type="linear" slope={gain} intercept={haze} />
                <feFuncG type="linear" slope={gain} intercept={haze + 0.008} />
                <feFuncB type="linear" slope={gain} intercept={haze + 0.016} />
              </feComponentTransfer>
            </filter>
          );
        })}
        {/* Keeps only the bright specular highlights of the original glass */}
        <filter id={`${uid}-specular`} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="2.2" intercept="-1.15" />
            <feFuncG type="linear" slope="2.2" intercept="-1.15" />
            <feFuncB type="linear" slope="2.2" intercept="-1.15" />
          </feComponentTransfer>
        </filter>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Base photograph */}
      <image href={stage.src} x="0" y="0" width={stage.width} height={stage.height} />

      {zones.map((zone) => {
        const clip = `url(#${uid}-clip-${zone})`;
        const isHighlighted = highlightedZones.includes(zone);
        return (
          <g key={zone}>
            {/* 1. Clear glass (cabin revealed) */}
            <image
              href={stage.src}
              x="0"
              y="0"
              width={stage.width}
              height={stage.height}
              clipPath={clip}
              filter={`url(#${uid}-lift-${zone})`}
            />
            {/* 2. Film layer — darkness driven by VLT */}
            <motion.rect
              x="0"
              y="0"
              width={stage.width}
              height={stage.height}
              clipPath={clip}
              fill={TINT_COLOR}
              initial={false}
              animate={{ opacity: vltToTintOpacity(zoneVlt[zone]) }}
              transition={TINT_TRANSITION}
            />
            {/* 3. Original reflections stay on top of the film, like real glass */}
            <image
              href={stage.src}
              x="0"
              y="0"
              width={stage.width}
              height={stage.height}
              clipPath={clip}
              filter={`url(#${uid}-specular)`}
              style={{ mixBlendMode: 'screen' }}
              opacity={0.55}
            />
            <rect
              x="0"
              y="0"
              width={stage.width}
              height={stage.height}
              clipPath={clip}
              fill={`url(#${uid}-sheen)`}
            />
            {/* 4. Zone highlight while the user edits it */}
            <motion.path
              d={stage.windows[zone]}
              transform={`translate(0 ${-stage.offsetY})`}
              fill="none"
              stroke="#ffc000"
              strokeWidth={5}
              strokeLinejoin="round"
              initial={false}
              animate={{ opacity: isHighlighted ? [0.55, 1, 0.55] : 0 }}
              transition={
                isHighlighted
                  ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            />
          </g>
        );
      })}

      {/* Mirror & other parts in front of the glass are restored untouched */}
      <image
        href={stage.src}
        x="0"
        y="0"
        width={stage.width}
        height={stage.height}
        clipPath={`url(#${uid}-occluders)`}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------------- */
/*  Vector stage (fallback for body types without a studio photo)            */
/* ------------------------------------------------------------------------- */

function VectorTintStage({
  bodyType,
  zoneVlt,
  highlightedZones,
}: {
  bodyType: SilhouetteKey;
  zoneVlt: Record<WindowZone, number>;
  highlightedZones: WindowZone[];
}) {
  const uid = useId().replace(/:/g, '');
  const geom = GEOMETRIES[bodyType] ?? GEOMETRIES.suv;
  const zones: WindowZone[] = ['windshield', 'front', 'rear', 'back', 'sunroof'];

  return (
    <svg
      viewBox="0 0 620 228"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full"
      role="img"
      aria-label={`Live tint preview for ${bodyType.replace('_', ' ')}`}
    >
      <defs>
        <linearGradient id={`${uid}-paint`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9aa0a6" />
          <stop offset="40%" stopColor="#70767c" />
          <stop offset="75%" stopColor="#4d5256" />
          <stop offset="100%" stopColor="#2d3033" />
        </linearGradient>
        <linearGradient id={`${uid}-shoulder`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d9e4e8" />
          <stop offset="100%" stopColor="#8f9ca3" />
        </linearGradient>
        <linearGradient id={`${uid}-reflect`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="310" cy="204" rx="268" ry="12" fill={`url(#${uid}-floor)`} />

      <path
        d={geom.bodyMain}
        fill={`url(#${uid}-paint)`}
        stroke="#1c1e20"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d={geom.bodyHighlight} fill={`url(#${uid}-shoulder)`} />
      <path d={geom.lowerSkirt} fill="#141414" />
      <path d={geom.sideCrease} stroke="#3a3e42" strokeWidth="1.2" strokeLinecap="round" />
      {geom.fenderVent && (
        <path d={geom.fenderVent} fill="#141414" stroke="#2b2b2b" strokeWidth="1" />
      )}
      <path d={geom.headlight} fill="#f4f7f9" fillOpacity="0.92" />
      <path d={geom.taillight} fill="#c8102e" />
      {geom.wheelArches.map((arch, idx) => (
        <path key={idx} d={arch} fill="none" stroke="#141414" strokeWidth="4.5" />
      ))}

      {zones.map((zone) => {
        const isHighlighted = highlightedZones.includes(zone);
        return (
          <g key={zone}>
            <path d={geom.windows[zone]} fill={`url(#${uid}-glass)`} />
            <motion.path
              d={geom.windows[zone]}
              fill={TINT_COLOR}
              initial={false}
              animate={{ fillOpacity: vltToTintOpacity(zoneVlt[zone]) }}
              transition={TINT_TRANSITION}
            />
            <path d={geom.windows[zone]} fill={`url(#${uid}-reflect)`} pointerEvents="none" />
            <motion.path
              d={geom.windows[zone]}
              fill="none"
              strokeLinejoin="round"
              initial={false}
              animate={{
                stroke: isHighlighted ? '#ffc000' : '#141414',
                strokeWidth: isHighlighted ? 2.2 : 1.2,
              }}
              transition={{ duration: 0.2 }}
            />
          </g>
        );
      })}

      <path d={geom.mirror} fill="#6a7075" stroke="#141414" strokeWidth="1.2" />

      {geom.wheels.map((w, idx) => (
        <g key={idx}>
          <circle cx={w.cx} cy={w.cy} r={w.r} fill="#0f0f0f" stroke="#262626" strokeWidth="1.5" />
          <circle cx={w.cx} cy={w.cy} r={w.r * 0.72} fill="#161616" stroke="#3d3d3d" strokeWidth="1.2" />
          <circle cx={w.cx} cy={w.cy} r={w.r * 0.52} fill="#2a2a2a" />
          <path
            d={`M ${w.cx - 12} ${w.cy - 10} A 14 14 0 0 0 ${w.cx - 12} ${w.cy + 10} L ${w.cx - 6} ${w.cy + 7} A 8 8 0 0 1 ${w.cx - 6} ${w.cy - 7} Z`}
            fill="#f07c00"
          />
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={w.cx}
                y1={w.cy}
                x2={w.cx + Math.cos(rad) * (w.r * 0.7)}
                y2={w.cy + Math.sin(rad) * (w.r * 0.7)}
                stroke="#4a4a4a"
                strokeWidth="2.4"
              />
            );
          })}
          <circle cx={w.cx} cy={w.cy} r={5} fill="#000000" stroke="#555" strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------------- */
/*  Public component                                                         */
/* ------------------------------------------------------------------------- */

export function CarSilhouette({
  bodyType,
  frontShade = 33,
  rearShade = 15,
  windshieldShade = null,
  sunroofShade = null,
  highlightedZones = [],
  className,
}: CarSilhouetteProps) {
  const shades = { front: frontShade, rear: rearShade, windshield: windshieldShade, sunroof: sunroofShade };
  const zoneVlt: Record<WindowZone, number> = {
    front: resolveZoneVlt('front', shades),
    rear: resolveZoneVlt('rear', shades),
    back: resolveZoneVlt('back', shades),
    windshield: resolveZoneVlt('windshield', shades),
    sunroof: resolveZoneVlt('sunroof', shades),
  };

  const stage = PHOTO_STAGES[bodyType];

  return (
    <div className={cn('relative w-full overflow-hidden select-none', className)}>
      {stage ? (
        <PhotoTintStage stage={stage} zoneVlt={zoneVlt} highlightedZones={highlightedZones} />
      ) : (
        <VectorTintStage bodyType={bodyType} zoneVlt={zoneVlt} highlightedZones={highlightedZones} />
      )}
    </div>
  );
}
