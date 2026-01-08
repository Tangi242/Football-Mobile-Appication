/**
 * Team Assets Utility
 * Provides functions to get team jerseys, logos, and other assets
 * with graceful fallback handling for missing assets
 */

import { placeholderImages } from '../assets/placeholders.js';
import { onlineImages } from '../assets/onlineImages.js';
import { getKitAsset, getLogoAsset } from '../assets/kits-index.js';

// Team name normalization
const normalizeTeamName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Check if asset exists (for local assets)
const assetExists = (assetPath) => {
  try {
    // In React Native, we'll use require which throws if file doesn't exist
    // For now, we'll use a try-catch approach with dynamic requires
    return true; // Optimistic - actual check would require asset registry
  } catch {
    return false;
  }
};

// Get team logo
export const getTeamLogo = (teamName, fallbackToFlag = true) => {
  if (!teamName) {
    return fallbackToFlag 
      ? { uri: onlineImages.logos.namibia }
      : placeholderImages.logos.namibia;
  }

  const name = teamName.toLowerCase();

  // Try local asset path first (if assets exist, they'll be loaded)
  // For now, we'll use online fallback since local assets may not exist
  // When assets are downloaded, you can use require() with the path from getLogoAsset()
  const localAssetPath = getLogoAsset(teamName);
  
  // Note: In production, you would check if asset exists and use it
  // For now, we'll use online fallback to avoid bundler errors

  // National team fallback
  if (name.includes('namibia') || name.includes('brave warriors') || name.includes('footballhub')) {
    return { uri: onlineImages.logos.namibia };
  }

  // Fallback to online logo service
  return { uri: onlineImages.logos.namibia }; // Default to Namibia flag
};

// Get team kit (jersey)
export const getTeamKit = (teamName, kitType = 'home') => {
  if (!teamName) {
    return getDefaultKit(kitType);
  }

  // Try local asset path first (if assets exist, they'll be loaded)
  // For now, we'll use online fallback since local assets may not exist
  // When assets are downloaded, you can use require() with the path from getKitAsset()
  const localAssetPath = getKitAsset(teamName, kitType);
  
  // Note: In production, you would check if asset exists and use it
  // For now, we'll use online fallback to avoid bundler errors

  const name = teamName.toLowerCase();

  // National team kits fallback
  if (name.includes('namibia') || name.includes('brave warriors') || name.includes('footballhub')) {
    return getDefaultKit(kitType, 'Namibia');
  }

  // Fallback to placeholder
  return getDefaultKit(kitType);
};

// Get default kit (fallback)
const getDefaultKit = (kitType = 'home', teamName = '') => {
  const colors = {
    home: { primary: '#1E3A8A', secondary: '#FFFFFF' },
    away: { primary: '#FFFFFF', secondary: '#1E3A8A' },
    third: { primary: '#DC143C', secondary: '#FFFFFF' },
  };

  const color = colors[kitType] || colors.home;
  const text = teamName ? `${teamName}+${kitType}` : 'Kit';
  return { uri: `https://via.placeholder.com/600x800/${color.primary.replace('#', '')}/${color.secondary.replace('#', '')}?text=${encodeURIComponent(text)}` };
};

// Get team colors (for UI theming)
export const getTeamColors = (teamName) => {
  if (!teamName) {
    return { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#DC143C' };
  }

  const name = teamName.toLowerCase();
  const teamColorMap = {
    'african stars': { primary: '#FF0000', secondary: '#FFFFFF', accent: '#000000' },
    'black africa fc': { primary: '#000000', secondary: '#FFFFFF', accent: '#FFD700' },
    'blue waters': { primary: '#0066CC', secondary: '#FFFFFF', accent: '#FF6600' },
    'citizens': { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#DC143C' },
    'life fighters': { primary: '#FF6600', secondary: '#FFFFFF', accent: '#000000' },
    'mighty gunners fc': { primary: '#8B0000', secondary: '#FFD700', accent: '#000000' },
    'tigers fc': { primary: '#FFA500', secondary: '#000000', accent: '#FFFFFF' },
    'tura magic': { primary: '#800080', secondary: '#FFFFFF', accent: '#FFD700' },
    'namibia': { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#DC143C' },
  };

  return teamColorMap[name] || { primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#DC143C' };
};

// Get all available kits for a team
export const getTeamKits = (teamName) => {
  return {
    home: getTeamKit(teamName, 'home'),
    away: getTeamKit(teamName, 'away'),
    third: getTeamKit(teamName, 'third'),
  };
};

// Check if asset is available (for conditional rendering)
export const isAssetAvailable = (assetPath) => {
  // In a real implementation, this would check the asset registry
  // For now, we'll assume assets are available if they're in our structure
  return assetPath && assetPath.includes('assets/');
};

// Get asset with fallback chain
export const getAssetWithFallback = (primaryPath, fallbackPaths = [], defaultAsset = null) => {
  // Try primary path
  if (isAssetAvailable(primaryPath)) {
    return { uri: primaryPath };
  }

  // Try fallback paths
  for (const fallback of fallbackPaths) {
    if (isAssetAvailable(fallback)) {
      return { uri: fallback };
    }
  }

  // Return default
  return defaultAsset || placeholderImages.logos.namibia;
};

// Component-friendly hook for team assets
export const useTeamAssets = (teamName) => {
  return {
    logo: getTeamLogo(teamName),
    kits: getTeamKits(teamName),
    colors: getTeamColors(teamName),
  };
};

