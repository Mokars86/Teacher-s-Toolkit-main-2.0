import { GradedResult, ClassSettings } from '../types';

export function getLetterGrade(percentage: number, gradingScale = { A: 80, B: 70, C: 60 }): { grade: string; text: string; color: string; bg: string } {
  if (percentage >= gradingScale.A) {
    return { grade: 'A', text: 'Distinction / Excellent', color: '#059669', bg: '#ecfdf5' };
  } else if (percentage >= gradingScale.B) {
    return { grade: 'B', text: 'Good / Proficient', color: '#2563eb', bg: '#eff6ff' };
  } else if (percentage >= gradingScale.C) {
    return { grade: 'C', text: 'Satisfactory / Pass', color: '#d97706', bg: '#fffbeb' };
  } else {
    return { grade: 'D', text: 'Needs Improvement', color: '#dc2626', bg: '#fef2f2' };
  }
}

/**
 * Aggregates sequential correct question numbers into concise ranges (e.g., "1–12, 14–28").
 */
export function formatSequentialCorrectRanges(
  result: GradedResult,
  masterKeyAnswers: { [key: number]: string } = {}
): string {
  const correctNums: number[] = [];
  const total = result.totalQuestions || 10;

  for (let q = 1; q <= total; q++) {
    const studentAns = (result.answers[q] || '').trim().toUpperCase();
    const keyAns = (masterKeyAnswers[q] || 'A').trim().toUpperCase();
    if (studentAns && studentAns === keyAns) {
      correctNums.push(q);
    }
  }

  if (correctNums.length === 0) return 'None';
  if (correctNums.length === total) return `1–${total} (All Correct)`;

  const ranges: string[] = [];
  let start = correctNums[0];
  let prev = correctNums[0];

  for (let i = 1; i < correctNums.length; i++) {
    const curr = correctNums[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
      start = curr;
      prev = curr;
    }
  }
  ranges.push(start === prev ? `${start}` : `${start}–${prev}`);

  return ranges.join(', ');
}

export interface DiagnosticItem {
  questionNumber: number;
  studentAns: string;
  keyAns: string;
  diagnostic: string;
}

/**
 * Returns itemized missed/incorrect question diagnostics.
 */
export function getItemizedDiagnostics(
  result: GradedResult,
  masterKeyAnswers: { [key: number]: string } = {}
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const total = result.totalQuestions || 10;

  for (let q = 1; q <= total; q++) {
    const studentAns = (result.answers[q] || '').trim().toUpperCase();
    const keyAns = (masterKeyAnswers[q] || 'A').trim().toUpperCase();
    
    if (!studentAns || studentAns !== keyAns) {
      let diag = '';
      if (!studentAns || studentAns === '—' || studentAns === 'BLANK') {
        diag = `Blank / Missed (Key: [${keyAns}])`;
      } else if (studentAns === 'MULTIPLE') {
        diag = `Multiple bubbles marked (Key: [${keyAns}])`;
      } else {
        diag = `Student chose [${studentAns}], Correct Key was [${keyAns}]`;
      }

      diagnostics.push({
        questionNumber: q,
        studentAns: studentAns || '—',
        keyAns: keyAns,
        diagnostic: diag,
      });
    }
  }

  return diagnostics;
}

/**
 * Calculates score conversion (e.g., 32/40 -> 24/30).
 */
export function calculateScoreConversion(
  score: number,
  totalQuestions: number,
  targetScale: number = 30
): {
  rawScore: number;
  rawTotal: number;
  convertedScore: number;
  targetScale: number;
  percentage: number;
  conversionString: string;
} {
  const rawTotal = totalQuestions > 0 ? totalQuestions : 1;
  const percentage = Math.round((score / rawTotal) * 100);
  const convertedScore = Math.round(((score / rawTotal) * targetScale) * 10) / 10;
  const conversionString = `${score}/${rawTotal} ➔ ${convertedScore}/${targetScale}`;

  return {
    rawScore: score,
    rawTotal,
    convertedScore,
    targetScale,
    percentage,
    conversionString,
  };
}

export function formatGradeSlipText(
  result: GradedResult,
  masterKeyAnswers: { [key: number]: string } = {},
  targetScale: number = 30
): string {
  const { grade, text: gradeText } = getLetterGrade(result.percentage);
  const correctCount = result.score;
  const incorrectCount = result.totalQuestions - result.score;
  const conv = calculateScoreConversion(result.score, result.totalQuestions, targetScale);
  const correctRanges = formatSequentialCorrectRanges(result, masterKeyAnswers);
  const diagnostics = getItemizedDiagnostics(result, masterKeyAnswers);

  let text = `========================================\n`;
  text += `🎓 TEACHER'S TOOLKIT • MINI FEEDBACK SLIP\n`;
  text += `========================================\n`;
  text += `👤 Candidate: ${result.candidateName}\n`;
  text += `🆔 Index Number: ${result.candidateId || 'N/A'}\n`;
  text += `🏫 Class: ${result.className || 'General'}\n`;
  text += `📝 Subject / Exam: ${result.testName || 'OMR Exam'}\n`;
  text += `📅 Date: ${result.scannedAt || new Date().toLocaleDateString()}\n`;
  text += `----------------------------------------\n`;
  text += `📊 Performance: ${conv.conversionString} (${result.percentage}%)\n`;
  text += `🎖️ Grade: ${grade} (${gradeText})\n`;
  text += `✅ Correct (${correctCount}): ${correctRanges}\n`;
  text += `----------------------------------------\n`;
  text += `❌ Missed Questions & Diagnostics (${incorrectCount}):\n`;
  
  if (diagnostics.length === 0) {
    text += `  • All questions answered correctly! Perfect sheet.\n`;
  } else {
    diagnostics.forEach(d => {
      text += `  • Q${d.questionNumber}: ${d.diagnostic}\n`;
    });
  }

  text += `========================================\n`;
  text += `✨ Verified Assessment Record • Mokars Tech\n`;
  text += `========================================`;

  return text;
}

/**
 * Generates an executive single student grade slip on canvas.
 */
export async function generateGradeSlipCanvas(
  result: GradedResult,
  masterKeyAnswers: { [key: number]: string } = {},
  options?: { schoolName?: string; targetScale?: number }
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 840;
  const questionsCount = result.totalQuestions || 10;
  const cols = questionsCount > 25 ? 3 : 2;
  const rows = Math.ceil(questionsCount / cols);
  const height = 540 + rows * 38 + 90;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const { grade, text: gradeDesc, color: gradeColor } = getLetterGrade(result.percentage);
  const targetScale = options?.targetScale || 30;
  const conv = calculateScoreConversion(result.score, result.totalQuestions, targetScale);

  // Background pattern
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Main Card Container with soft shadow effect
  const cardX = 24;
  const cardY = 24;
  const cardW = width - 48;
  const cardH = height - 48;
  const radius = 28;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header Banner with vibrant emerald gradient
  const headerH = 120;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, headerH, [radius, radius, 0, 0]);
  ctx.clip();
  
  const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(0.4, '#047857');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.fillRect(cardX, cardY, cardW, headerH);

  // School crest / icon badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(cardX + 54, cardY + 60, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎓', cardX + 54, cardY + 68);
  ctx.textAlign = 'left';

  // Header branding text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(options?.schoolName || "TEACHER'S TOOLKIT ACADEMY", cardX + 96, cardY + 46);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('OFFICIAL CANDIDATE ASSESSMENT & PERFORMANCE REPORT', cardX + 96, cardY + 74);

  // Security Seal pill on header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.roundRect(cardX + cardW - 170, cardY + 36, 140, 42, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OMR VERIFIED ✔', cardX + cardW - 100, cardY + 62);
  ctx.textAlign = 'left';
  ctx.restore();

  // Student Info Row
  let currentY = cardY + headerH + 34;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(result.candidateName || 'Candidate', cardX + 32, currentY);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Index No: ${result.candidateId || 'N/A'}   •   Subject: ${result.testName || 'Assessment'}   •   ${result.scannedAt || new Date().toLocaleDateString()}`, cardX + 32, currentY + 24);

  // Performance Summary Banner
  currentY += 46;
  const bannerW = cardW - 64;
  const bannerH = 92;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(cardX + 32, currentY, bannerW, bannerH, 16);
  ctx.fill();
  ctx.stroke();

  // Grade Letter Badge
  ctx.fillStyle = gradeColor;
  ctx.beginPath();
  ctx.roundRect(cardX + 48, currentY + 16, 60, 60, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(grade, cardX + 78, currentY + 58);
  ctx.textAlign = 'left';

  // Conversion Display: e.g. 32/40 -> 24/30 (80%)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${result.score} / ${result.totalQuestions}`, cardX + 124, currentY + 40);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`➔  ${conv.convertedScore} / ${targetScale}  (${result.percentage}%)`, cardX + 230, currentY + 40);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Evaluation: ${gradeDesc}   •   Scaled Weight: ${targetScale} Marks`, cardX + 124, currentY + 66);

  // Correct range summary
  currentY += bannerH + 24;
  const correctRanges = formatSequentialCorrectRanges(result, masterKeyAnswers);
  ctx.fillStyle = '#f0fdf4';
  ctx.strokeStyle = '#bbf7d0';
  ctx.beginPath();
  ctx.roundRect(cardX + 32, currentY, bannerW, 40, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#15803d';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`✔ Correct Answers (${result.score}): ${correctRanges}`, cardX + 46, currentY + 25);

  // Question Log Section
  currentY += 54;
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('ITEMIZED QUESTION LOG & MARK VERIFICATION', cardX + 32, currentY);

  currentY += 14;
  const colGap = 12;
  const colW = (cardW - 64 - (cols - 1) * colGap) / cols;

  for (let q = 1; q <= questionsCount; q++) {
    const colIdx = (q - 1) % cols;
    const rowIdx = Math.floor((q - 1) / cols);
    const qX = cardX + 32 + colIdx * (colW + colGap);
    const qY = currentY + rowIdx * 38;

    const studentAns = (result.answers[q] || '—').trim().toUpperCase();
    const keyAns = (masterKeyAnswers[q] || 'A').trim().toUpperCase();
    const isCorrect = studentAns === keyAns;

    ctx.fillStyle = isCorrect ? '#f0fdf4' : '#fef2f2';
    ctx.strokeStyle = isCorrect ? '#bbf7d0' : '#fecaca';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(qX, qY, colW, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Q${q.toString().padStart(2, '0')}`, qX + 10, qY + 19);

    if (isCorrect) {
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`[ ${studentAns} ]  ✔ Correct`, qX + colW - 10, qY + 19);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`[ ${studentAns} ]  ✖ (Key: ${keyAns})`, qX + colW - 10, qY + 19);
      ctx.textAlign = 'left';
    }
  }

  // Footer
  const footerY = cardY + cardH - 24;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("Generated with Teacher's Toolkit • Speed-Ink Computer Vision Engine • Mokars Tech", width / 2, footerY);

  return canvas.toDataURL('image/png');
}

/**
 * Generates an ultra-high-resolution 4-on-1 A4 Sheet Canvas.
 * Fits 4 mini feedback slips in a 2x2 grid with clean dashed cut-out borders,
 * staple target guides, School Crest, score conversions, and itemized split correction tables.
 */
export async function generate4On1GradeSlipCanvas(
  results: GradedResult[],
  masterKeyAnswersMap: { [key: number]: string } | { [resId: string]: { [key: number]: string } } = {},
  options?: {
    schoolName?: string;
    targetScale?: number;
  }
): Promise<string> {
  const canvas = document.createElement('canvas');
  // High-DPI A4 standard aspect (1240 x 1754 px at 150 DPI or 1600 x 2262)
  const width = 1600;
  const height = 2262;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const schoolName = options?.schoolName || "ST. AUGUSTINE'S COLLEGE / BASIC SCHOOL";
  const targetScale = options?.targetScale || 30;

  // Background clean white A4
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Margins and Grid Dimensions
  const margin = 36;
  const halfW = (width - margin * 2) / 2;
  const halfH = (height - margin * 2) / 2;

  // Prepare up to 4 results (replicate if only 1 is given for single-candidate 4-up mode)
  const displayResults: GradedResult[] = [];
  if (results.length === 1) {
    displayResults.push(results[0], results[0], results[0], results[0]);
  } else {
    for (let i = 0; i < 4; i++) {
      if (results[i]) {
        displayResults.push(results[i]);
      } else if (results[0]) {
        displayResults.push(results[0]);
      }
    }
  }

  // Draw 4 mini slips
  const positions = [
    { x: margin, y: margin, col: 0, row: 0 },
    { x: margin + halfW, y: margin, col: 1, row: 0 },
    { x: margin, y: margin + halfH, col: 0, row: 1 },
    { x: margin + halfW, y: margin + halfH, col: 1, row: 1 },
  ];

  for (let i = 0; i < 4; i++) {
    const res = displayResults[i];
    if (!res) continue;
    const pos = positions[i];
    const boxX = pos.x + 8;
    const boxY = pos.y + 8;
    const boxW = halfW - 16;
    const boxH = halfH - 16;

    // Resolve key
    let keyAnswers: { [key: number]: string } = {};
    if (masterKeyAnswersMap && typeof masterKeyAnswersMap === 'object') {
      if (res.id in masterKeyAnswersMap) {
        keyAnswers = (masterKeyAnswersMap as any)[res.id];
      } else {
        keyAnswers = masterKeyAnswersMap as { [key: number]: string };
      }
    }

    const { grade, text: gradeText, color: gradeColor } = getLetterGrade(res.percentage);
    const conv = calculateScoreConversion(res.score, res.totalQuestions, targetScale);
    const correctRanges = formatSequentialCorrectRanges(res, keyAnswers);
    const diagnostics = getItemizedDiagnostics(res, keyAnswers);

    // Mini slip boundary container
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Staple Guide in Top-Left Corner
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX + 12, boxY + 12, 68, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📎 STAPLE', boxX + 46, boxY + 26);
    ctx.textAlign = 'left';

    // Header Block: School Crest + Name + Candidate Details
    const headerTop = boxY + 38;
    
    // Crest Emblem
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(boxX + 32, headerTop + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎓', boxX + 32, headerTop + 22);
    ctx.textAlign = 'left';

    // School Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(schoolName.slice(0, 36), boxX + 60, headerTop + 14);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('OFFICIAL MINI FEEDBACK SLIP • EXAM ASSESSMENT', boxX + 60, headerTop + 28);

    // Student & Subject Info Meta Grid
    const infoY = headerTop + 42;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(boxX + 12, infoY, boxW - 24, 52, 8);
    ctx.fill();
    ctx.stroke();

    // Student Name & Index
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(res.candidateName || 'Candidate', boxX + 22, infoY + 20);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Index: ${res.candidateId || 'N/A'}  •  Class: ${res.className || 'General'}`, boxX + 22, infoY + 38);

    // Subject & Date
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(res.testName || 'Examination', boxX + boxW - 22, infoY + 20);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(res.scannedAt?.split(' ')[0] || new Date().toLocaleDateString(), boxX + boxW - 22, infoY + 38);
    ctx.textAlign = 'left';

    // Performance Summary Banner (e.g. 32/40 -> 24/30 (80%))
    const bannerY = infoY + 60;
    const bannerH = 68;

    ctx.fillStyle = '#ecfdf5';
    ctx.strokeStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.roundRect(boxX + 12, bannerY, boxW - 24, bannerH, 10);
    ctx.fill();
    ctx.stroke();

    // Grade pill
    ctx.fillStyle = gradeColor;
    ctx.beginPath();
    ctx.roundRect(boxX + 22, bannerY + 12, 44, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(grade, boxX + 44, bannerY + 43);
    ctx.textAlign = 'left';

    // Score conversion text
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${res.score} / ${res.totalQuestions}  ➔  ${conv.convertedScore} / ${targetScale}`, boxX + 78, bannerY + 28);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Percentage: ${res.percentage}%  •  ${gradeText}`, boxX + 78, bannerY + 48);

    // Itemized Correction Table Split Data Box
    const tableY = bannerY + bannerH + 12;
    const tableH = boxH - (tableY - boxY) - 34;
    const colSplitW = (boxW - 32) / 2;

    // Left Column: Correct Answers Box
    ctx.fillStyle = '#f0fdf4';
    ctx.strokeStyle = '#bbf7d0';
    ctx.beginPath();
    ctx.roundRect(boxX + 12, tableY, colSplitW, tableH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`✔ Correct Items (${res.score}/${res.totalQuestions})`, boxX + 20, tableY + 20);

    ctx.fillStyle = '#166534';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    
    // Wrap correct ranges into box
    const rangeLines = wrapText(ctx, correctRanges, colSplitW - 16);
    let lineY = tableY + 38;
    for (const line of rangeLines.slice(0, 6)) {
      ctx.fillText(line, boxX + 20, lineY);
      lineY += 16;
    }

    // Right Column: Missed Questions & Diagnostics
    const rightColX = boxX + 16 + colSplitW;
    const isPerfect = diagnostics.length === 0;

    ctx.fillStyle = isPerfect ? '#f0fdf4' : '#fef2f2';
    ctx.strokeStyle = isPerfect ? '#bbf7d0' : '#fecaca';
    ctx.beginPath();
    ctx.roundRect(rightColX, tableY, colSplitW, tableH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isPerfect ? '#15803d' : '#b91c1c';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`✖ Missed & Diagnostics (${res.totalQuestions - res.score})`, rightColX + 8, tableY + 20);

    ctx.fillStyle = '#7f1d1d';
    ctx.font = '10px system-ui, -apple-system, sans-serif';

    if (isPerfect) {
      ctx.fillStyle = '#15803d';
      ctx.fillText('🌟 Perfect Score! No errors.', rightColX + 8, tableY + 40);
    } else {
      let diagY = tableY + 36;
      for (let dIdx = 0; dIdx < Math.min(diagnostics.length, 5); dIdx++) {
        const d = diagnostics[dIdx];
        const diagShort = `Q${d.questionNumber}: Chose [${d.studentAns}], Key [${d.keyAns}]`;
        ctx.fillText(diagShort, rightColX + 8, diagY);
        diagY += 16;
      }
      if (diagnostics.length > 5) {
        ctx.fillStyle = '#991b1b';
        ctx.font = 'italic 9px system-ui, sans-serif';
        ctx.fillText(`+ ${diagnostics.length - 5} more errors on sheet`, rightColX + 8, diagY);
      }
    }

    // Mini Slip Footer
    const slipFooterY = boxY + boxH - 12;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Teacher's Toolkit Speed-Ink OMR • Slip #${i + 1} of 4 • Mokars Tech`, boxX + boxW / 2, slipFooterY);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  // --- STAPLE CUT-OUT BORDER (Dashed dividing lines with scissor icons) ---
  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);

  // Center Vertical Line
  ctx.beginPath();
  ctx.moveTo(margin + halfW, margin);
  ctx.lineTo(margin + halfW, height - margin);
  ctx.stroke();

  // Center Horizontal Line
  ctx.beginPath();
  ctx.moveTo(margin, margin + halfH);
  ctx.lineTo(width - margin, margin + halfH);
  ctx.stroke();

  // Scissor Cut-out Markers along cut lines
  ctx.setLineDash([]);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';

  // Top and bottom vertical cuts
  ctx.fillText('✂ Cut along dashed line', margin + halfW, margin - 10);
  ctx.fillText('✂ Cut along dashed line', margin + halfW, height - margin + 20);

  // Left and right horizontal cuts
  ctx.save();
  ctx.translate(margin - 12, margin + halfH);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('✂ Cut Line', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(width - margin + 20, margin + halfH);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('✂ Cut Line', 0, 0);
  ctx.restore();

  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Text wrapping helper for canvas rendering.
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Prints 4-on-1 Mini Feedback Slips with dedicated A4 print stylesheet,
 * staple corner zones, and dashed cutting guides.
 */
export function print4On1GradeSlips(
  results: GradedResult[],
  masterKeyAnswersMap: { [key: number]: string } | { [resId: string]: { [key: number]: string } } = {},
  options?: {
    schoolName?: string;
    targetScale?: number;
  }
) {
  const schoolName = options?.schoolName || "ST. AUGUSTINE'S COLLEGE / BASIC SCHOOL";
  const targetScale = options?.targetScale || 30;

  // Group into pages of 4 slips each
  const pages: GradedResult[][] = [];
  if (results.length === 1) {
    pages.push([results[0], results[0], results[0], results[0]]);
  } else {
    for (let i = 0; i < results.length; i += 4) {
      pages.push(results.slice(i, i + 4));
    }
  }

  const pagesHtml = pages.map((pageResults, pageIdx) => {
    // Fill up to 4 items if last page is partial
    const slips = [...pageResults];
    while (slips.length < 4 && results[0]) {
      slips.push(results[0]);
    }

    const slipsHtml = slips.map((res, slipIdx) => {
      let keyAnswers: { [key: number]: string } = {};
      if (masterKeyAnswersMap && typeof masterKeyAnswersMap === 'object') {
        if (res.id in masterKeyAnswersMap) {
          keyAnswers = (masterKeyAnswersMap as any)[res.id];
        } else {
          keyAnswers = masterKeyAnswersMap as { [key: number]: string };
        }
      }

      const { grade, text: gradeText, color: gradeColor } = getLetterGrade(res.percentage);
      const conv = calculateScoreConversion(res.score, res.totalQuestions, targetScale);
      const correctRanges = formatSequentialCorrectRanges(res, keyAnswers);
      const diagnostics = getItemizedDiagnostics(res, keyAnswers);

      return `
        <div class="mini-slip">
          <!-- Staple Guide -->
          <div class="staple-tag">📎 STAPLE HERE</div>

          <!-- Header Block -->
          <div class="slip-header">
            <div class="crest-icon">🎓</div>
            <div class="header-text">
              <div class="school-name">${schoolName}</div>
              <div class="slip-title">OFFICIAL MINI FEEDBACK SLIP</div>
            </div>
          </div>

          <!-- Student & Exam Details -->
          <div class="meta-card">
            <div class="meta-left">
              <div class="student-name">${res.candidateName}</div>
              <div class="student-sub">Index: <strong>${res.candidateId || 'N/A'}</strong> • Class: ${res.className || 'General'}</div>
            </div>
            <div class="meta-right">
              <div class="exam-title">${res.testName || 'Exam'}</div>
              <div class="exam-date">${res.scannedAt?.split(' ')[0] || new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <!-- Performance Summary Banner -->
          <div class="perf-banner">
            <div class="grade-badge" style="background-color: ${gradeColor};">${grade}</div>
            <div class="score-conversion">
              <div class="conv-nums">${res.score}/${res.totalQuestions} ➔ ${conv.convertedScore}/${targetScale}</div>
              <div class="conv-label">Score: <strong>${res.percentage}%</strong> • ${gradeText}</div>
            </div>
          </div>

          <!-- Itemized Correction Table -->
          <div class="split-table">
            <!-- Correct Sequence -->
            <div class="table-col correct-col">
              <div class="col-title">✔ Correct (${res.score}/${res.totalQuestions})</div>
              <div class="col-body">${correctRanges}</div>
            </div>

            <!-- Missed & Diagnostics -->
            <div class="table-col error-col">
              <div class="col-title">✖ Missed (${res.totalQuestions - res.score})</div>
              <div class="col-body">
                ${diagnostics.length === 0 
                  ? '<div style="color:#15803d; font-weight:bold;">Perfect 100%! All correct.</div>' 
                  : diagnostics.slice(0, 4).map(d => `<div class="diag-row">Q${d.questionNumber}: Chose <strong>[${d.studentAns}]</strong>, Key <strong>[${d.keyAns}]</strong></div>`).join('') + (diagnostics.length > 4 ? `<div class="more-tag">+ ${diagnostics.length - 4} more errors</div>` : '')}
              </div>
            </div>
          </div>

          <!-- Slip Cut-Out Border Staple Note -->
          <div class="slip-footer">
            <span>Teacher's Toolkit Speed-Ink OMR</span> • <span>Slip #${slipIdx + 1}</span> • <span>Mokars Tech</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="a4-page">
        <div class="cut-guide-h"><span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span></div>
        <div class="cut-guide-v"><span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span></div>
        <div class="slips-grid">
          ${slipsHtml}
        </div>
      </div>
    `;
  }).join('');

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print 4-on-1 Feedback Slips - Teacher's Toolkit</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
          }
          .a4-page {
            position: relative;
            width: 198mm;
            height: 284mm;
            page-break-after: always;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cut-guide-h {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            transform: translateY(-50%);
            pointer-events: none;
            z-index: 10;
            border-top: 1.5px dashed #94a3b8;
            padding-top: 2px;
          }
          .cut-guide-v {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 1px;
            border-left: 1.5px dashed #94a3b8;
            pointer-events: none;
            z-index: 10;
          }
          .slips-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            width: 100%;
            height: 100%;
            gap: 6mm;
          }
          .mini-slip {
            position: relative;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 12px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .staple-tag {
            position: absolute;
            top: 6px;
            left: 8px;
            background: #f1f5f9;
            border: 1px solid #94a3b8;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 8px;
            font-weight: 800;
            color: #475569;
          }
          .slip-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 18px;
          }
          .crest-icon {
            width: 28px;
            height: 28px;
            background: #065f46;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            shrink: 0;
          }
          .school-name {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
          }
          .slip-title {
            font-size: 8px;
            font-weight: 700;
            color: #059669;
            letter-spacing: 0.5px;
          }
          .meta-card {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 8px;
            margin-top: 6px;
          }
          .student-name {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
          }
          .student-sub {
            font-size: 8.5px;
            color: #64748b;
          }
          .meta-right {
            text-align: right;
          }
          .exam-title {
            font-size: 9.5px;
            font-weight: 700;
            color: #1e293b;
          }
          .exam-date {
            font-size: 8.5px;
            color: #64748b;
          }
          .perf-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            padding: 6px 8px;
            margin-top: 6px;
          }
          .grade-badge {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            color: white;
            font-size: 18px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            shrink: 0;
          }
          .conv-nums {
            font-size: 12px;
            font-weight: 800;
            color: #064e3b;
          }
          .conv-label {
            font-size: 9px;
            color: #047857;
          }
          .split-table {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-top: 6px;
            flex: 1;
          }
          .table-col {
            border-radius: 6px;
            padding: 6px 8px;
            font-size: 8.5px;
          }
          .correct-col {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
          }
          .error-col {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
          }
          .col-title {
            font-weight: 800;
            font-size: 9px;
            margin-bottom: 4px;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            padding-bottom: 2px;
          }
          .col-body {
            line-height: 1.35;
          }
          .diag-row {
            margin-bottom: 2px;
          }
          .more-tag {
            font-size: 8px;
            font-style: italic;
            opacity: 0.8;
          }
          .slip-footer {
            text-align: center;
            font-size: 7.5px;
            color: #94a3b8;
            margin-top: 6px;
            border-top: 1px solid #f1f5f9;
            padding-top: 4px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.write(printHtml);
    printWin.document.close();
  }
}

/**
 * Robust image downloader helper
 */
export async function downloadGradeSlipImage(dataUrl: string, fileName: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }, 1500);

    return true;
  } catch (err) {
    console.warn('Blob download fallback:', err);
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 500);
      return true;
    } catch (e2) {
      console.error('Download error:', e2);
      return false;
    }
  }
}

export const downloadDataUrl = downloadGradeSlipImage;

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/png' });
}

export async function shareGradeSlip(
  result: GradedResult,
  masterKeyAnswers: { [key: number]: string } = {},
  options?: { schoolName?: string; targetScale?: number }
): Promise<{ success: boolean; method: string; message: string }> {
  const shareText = formatGradeSlipText(result, masterKeyAnswers, options?.targetScale);
  const fileName = `${result.candidateName.replace(/\s+/g, '_')}_GradeSlip.png`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      let imageFile: File | null = null;
      try {
        const dataUrl = await generateGradeSlipCanvas(result, masterKeyAnswers, options);
        if (dataUrl) {
          imageFile = await dataUrlToFile(dataUrl, fileName);
        }
      } catch (e) {
        console.warn('Could not create file for share:', e);
      }

      const sharePayload: ShareData = {
        title: `${result.candidateName} - Mini Feedback Slip`,
        text: shareText,
      };

      if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        sharePayload.files = [imageFile];
      }

      await navigator.share(sharePayload);
      return { success: true, method: 'native_share', message: 'Feedback slip shared successfully!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'cancelled', message: 'Share was cancelled' };
      }
      console.warn('Native share error:', err);
    }
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      return {
        success: true,
        method: 'clipboard',
        message: 'Feedback slip text copied to clipboard! You can paste it anywhere.',
      };
    }
  } catch (err) {
    console.error('Clipboard error:', err);
  }

  return {
    success: false,
    method: 'fallback',
    message: 'Unable to open share sheet. You can download the Feedback Slip image directly.',
  };
}

export function printGradeSlip(result: GradedResult, masterKeyAnswers: { [key: number]: string } = {}) {
  print4On1GradeSlips([result], masterKeyAnswers);
}
