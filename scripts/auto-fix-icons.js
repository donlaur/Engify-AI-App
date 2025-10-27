#!/usr/bin/env node

/**
 * Auto-fix Missing Icons
 * Automatically adds missing icon imports to icons.ts
 */

const fs = require('fs');
const path = require('path');

// Icon mapping from common names to Lucide React components
const ICON_MAP = {
  lightbulb: 'Lightbulb',
  compass: 'Compass',
  mail: 'Mail',
  briefcase: 'Briefcase',
  x: 'X',
  github: 'Github',
  server: 'Server',
  key: 'Key',
  tool: 'Wrench',
  testTube: 'TestTube2',
  fileSearch: 'FileSearch',
  gitCompare: 'GitCompare',
  trending: 'TrendingUp',
  barChart: 'BarChart3',
  layers: 'Layers',
  graduationCap: 'GraduationCap',
  palette: 'Palette',
  building: 'Building2',
  dollarSign: 'DollarSign',
  hash: 'Hash',
  play: 'Play',
  wifi: 'Wifi',
};

console.log('🔧 Auto-fixing missing icons...\n');

// Read icons.ts
const iconsPath = path.join(__dirname, '../src/lib/icons.ts');
let iconsContent = fs.readFileSync(iconsPath, 'utf8');

// Find missing icons
const missingIcons = Object.keys(ICON_MAP).filter(icon => {
  const regex = new RegExp(`^\\s+${icon}:`, 'm');
  return !regex.test(iconsContent);
});

if (missingIcons.length === 0) {
  console.log('✅ All icons are already defined!');
  process.exit(0);
}

console.log(`Found ${missingIcons.length} missing icons:\n`);
missingIcons.forEach(icon => console.log(`  - ${icon} → ${ICON_MAP[icon]}`));
console.log('');

// Add imports
const importSection = iconsContent.match(/import {[\s\S]*?} from 'lucide-react';/);
if (importSection) {
  const imports = importSection[0];
  const newImports = missingIcons.map(icon => ICON_MAP[icon]).join(',\n  ');
  
  // Add new imports before the closing brace
  const updatedImports = imports.replace(
    /} from 'lucide-react';/,
    `,\n  ${newImports}\n} from 'lucide-react';`
  );
  
  iconsContent = iconsContent.replace(imports, updatedImports);
}

// Add to Icons object
const iconsObjectMatch = iconsContent.match(/export const Icons = {[\s\S]*?};/);
if (iconsObjectMatch) {
  const iconsObject = iconsObjectMatch[0];
  const newIconEntries = missingIcons
    .map(icon => `  ${icon}: ${ICON_MAP[icon]},`)
    .join('\n');
  
  // Add before the closing brace
  const updatedIconsObject = iconsObject.replace(
    /};$/,
    `\n  // Auto-added icons\n${newIconEntries}\n};`
  );
  
  iconsContent = iconsContent.replace(iconsObject, updatedIconsObject);
}

// Write back
fs.writeFileSync(iconsPath, iconsContent);

console.log('✅ Successfully added missing icons to icons.ts\n');
console.log('Next: Run npm run type-check to verify');
