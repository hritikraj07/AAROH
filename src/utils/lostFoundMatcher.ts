import { LostFoundItem } from '../types';

export interface LostFoundMatch {
  id: string;
  lostItem: LostFoundItem;
  foundItem: LostFoundItem;
  matchedKeywords: string[];
  confidenceScore: number;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'lost', 'found', 'item', 'items', 'report', 'reported', 'please',
  'near', 'inside', 'floor', 'room', 'block', 'hall', 'desk', 'table'
]);

/**
 * Extract meaningful keywords from text string
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 3 && !STOP_WORDS.has(token));

  return Array.from(new Set(tokens));
}

/**
 * Scans lost and found items array and pairs items with high keyword overlap
 */
export function findLostAndFoundMatches(items: LostFoundItem[]): LostFoundMatch[] {
  const lostItems = items.filter(item => item.type === 'lost' && item.status !== 'resolved');
  const foundItems = items.filter(item => item.type === 'found' && item.status !== 'resolved');

  const matches: LostFoundMatch[] = [];

  for (const lost of lostItems) {
    const lostWords = extractKeywords(`${lost.title} ${lost.description} ${lost.location}`);

    for (const found of foundItems) {
      const foundWords = extractKeywords(`${found.title} ${found.description} ${found.location}`);

      // Find intersection of keywords
      const common = lostWords.filter(word => foundWords.includes(word));

      // Significant matches: at least 2 common keywords or high-value specific token (asus, macbook, lenovo, etc.)
      const isHighValueBrand = common.some(w => ['asus', 'tuf', 'apple', 'macbook', 'dell', 'hp', 'lenovo', 'casio', 'airpods', 'iphone', 'samsung', 'calculator', 'laptop'].includes(w));

      if (common.length >= 2 || (common.length >= 1 && isHighValueBrand)) {
        const confidence = Math.min(99, 65 + common.length * 15);
        matches.push({
          id: `match_${lost.id}_${found.id}`,
          lostItem: lost,
          foundItem: found,
          matchedKeywords: common.map(w => w.toUpperCase()),
          confidenceScore: confidence,
        });
      }
    }
  }

  return matches;
}
