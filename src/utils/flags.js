import { placeholderImages } from '../assets/placeholders.js';
import { getTeamLogo } from '../utils/teamAssets.js';

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
  if (key.includes('namibia') || key.includes('brave') || key.includes('footballhub')) return flagSources.namibia;
  // Use team assets utility for logo
  return getTeamLogo(teamName, true);
};

