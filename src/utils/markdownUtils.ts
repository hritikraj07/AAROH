/**
 * Strips raw markdown characters (#, ##, ###, **, *, `, ```, lists) from preview snippets
 * so clean plain text renders cleanly without formatting symbols leaking into card previews.
 */
export const stripMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/#+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};
