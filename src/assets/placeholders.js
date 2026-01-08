// Import online images instead of local files
import { onlineImages } from './onlineImages.js';

export const placeholderImages = {
  players: onlineImages.players,
  stadiums: onlineImages.stadiums,
  news: onlineImages.news,
  matchBanners: onlineImages.matchBanners,
  lineups: onlineImages.lineups,
  logos: {
    poland: { uri: onlineImages.logos.poland },
    netherlands: { uri: onlineImages.logos.netherlands },
    namibia: { uri: onlineImages.logos.namibia },
    angola: { uri: onlineImages.logos.angola }
  },
  icons: {
    stats: { uri: onlineImages.icons.stats },
    matches: { uri: onlineImages.icons.matches },
    news: { uri: onlineImages.icons.news }
  }
};

export const getPlaceholder = (collection, index = 0) => {
  const items = placeholderImages[collection] || [];
  if (!items.length) return { uri: onlineImages.matchBanners[0] };
  if (Array.isArray(items)) {
    return { uri: items[index % items.length] };
  }
  return items;
};

