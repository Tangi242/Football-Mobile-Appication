import { placeholderImages } from '../assets/placeholders.js';
import { onlineImages } from '../assets/onlineImages.js';

export const nfaImages = {
  hero: { uri: onlineImages.landingHero },
  matchBackdrop: { uri: onlineImages.matchBanners[1] },
  fans: { uri: onlineImages.matchBanners[2] || onlineImages.matchBanners[0] },
  newsFallbacks: placeholderImages.news.map(url => ({ uri: url })),
  playerGallery: placeholderImages.players.map(url => ({ uri: url })),
  // Background for auth screens - ball on grass
  authBackground: { uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80' }
};

export const getNewsImage = (index = 0) =>
  nfaImages.newsFallbacks[index % nfaImages.newsFallbacks.length];

export const getPlayerImage = (index = 0) =>
  nfaImages.playerGallery[index % nfaImages.playerGallery.length];


