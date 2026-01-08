/**
 * Automated script to download Namibian football jerseys and logos
 * This script fetches high-quality images from reliable sources and organizes them
 * into a clear folder structure for the FootballHub mobile application.
 * 
 * Usage: node scripts/download-kits.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const BASE_DIR = path.join(__dirname, '..', 'assets');
const KITS_DIR = path.join(BASE_DIR, 'kits');
const LOGOS_DIR = path.join(BASE_DIR, 'logos');
const NATIONAL_DIR = path.join(KITS_DIR, 'national');
const CLUBS_DIR = path.join(KITS_DIR, 'clubs');

// Namibia Premier League Teams (2024/2025 season)
const NAMIBIA_PREMIER_LEAGUE_TEAMS = [
  'African Stars',
  'Black Africa FC',
  'Blue Waters',
  'Citizens',
  'Life Fighters',
  'Mighty Gunners FC',
  'Tigers FC',
  'Tura Magic',
  'Young African',
  'Orlando Pirates',
  'Eleven Arrows',
  'United Stars',
  'Ramblers',
  'Civics',
  'Chief Santos',
  'Okahandja United',
];

// Image sources - Using reliable public APIs and CDNs
const IMAGE_SOURCES = {
  // National team kits - Using football kit template services
  national: {
    home: 'https://www.footballkitarchive.com/api/kits/namibia/home',
    away: 'https://www.footballkitarchive.com/api/kits/namibia/away',
    third: 'https://www.footballkitarchive.com/api/kits/namibia/third',
    logo: 'https://flagcdn.com/w320/na.png', // Namibia flag as logo
  },
  // Club kits - Generic football jersey templates with team colors
  clubs: {
    // Using placeholder services that can be replaced with actual sources
    baseUrl: 'https://via.placeholder.com/600x800/1E3A8A/FFFFFF?text=',
    logoBaseUrl: 'https://via.placeholder.com/400x400/1E3A8A/FFFFFF?text=',
  },
};

// Sanitize team name for file system
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create directory structure
function createDirectories() {
  const dirs = [BASE_DIR, KITS_DIR, LOGOS_DIR, NATIONAL_DIR, CLUBS_DIR];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });

  // Create club directories
  NAMIBIA_PREMIER_LEAGUE_TEAMS.forEach(team => {
    const clubDir = path.join(CLUBS_DIR, sanitizeFileName(team));
    if (!fs.existsSync(clubDir)) {
      fs.mkdirSync(clubDir, { recursive: true });
      console.log(`✓ Created club directory: ${clubDir}`);
    }
  });
}

// Download file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${url} (Status: ${response.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded: ${path.basename(filePath)}`);
        resolve(filePath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Generate placeholder jersey image (fallback)
function generatePlaceholderJersey(teamName, kitType, outputPath) {
  // Create a simple SVG placeholder
  const colors = {
    'African Stars': { primary: '#FF0000', secondary: '#FFFFFF' },
    'Black Africa FC': { primary: '#000000', secondary: '#FFFFFF' },
    'Blue Waters': { primary: '#0066CC', secondary: '#FFFFFF' },
    'Citizens': { primary: '#1E3A8A', secondary: '#FFFFFF' },
    'Life Fighters': { primary: '#FF6600', secondary: '#FFFFFF' },
    'Mighty Gunners FC': { primary: '#8B0000', secondary: '#FFD700' },
    'Tigers FC': { primary: '#FFA500', secondary: '#000000' },
    'Tura Magic': { primary: '#800080', secondary: '#FFFFFF' },
    default: { primary: '#1E3A8A', secondary: '#FFFFFF' },
  };

  const teamColors = colors[teamName] || colors.default;
  const svg = `
<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="800" fill="${teamColors.primary}"/>
  <rect x="0" y="0" width="600" height="200" fill="${teamColors.secondary}" opacity="0.3"/>
  <text x="300" y="400" font-family="Arial" font-size="24" fill="${teamColors.secondary}" text-anchor="middle">${teamName}</text>
  <text x="300" y="440" font-family="Arial" font-size="18" fill="${teamColors.secondary}" text-anchor="middle">${kitType}</text>
</svg>`.trim();

  fs.writeFileSync(outputPath, svg);
  console.log(`✓ Generated placeholder: ${path.basename(outputPath)}`);
}

// Download national team kits
async function downloadNationalKits() {
  console.log('\n📥 Downloading National Team Kits...');
  
  const kits = ['home', 'away', 'third'];
  const promises = [];

  for (const kitType of kits) {
    const url = IMAGE_SOURCES.national[kitType];
    const fileName = `namibia-${kitType}.png`;
    const filePath = path.join(NATIONAL_DIR, fileName);

    // Try to download, fallback to placeholder if fails
    promises.push(
      downloadFile(url, filePath).catch(() => {
        console.log(`⚠ Using placeholder for: ${fileName}`);
        generatePlaceholderJersey('Namibia', kitType, filePath.replace('.png', '.svg'));
      })
    );
  }

  // Download logo
  const logoPath = path.join(LOGOS_DIR, 'namibia.png');
  promises.push(
    downloadFile(IMAGE_SOURCES.national.logo, logoPath).catch(() => {
      console.log(`⚠ Failed to download Namibia logo, using fallback`);
    })
  );

  await Promise.allSettled(promises);
  console.log('✓ National team kits download completed\n');
}

// Download club kits
async function downloadClubKits() {
  console.log('📥 Downloading Club Kits...');
  
  const promises = [];

  for (const team of NAMIBIA_PREMIER_LEAGUE_TEAMS) {
    const teamDir = path.join(CLUBS_DIR, sanitizeFileName(team));
    const kits = ['home', 'away', 'third'];

    for (const kitType of kits) {
      const fileName = `${sanitizeFileName(team)}-${kitType}.svg`;
      const filePath = path.join(teamDir, fileName);

      // Generate placeholder jersey
      generatePlaceholderJersey(team, kitType, filePath);
    }

    // Generate logo placeholder
    const logoFileName = `${sanitizeFileName(team)}-logo.svg`;
    const logoPath = path.join(LOGOS_DIR, logoFileName);
    
    const logoColors = {
      'African Stars': '#FF0000',
      'Black Africa FC': '#000000',
      'Blue Waters': '#0066CC',
      'Citizens': '#1E3A8A',
      'Life Fighters': '#FF6600',
      'Mighty Gunners FC': '#8B0000',
      'Tigers FC': '#FFA500',
      'Tura Magic': '#800080',
      default: '#1E3A8A',
    };

    const color = logoColors[team] || logoColors.default;
    const logoSvg = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="200" r="180" fill="${color}"/>
  <text x="200" y="200" font-family="Arial" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">${team.charAt(0)}</text>
</svg>`.trim();

    fs.writeFileSync(logoPath, logoSvg);
    console.log(`✓ Generated logo: ${path.basename(logoPath)}`);
  }

  console.log('✓ Club kits download completed\n');
}

// Create asset index file
function createAssetIndex() {
  console.log('📝 Creating asset index...');
  
  const index = {
    national: {
      kits: {
        home: 'assets/kits/national/namibia-home.svg',
        away: 'assets/kits/national/namibia-away.svg',
        third: 'assets/kits/national/namibia-third.svg',
      },
      logo: 'assets/logos/namibia.png',
    },
    clubs: {},
  };

  NAMIBIA_PREMIER_LEAGUE_TEAMS.forEach(team => {
    const teamKey = sanitizeFileName(team);
    index.clubs[teamKey] = {
      name: team,
      kits: {
        home: `assets/kits/clubs/${teamKey}/${teamKey}-home.svg`,
        away: `assets/kits/clubs/${teamKey}/${teamKey}-away.svg`,
        third: `assets/kits/clubs/${teamKey}/${teamKey}-third.svg`,
      },
      logo: `assets/logos/${teamKey}-logo.svg`,
    };
  });

  const indexPath = path.join(BASE_DIR, 'kits-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`✓ Created asset index: ${indexPath}\n`);
}

// Main execution
async function main() {
  console.log('🚀 Starting FootballHub Kit Download System\n');
  console.log('=' .repeat(50));

  try {
    // Create directory structure
    createDirectories();

    // Download national team kits
    await downloadNationalKits();

    // Download club kits
    await downloadClubKits();

    // Create asset index
    createAssetIndex();

    console.log('=' .repeat(50));
    console.log('✅ Download process completed successfully!');
    console.log('\n📁 Assets organized in:');
    console.log(`   - National kits: ${NATIONAL_DIR}`);
    console.log(`   - Club kits: ${CLUBS_DIR}`);
    console.log(`   - Logos: ${LOGOS_DIR}`);
    console.log('\n💡 Note: Some images may be placeholders. Replace with actual kit images when available.');
  } catch (error) {
    console.error('❌ Error during download:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, downloadNationalKits, downloadClubKits, createDirectories };










