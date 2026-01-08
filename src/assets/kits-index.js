/**
 * Kit Asset Index
 * Maps team names to their kit and logo asset paths
 * This file uses path-based mapping instead of require() to avoid bundler errors
 * When assets are downloaded, they can be loaded dynamically
 * 
 * Note: This file doesn't use require() to avoid bundler errors when assets don't exist yet
 */

// Asset path mappings (relative to assets directory)
// These paths are used for reference - actual loading happens in teamAssets.js with fallbacks
export const kitAssetPaths = {
  national: {
    name: 'Namibia',
    kits: {
      home: './kits/national/namibia-home.svg',
      away: './kits/national/namibia-away.svg',
      third: './kits/national/namibia-third.svg',
    },
    logo: './logos/namibia.png',
  },
  clubs: {
    'african-stars': {
      name: 'African Stars',
      kits: {
        home: './kits/clubs/african-stars/african-stars-home.svg',
        away: './kits/clubs/african-stars/african-stars-away.svg',
        third: './kits/clubs/african-stars/african-stars-third.svg',
      },
      logo: './logos/african-stars-logo.svg',
    },
    'black-africa-fc': {
      name: 'Black Africa FC',
      kits: {
        home: './kits/clubs/black-africa-fc/black-africa-fc-home.svg',
        away: './kits/clubs/black-africa-fc/black-africa-fc-away.svg',
        third: './kits/clubs/black-africa-fc/black-africa-fc-third.svg',
      },
      logo: './logos/black-africa-fc-logo.svg',
    },
    'blue-waters': {
      name: 'Blue Waters',
      kits: {
        home: './kits/clubs/blue-waters/blue-waters-home.svg',
        away: './kits/clubs/blue-waters/blue-waters-away.svg',
        third: './kits/clubs/blue-waters/blue-waters-third.svg',
      },
      logo: './logos/blue-waters-logo.svg',
    },
    'citizens': {
      name: 'Citizens',
      kits: {
        home: './kits/clubs/citizens/citizens-home.svg',
        away: './kits/clubs/citizens/citizens-away.svg',
        third: './kits/clubs/citizens/citizens-third.svg',
      },
      logo: './logos/citizens-logo.svg',
    },
    'life-fighters': {
      name: 'Life Fighters',
      kits: {
        home: './kits/clubs/life-fighters/life-fighters-home.svg',
        away: './kits/clubs/life-fighters/life-fighters-away.svg',
        third: './kits/clubs/life-fighters/life-fighters-third.svg',
      },
      logo: './logos/life-fighters-logo.svg',
    },
    'mighty-gunners-fc': {
      name: 'Mighty Gunners FC',
      kits: {
        home: './kits/clubs/mighty-gunners-fc/mighty-gunners-fc-home.svg',
        away: './kits/clubs/mighty-gunners-fc/mighty-gunners-fc-away.svg',
        third: './kits/clubs/mighty-gunners-fc/mighty-gunners-fc-third.svg',
      },
      logo: './logos/mighty-gunners-fc-logo.svg',
    },
    'tigers-fc': {
      name: 'Tigers FC',
      kits: {
        home: './kits/clubs/tigers-fc/tigers-fc-home.svg',
        away: './kits/clubs/tigers-fc/tigers-fc-away.svg',
        third: './kits/clubs/tigers-fc/tigers-fc-third.svg',
      },
      logo: './logos/tigers-fc-logo.svg',
    },
    'tura-magic': {
      name: 'Tura Magic',
      kits: {
        home: './kits/clubs/tura-magic/tura-magic-home.svg',
        away: './kits/clubs/tura-magic/tura-magic-away.svg',
        third: './kits/clubs/tura-magic/tura-magic-third.svg',
      },
      logo: './logos/tura-magic-logo.svg',
    },
  },
};

// Helper to get team key from name
const getTeamKey = (teamName) => {
  if (!teamName) return null;
  const normalized = teamName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Check if it's national team
  if (normalized.includes('namibia') || normalized.includes('brave') || normalized.includes('footballhub')) {
    return 'national';
  }
  
  return normalized;
};

// Get kit asset path (returns path string, not require() result)
// This avoids bundler errors when assets don't exist
export const getKitAsset = (teamName, kitType = 'home') => {
  const key = getTeamKey(teamName);
  if (!key) return null;
  
  if (key === 'national') {
    return kitAssetPaths.national.kits[kitType] || kitAssetPaths.national.kits.home;
  }
  
  const club = kitAssetPaths.clubs[key];
  if (!club) return null;
  
  return club.kits[kitType] || club.kits.home;
};

// Get logo asset path (returns path string, not require() result)
// This avoids bundler errors when assets don't exist
export const getLogoAsset = (teamName) => {
  const key = getTeamKey(teamName);
  if (!key) return null;
  
  if (key === 'national') {
    return kitAssetPaths.national.logo;
  }
  
  const club = kitAssetPaths.clubs[key];
  if (!club) return null;
  
  return club.logo;
};
