const availableImages = [
  require('../../assets/images/download.jpg'),
  require('../../assets/images/image..jpg'),
  require('../../assets/images/images,.jpg'),
  require('../../assets/images/images...jpg'),
  require('../../assets/images/images....jpg'),
  require('../../assets/images/logo.png')
];

const cycle = (count) => Array.from({ length: count }, (_, index) => availableImages[index % availableImages.length]);

const logo = require('../../assets/images/logo.png');

export const placeholderImages = {
  players: cycle(12),
  stadiums: cycle(4),
  news: cycle(4),
  matchBanners: cycle(3),
  lineups: cycle(2),
  logos: {
    poland: logo,
    netherlands: logo,
    namibia: logo,
    angola: logo
  },
  icons: {
    stats: logo,
    matches: logo,
    news: logo
  }
};

export const getPlaceholder = (collection, index = 0) => {
  const items = placeholderImages[collection] || [];
  if (!items.length) return availableImages[index % availableImages.length];
  return items[index % items.length];
};

