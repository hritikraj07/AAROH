import { Notice } from '../types';

/**
 * Offline Mock AI Summarizer for Campus Updates / Notices
 * Scans content for key themes (dates, mandatory requirements, fees, deadlines)
 * and synthesizes 3 concise bullet points.
 */
export function summarizeNoticeAI(notice: Pick<Notice, 'title' | 'content'> & Partial<Notice>): string[] {
  const text = `${notice.title} ${notice.content}`;
  const lower = text.toLowerCase();

  // Keyword scanners:
  // 1. Dates / Deadlines
  const hasDeadline =
    lower.includes('deadline') ||
    lower.includes('due') ||
    lower.includes('last date') ||
    lower.includes('submit before') ||
    lower.includes('by ');

  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/i;
  const dateMatch = text.match(dateRegex);

  // 2. Mandatory / Compliance
  const hasMandatory =
    lower.includes('mandatory') ||
    lower.includes('compulsory') ||
    lower.includes('required') ||
    lower.includes('strict') ||
    lower.includes('attendance') ||
    lower.includes('must ');

  // 3. Fees / Financials / Dues
  const hasFees =
    lower.includes('fee') ||
    lower.includes('fees') ||
    lower.includes('dues') ||
    lower.includes('payment') ||
    lower.includes('fine') ||
    lower.includes('penalty') ||
    lower.includes('rs.') ||
    lower.includes('inr');

  // Split into sentences
  const sentences = notice.content
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 8);

  const bullets: string[] = [];

  // Bullet 1: Core Executive Announcement
  const openingSentence = sentences[0] || notice.title;
  bullets.push(`Core Update: ${notice.title}: ${openingSentence.slice(0, 120)}${openingSentence.length > 120 ? '...' : ''}`);

  // Bullet 2: Essential Requirements & Compliance Action
  if (hasMandatory) {
    const mandatorySentence = sentences.find(s => /mandatory|compulsory|required|strict|must|attendance/i.test(s));
    bullets.push(`Compliance: ${mandatorySentence ? mandatorySentence.slice(0, 130) : 'Attendance and compliance are mandatory for all registered students.'}`);
  } else if (hasFees) {
    const feeSentence = sentences.find(s => /fee|dues|payment|fine|penalty/i.test(s));
    bullets.push(`Financials: ${feeSentence ? feeSentence.slice(0, 130) : 'Clear all pending administrative or examination dues promptly.'}`);
  } else {
    const secondSentence = sentences[1] || `Directive issued officially by ${notice.department || 'the Academic Administration'}.`;
    bullets.push(`Directive: ${secondSentence.slice(0, 130)}`);
  }

  // Bullet 3: Critical Schedule & Deadlines
  if (hasDeadline || dateMatch) {
    const deadlineSentence = sentences.find(s => /deadline|last date|due|submit|by|date/i.test(s));
    const targetDate = dateMatch ? dateMatch[0] : (notice.publishedDate || 'the published date');
    bullets.push(`Timeline: Strict deadline is ${targetDate}.${deadlineSentence ? ` ${deadlineSentence.slice(0, 80)}` : ''}`);
  } else {
    bullets.push(`Timeline: Effective immediately as of publication date (${notice.publishedDate || 'Current Term'}).`);
  }

  return bullets.slice(0, 3);
}
