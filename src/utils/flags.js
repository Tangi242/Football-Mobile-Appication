import { placeholderImages } from '../assets/placeholders.js';

const flagSources = {
  namibia: placeholderImages.logos.namibia,
  poland: placeholderImages.logos.poland,
  netherlands: placeholderImages.logos.netherlands,
  angola: placeholderImages.logos.angola
};

const sanitize = (name) => (name || '').toLowerCase().replace(/\s+/g, '');

export const getFlagForTeam = (teamName) => {
  if (!teamName) return flagSources.namibia;
  const key = sanitize(teamName);
  if (flagSources[key]) return flagSources[key];
  if (key.includes('namibia') || key.includes('brave')) return flagSources.namibia;
  return placeholderImages.logos.namibia;
};

