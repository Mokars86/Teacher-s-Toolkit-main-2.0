import { QuestionConfidence, AnswerKey } from '../types';

export interface CornerAnchor {
  id: string; // 'TL' | 'TR' | 'BL' | 'BR'
  x: number;  // 0 - 100%
  y: number;  // 0 - 100%
}

export type ScanPreset = 'cv_real' | 'sim_realistic' | 'sim_struggling' | 'sim_audit' | 'sim_perfect';
export type ScanSensitivity = 'normal' | 'faint_pencil' | 'pen_marker';

/**
 * Normalizes answer key retrieval supporting both numeric key answers[1] and string key answers["1"].
 */
export function getEffectiveKeyAnswer(key?: AnswerKey | null, questionNumber: number = 1): string {
  if (!key || !key.answers) return 'A';
  const val = key.answers[questionNumber] ?? (key.answers as any)[String(questionNumber)];
  if (val && typeof val === 'string' && val.trim()) {
    return val.trim().toUpperCase();
  }
  return 'A';
}

/**
 * Bilinear interpolation helper to map a normalized point (u, v) in [0, 1] x [0, 1]
 * onto the quadrilateral defined by TL, TR, BR, BL corners.
 */
export function interpolateQuad(
  u: number,
  v: number,
  tl: { x: number; y: number },
  tr: { x: number; y: number },
  br: { x: number; y: number },
  bl: { x: number; y: number }
): { x: number; y: number } {
  const topX = tl.x + u * (tr.x - tl.x);
  const topY = tl.y + u * (tr.y - tl.y);
  const botX = bl.x + u * (br.x - bl.x);
  const botY = bl.y + u * (br.y - bl.y);

  return {
    x: topX + v * (botX - topX),
    y: topY + v * (botY - topY)
  };
}

/**
 * Loads an image safely from Data URL, Object URL, or remote source with safety timeout.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        reject(new Error('Image load timed out'));
      }
    }, 12000);

    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(img);
      }
    };

    img.onerror = (err) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        console.warn('Image load error on source:', err);
        reject(new Error('Failed to load OMR sheet image for processing'));
      }
    };

    img.src = src;
  });
}

/**
 * Accurately measures the local paper background brightness around a candidate bubble
 * by sampling an annulus ring (12 points) and picking the upper percentile (bright clean paper).
 */
function getRobustLocalPaperBrightness(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number
): number {
  const samples: number[] = [];
  const ringDist = radius * 2.1;
  const angles = [0, 0.523, 1.047, 1.57, 2.094, 2.618, 3.141, 3.665, 4.188, 4.712, 5.235, 5.759];

  for (let i = 0; i < angles.length; i++) {
    const ax = Math.round(centerX + Math.cos(angles[i]) * ringDist);
    const ay = Math.round(centerY + Math.sin(angles[i]) * ringDist);

    if (ax >= 0 && ax < width && ay >= 0 && ay < height) {
      const idx = (ay * width + ax) * 4;
      const lum = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;
      samples.push(lum);
    }
  }

  if (samples.length === 0) return 220;
  
  // Sort samples ascending and take the 80th percentile (clean paper white level)
  samples.sort((a, b) => a - b);
  const pIndex = Math.min(samples.length - 1, Math.floor(samples.length * 0.80));
  return Math.max(100, samples[pIndex]);
}

/**
 * ULTRA-ACCURATE BUBBLE OPTICAL DENSITY SAMPLER
 * Accurately measures graphite pencil (HB to 4B), ballpoint pen (blue/black), gel pen, marker shading, ticks, and crosses.
 * Evaluates core darkness, fill density, and delta against local paper white level.
 */
export function sampleBubbleDarknessFromBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  sensitivity: ScanSensitivity = 'normal'
): number {
  let maxNetScore = 0;

  const localBgLum = getRobustLocalPaperBrightness(data, width, height, centerX, centerY, radius);

  // Micro-jitter search offsets to tolerate slight tilt or lens distortion
  const searchRad = Math.max(2, Math.min(7, Math.round(radius * 0.35)));
  const searchOffsets: { dx: number; dy: number }[] = [
    { dx: 0, dy: 0 },
    { dx: -searchRad, dy: 0 },
    { dx: searchRad, dy: 0 },
    { dx: 0, dy: -searchRad },
    { dx: 0, dy: searchRad },
    { dx: -Math.round(searchRad * 0.7), dy: -Math.round(searchRad * 0.7) },
    { dx: Math.round(searchRad * 0.7), dy: -Math.round(searchRad * 0.7) },
    { dx: -Math.round(searchRad * 0.7), dy: Math.round(searchRad * 0.7) },
    { dx: Math.round(searchRad * 0.7), dy: Math.round(searchRad * 0.7) }
  ];

  const radCeil = Math.max(3, Math.ceil(radius));
  const coreRadSq = (radius * 0.55) * (radius * 0.55);
  const innerRadSq = (radius * 0.92) * (radius * 0.92);

  // Darkness threshold delta for shading detection
  const lightDelta = sensitivity === 'faint_pencil' ? 5 : (sensitivity === 'pen_marker' ? 12 : 8);
  const mediumDelta = sensitivity === 'faint_pencil' ? 10 : (sensitivity === 'pen_marker' ? 20 : 14);

  for (let k = 0; k < searchOffsets.length; k++) {
    const cx = Math.round(centerX + searchOffsets[k].dx);
    const cy = Math.round(centerY + searchOffsets[k].dy);

    const minX = Math.max(0, cx - radCeil);
    const maxX = Math.min(width - 1, cx + radCeil);
    const minY = Math.max(0, cy - radCeil);
    const maxY = Math.min(height - 1, cy + radCeil);

    let lumSum = 0;
    let pixelCount = 0;
    let coreLumSum = 0;
    let coreCount = 0;
    let lightDarkCount = 0;
    let mediumDarkCount = 0;

    for (let py = minY; py <= maxY; py++) {
      const rowOffset = py * width;
      const offY = py - cy;
      const offYSq = offY * offY;

      for (let px = minX; px <= maxX; px++) {
        const offX = px - cx;
        const distSq = offX * offX + offYSq;

        if (distSq <= innerRadSq) {
          const idx = (rowOffset + px) * 4;
          // Photometric luminance: (77*R + 150*G + 29*B) >> 8
          const lum = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;

          lumSum += lum;
          pixelCount++;

          if (lum < (localBgLum - lightDelta)) {
            lightDarkCount++;
          }
          if (lum < (localBgLum - mediumDelta)) {
            mediumDarkCount++;
          }

          if (distSq <= coreRadSq) {
            coreLumSum += lum;
            coreCount++;
          }
        }
      }
    }

    if (pixelCount > 0) {
      const avgLum = lumSum / pixelCount;
      const coreLum = coreCount > 0 ? (coreLumSum / coreCount) : avgLum;
      
      const netAvgDarkness = Math.max(0, localBgLum - avgLum);
      const netCoreDarkness = Math.max(0, localBgLum - coreLum);
      const lightRatio = lightDarkCount / pixelCount;
      const mediumRatio = mediumDarkCount / pixelCount;

      // Real shading fills the core and area. Empty printed letters only cover ~5% of circle.
      let fillMultiplier = 1.0;
      if (lightRatio < 0.05 && mediumRatio < 0.03 && netCoreDarkness < 8) {
        fillMultiplier = 0.20; // Empty printed bubble perimeter
      } else if (lightRatio < 0.10 && mediumRatio < 0.06 && netCoreDarkness < 12) {
        fillMultiplier = 0.60;
      }

      const score = ((netCoreDarkness * 0.40) + (netAvgDarkness * 0.30) + (lightRatio * 25) + (mediumRatio * 30)) * fillMultiplier;
      if (score > maxNetScore) {
        maxNetScore = score;
      }
    }
  }

  return maxNetScore;
}

/**
 * Legacy wrapper for single-bubble canvas sampling.
 */
export function sampleBubbleFill(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  width: number,
  height: number
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const score = sampleBubbleDarknessFromBuffer(imgData.data, width, height, centerX, centerY, radius);
    return {
      rawDarkness: score,
      coreDarkness: score,
      fillRatio: score / 255,
      localBg: 0,
      netScore: Math.round(score)
    };
  } catch {
    return { rawDarkness: 0, coreDarkness: 0, fillRatio: 0, localBg: 0, netScore: 0 };
  }
}

/**
 * Evaluates candidate answers for a given column layout configuration and vertical range.
 * Uses Intra-Row Relative Contrast to accurately pick student marks regardless of ambient lighting.
 */
export function evaluateLayoutWithMargins(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  questionsCount: number,
  numCols: number,
  corners: { tl: { x: number; y: number }; tr: { x: number; y: number }; bl: { x: number; y: number }; br: { x: number; y: number } },
  optionsCount: number = 4,
  sensitivity: ScanSensitivity = 'normal',
  topMarginV: number = 0.10,
  bottomMarginV: number = 0.92,
  bubbleOffsetStartFactor: number = 0.30,
  bubbleOffsetEndFactor: number = 0.94
): { results: QuestionConfidence[]; totalConfidenceScore: number; detectedCount: number } {
  const numOpts = Math.max(2, Math.min(5, optionsCount));
  const allOptions: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
  const optList = allOptions.slice(0, numOpts);

  const rowsPerCol = Math.ceil(questionsCount / numCols);
  const bubbleRadius = Math.max(5, Math.min(24, (width * (numOpts === 3 ? 0.022 : (numOpts === 5 ? 0.015 : 0.018)))));

  const results: QuestionConfidence[] = [];
  let totalConfidenceScore = 0;
  let detectedCount = 0;

  for (let q = 1; q <= questionsCount; q++) {
    const colIndex = Math.floor((q - 1) / rowsPerCol);
    const rowIndex = (q - 1) % rowsPerCol;

    let colLeftU: number;
    let colRightU: number;

    if (numCols === 1) {
      colLeftU = 0.04;
      colRightU = 0.96;
    } else if (numCols === 2) {
      colLeftU = colIndex === 0 ? 0.03 : 0.51;
      colRightU = colIndex === 0 ? 0.49 : 0.97;
    } else if (numCols === 3) {
      colLeftU = 0.02 + colIndex * 0.325;
      colRightU = colLeftU + 0.30;
    } else {
      colLeftU = 0.02 + colIndex * 0.245;
      colRightU = colLeftU + 0.225;
    }

    const rowV = rowsPerCol > 1 
      ? topMarginV + (rowIndex / (rowsPerCol - 1)) * (bottomMarginV - topMarginV)
      : (topMarginV + bottomMarginV) / 2;

    const colWidth = colRightU - colLeftU;
    
    // Bubble coordinates: safely offset past question numbers (e.g. "1.", "10.")
    const bubblesStartU = colLeftU + colWidth * bubbleOffsetStartFactor;
    const bubblesEndU = colLeftU + colWidth * bubbleOffsetEndFactor;

    const optScores: { [key: string]: number } = {};

    for (let idx = 0; idx < optList.length; idx++) {
      const opt = optList[idx];
      const optU = optList.length > 1 
        ? bubblesStartU + (idx / (optList.length - 1)) * (bubblesEndU - bubblesStartU) 
        : bubblesStartU;
      const pt = interpolateQuad(optU, rowV, corners.tl, corners.tr, corners.br, corners.bl);

      const darkness = sampleBubbleDarknessFromBuffer(data, width, height, pt.x, pt.y, bubbleRadius, sensitivity);
      optScores[opt] = darkness;
    }

    // Sort active options by darkness descending
    const sorted = [...optList].sort((a, b) => (optScores[b] || 0) - (optScores[a] || 0));
    const firstOpt = sorted[0];
    const secondOpt = sorted[1] || sorted[0];
    const others = sorted.slice(1);
    const otherMean = others.length > 0 
      ? (others.reduce((acc, o) => acc + (optScores[o] || 0), 0) / others.length) 
      : 0;

    const firstScore = optScores[firstOpt] || 0;
    const secondScore = optScores[secondOpt] || 0;
    const contrast = firstScore - otherMean;
    const lead = firstScore - secondScore;

    let detected = '';
    let confidence = 95;
    let flagged = false;

    // Detection Thresholds with Intra-Row Contrast:
    // 1. Clear Shaded Mark (Pencil / Pen / Marker)
    if (firstScore >= 4.2 && contrast >= 1.2 && lead >= 0.8) {
      detected = firstOpt;
      confidence = Math.min(99, Math.max(82, Math.round(80 + contrast * 1.8)));
      flagged = false;
      totalConfidenceScore += contrast;
      detectedCount++;
    } 
    // 2. Faint pencil mark with clear single selection
    else if (firstScore >= 3.2 && (firstScore >= secondScore * 1.30 || (contrast >= 1.0 && lead >= 0.6))) {
      detected = firstOpt;
      confidence = Math.min(94, Math.max(76, Math.round(75 + contrast * 1.5)));
      flagged = false;
      totalConfidenceScore += contrast;
      detectedCount++;
    } 
    // 3. Dense mark (e.g. Marker / Dark Ballpoint)
    else if (firstScore >= 8.0 && lead >= 0.6) {
      detected = firstOpt;
      confidence = 96;
      flagged = false;
      totalConfidenceScore += contrast;
      detectedCount++;
    } 
    // 4. Ambiguous multiple marks on same question row (e.g. erasure smudge or double shade)
    else if (firstScore >= 5.5 && secondScore >= 4.5 && lead < 1.2) {
      detected = firstOpt;
      confidence = 50;
      flagged = true;
      detectedCount++;
    } 
    // 5. Blank / Unshaded row
    else {
      detected = '';
      confidence = 90;
      flagged = false;
    }

    results.push({
      questionNumber: q,
      options: {
        A: Math.round(optScores.A || 0),
        B: Math.round(optScores.B || 0),
        C: Math.round(optScores.C || 0),
        D: Math.round(optScores.D || 0),
        ...(numOpts >= 5 ? { E: Math.round(optScores.E || 0) } : {})
      },
      detected,
      confidence,
      flagged
    });
  }

  return { results, totalConfidenceScore, detectedCount };
}

/**
 * HIGH-SPEED ADAPTIVE SCANNER CORE
 * Automatically tries multiple candidate column layouts and vertical margin offsets
 * to lock onto the true answer sheet grid regardless of paper header or photo distance.
 */
export function scanOMRFrameFromBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  questionsCount: number,
  corners?: { tl: { x: number; y: number }; tr: { x: number; y: number }; bl: { x: number; y: number }; br: { x: number; y: number } },
  targetKey?: AnswerKey | null,
  forceCols?: number,
  sensitivity: ScanSensitivity = 'normal'
): QuestionConfidence[] {
  const tl = corners?.tl || { x: width * 0.04, y: height * 0.04 };
  const tr = corners?.tr || { x: width * 0.96, y: height * 0.04 };
  const bl = corners?.bl || { x: width * 0.04, y: height * 0.96 };
  const br = corners?.br || { x: width * 0.96, y: height * 0.96 };
  const cornerObj = { tl, tr, bl, br };
  const optCount = targetKey?.optionsCount || 4;

  const candidateTopMargins = [0.05, 0.10, 0.16, 0.22];
  const candidateBottomMargins = [0.95, 0.89];
  const candidateOffsets = [
    { start: optCount === 3 ? 0.32 : (optCount === 5 ? 0.26 : 0.30), end: optCount === 5 ? 0.96 : 0.94 },
    { start: 0.22, end: 0.96 }
  ];

  const colCandidates = forceCols 
    ? [forceCols] 
    : (questionsCount <= 12 ? [1, 2] : (questionsCount <= 30 ? [2, 1, 3] : [2, 3, 4]));

  let bestResult: QuestionConfidence[] = [];
  let bestScore = -1;

  for (const cols of colCandidates) {
    for (const topV of candidateTopMargins) {
      for (const botV of candidateBottomMargins) {
        if (botV <= topV + 0.3) continue;

        for (const offset of candidateOffsets) {
          const evalRes = evaluateLayoutWithMargins(
            data, 
            width, 
            height, 
            questionsCount, 
            cols, 
            cornerObj, 
            optCount, 
            sensitivity,
            topV,
            botV,
            offset.start,
            offset.end
          );

          // Score this candidate configuration
          const score = (evalRes.detectedCount * 100) + evalRes.totalConfidenceScore;
          if (score > bestScore) {
            bestScore = score;
            bestResult = evalRes.results;
          }
        }
      }
    }
  }

  return bestResult.length > 0 ? bestResult : evaluateLayoutWithMargins(data, width, height, questionsCount, 2, cornerObj, optCount, sensitivity).results;
}

/**
 * Scans an OMR canvas frame by extracting a single ImageData buffer.
 */
export function scanOMRFrameFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  questionsCount: number,
  corners?: { tl: { x: number; y: number }; tr: { x: number; y: number }; bl: { x: number; y: number }; br: { x: number; y: number } },
  targetKey?: AnswerKey | null,
  forceCols?: number,
  sensitivity: ScanSensitivity = 'normal'
): QuestionConfidence[] {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    return scanOMRFrameFromBuffer(imgData.data, width, height, questionsCount, corners, targetKey, forceCols, sensitivity);
  } catch (e) {
    console.warn('Canvas scan readback error:', e);
    return [];
  }
}

/**
 * Processes a captured/uploaded OMR student answer sheet image with Computer Vision.
 * Automatically aligns sheet margins, searches multi-scale candidate bounding boxes,
 * and extracts all marked bubble answers with high fidelity.
 */
export async function processOMRSheetImage(
  imageSource: string,
  cornerAnchors?: CornerAnchor[],
  questionsCount?: number,
  targetKey?: AnswerKey,
  forceCols?: number,
  sensitivity: ScanSensitivity = 'normal'
): Promise<QuestionConfidence[]> {
  const finalQCount = targetKey?.questionsCount || questionsCount || 20;
  const optCount = targetKey?.optionsCount || 4;

  try {
    const img = await loadImage(imageSource);

    const canvas = document.createElement('canvas');
    // High-resolution processing buffer (1000 x 1400) for crisp bubble reading
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    // Draw image onto processing canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Check if explicit teacher-dragged corner anchors were provided
    let hasCustomAnchors = false;
    const anchorMap = new Map<string, { x: number; y: number }>();

    if (cornerAnchors && cornerAnchors.length === 4) {
      // Check if corners are customized beyond standard defaults
      hasCustomAnchors = cornerAnchors.some(a => 
        (a.id === 'TL' && (Math.abs(a.x - 12) > 3 || Math.abs(a.y - 12) > 3)) ||
        (a.id === 'TR' && (Math.abs(a.x - 88) > 3 || Math.abs(a.y - 12) > 3)) ||
        (a.id === 'BL' && (Math.abs(a.x - 12) > 3 || Math.abs(a.y - 88) > 3)) ||
        (a.id === 'BR' && (Math.abs(a.x - 88) > 3 || Math.abs(a.y - 88) > 3))
      );

      if (hasCustomAnchors) {
        cornerAnchors.forEach(a => {
          anchorMap.set(a.id, {
            x: (a.x / 100) * canvas.width,
            y: (a.y / 100) * canvas.height
          });
        });
      }
    }

    if (hasCustomAnchors) {
      const corners = {
        tl: anchorMap.get('TL') || { x: canvas.width * 0.04, y: canvas.height * 0.04 },
        tr: anchorMap.get('TR') || { x: canvas.width * 0.96, y: canvas.height * 0.04 },
        bl: anchorMap.get('BL') || { x: canvas.width * 0.04, y: canvas.height * 0.96 },
        br: anchorMap.get('BR') || { x: canvas.width * 0.96, y: canvas.height * 0.96 }
      };
      return scanOMRFrameFromCanvas(ctx, canvas.width, canvas.height, finalQCount, corners, targetKey, forceCols, sensitivity);
    }

    // Auto-adaptive multi-margin boundary search for snapped / uploaded photos
    const candidateMargins = [0.02, 0.05, 0.09, 0.14, 0.18];
    let bestResults: QuestionConfidence[] = [];
    let bestScore = -1;

    for (const m of candidateMargins) {
      const corners = {
        tl: { x: canvas.width * m, y: canvas.height * m },
        tr: { x: canvas.width * (1 - m), y: canvas.height * m },
        bl: { x: canvas.width * m, y: canvas.height * (1 - m) },
        br: { x: canvas.width * (1 - m), y: canvas.height * (1 - m) }
      };

      const results = scanOMRFrameFromCanvas(ctx, canvas.width, canvas.height, finalQCount, corners, targetKey, forceCols, sensitivity);
      const detectedCount = results.filter(r => r.detected !== '').length;
      const confidenceSum = results.reduce((acc, curr) => acc + (curr.detected ? curr.confidence : 0), 0);
      const score = (detectedCount * 100) + confidenceSum;

      if (score > bestScore) {
        bestScore = score;
        bestResults = results;
      }
    }

    return bestResults.length > 0 ? bestResults : Array.from({ length: finalQCount }, (_, i) => ({
      questionNumber: i + 1,
      options: { A: 0, B: 0, C: 0, D: 0, ...(optCount >= 5 ? { E: 0 } : {}) },
      detected: '',
      confidence: 50,
      flagged: false
    }));
  } catch (error) {
    console.warn('OMR image scan error, returning fallback confidence list:', error);
    return Array.from({ length: finalQCount }, (_, i) => ({
      questionNumber: i + 1,
      options: { A: 0, B: 0, C: 0, D: 0, ...(optCount >= 5 ? { E: 0 } : {}) },
      detected: '',
      confidence: 50,
      flagged: false
    }));
  }
}

/**
 * Generates realistic student response datasets for simulation / audit testing.
 */
export function simulateStudentSheet(
  preset: ScanPreset,
  targetKey?: AnswerKey | null,
  questionCountFallback?: number
): QuestionConfidence[] {
  const count = targetKey?.questionsCount || questionCountFallback || 20;
  const optCount = targetKey?.optionsCount || 4;
  const confLog: QuestionConfidence[] = [];

  const allOptions: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
  const optionsArr = allOptions.slice(0, optCount);

  for (let q = 1; q <= count; q++) {
    const correctOpt = getEffectiveKeyAnswer(targetKey, q);

    if (preset === 'sim_perfect') {
      const opts: { [key: string]: number } = { A: 4, B: 3, C: 4, D: 3 };
      if (optCount >= 5) opts.E = 3;
      opts[correctOpt] = 98;
      confLog.push({
        questionNumber: q,
        options: opts as any,
        detected: correctOpt,
        confidence: 98,
        flagged: false
      });
    } else if (preset === 'sim_audit' && (q === 5 || q === 17)) {
      const otherOpt = correctOpt === 'A' ? 'B' : 'A';
      const opts: { [key: string]: number } = { A: 6, B: 5, C: 6, D: 5 };
      if (optCount >= 5) opts.E = 5;
      opts[correctOpt] = 52;
      opts[otherOpt] = 48;

      confLog.push({
        questionNumber: q,
        options: opts as any,
        detected: correctOpt,
        confidence: 48,
        flagged: true
      });
    } else if (preset === 'sim_struggling') {
      const isCorrect = (q % 2 === 1);
      let chosenOpt = correctOpt;
      if (!isCorrect) {
        const wrongChoices = optionsArr.filter(o => o !== correctOpt);
        chosenOpt = wrongChoices[(q * 3) % wrongChoices.length] || optionsArr[0];
      }

      const opts: { [key: string]: number } = { A: 5, B: 6, C: 4, D: 5 };
      if (optCount >= 5) opts.E = 5;
      opts[chosenOpt] = 92;

      confLog.push({
        questionNumber: q,
        options: opts as any,
        detected: chosenOpt,
        confidence: 92,
        flagged: false
      });
    } else {
      // 'sim_realistic'
      const isMistake = (q === 3 || q === 8 || q === 18 || (count >= 25 && q === 24));
      const isBlank = (q === 14 && count >= 20);

      let chosenOpt = correctOpt;
      if (isBlank) {
        chosenOpt = '';
      } else if (isMistake) {
        const wrongChoices = optionsArr.filter(o => o !== correctOpt);
        chosenOpt = wrongChoices[q % wrongChoices.length] || optionsArr[0];
      }

      const opts: { [key: string]: number } = { A: 4, B: 5, C: 3, D: 4 };
      if (optCount >= 5) opts.E = 4;
      if (chosenOpt) {
        opts[chosenOpt] = 96;
      }

      confLog.push({
        questionNumber: q,
        options: opts as any,
        detected: chosenOpt,
        confidence: isBlank ? 90 : 96,
        flagged: false
      });
    }
  }

  return confLog;
}
