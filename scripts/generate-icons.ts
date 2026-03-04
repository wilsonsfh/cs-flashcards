// Run: npx ts-node --esm scripts/generate-icons.ts
// Generates simple SVG placeholder icons for PWA
// Replace with proper designed icons before production

import { writeFileSync } from 'fs'

function generateSvgIcon(size: number): string {
  const fontSize = Math.round(size * 0.4)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#09090b"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="#fafafa">CS</text>
</svg>`
}

writeFileSync('public/icons/icon-192.svg', generateSvgIcon(192))
writeFileSync('public/icons/icon-512.svg', generateSvgIcon(512))

console.log('Generated SVG icons in public/icons/')
console.log('Note: Convert to PNG for production PWA support')
