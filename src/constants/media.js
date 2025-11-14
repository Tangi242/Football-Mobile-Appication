import { placeholderImages } from '../assets/placeholders.js';

export const nfaImages = {
  hero: placeholderImages.matchBanners[0],
  matchBackdrop: placeholderImages.matchBanners[1],
  fans: placeholderImages.matchBanners[2] || placeholderImages.matchBanners[0],
  newsFallbacks: placeholderImages.news,
  playerGallery: placeholderImages.players
};

export const getNewsImage = (index = 0) =>
  nfaImages.newsFallbacks[index % nfaImages.newsFallbacks.length];

export const getPlayerImage = (index = 0) =>
  nfaImages.playerGallery[index % nfaImages.playerGallery.length];


