const fs = require('fs');
const path = require('path');

// Crear un pixel PNG de 1024x1024 básico (transparente)
function createPNG(width, height) {
  // PNG mínimo válido con píxel transparente
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk para imagen de 1024x1024, RGBA
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length: 13 bytes
    Buffer.from('IHDR'),
    Buffer.from([0x00, 0x00, (width >> 8) & 0xFF, width & 0xFF]), // Width
    Buffer.from([0x00, 0x00, (height >> 8) & 0xFF, height & 0xFF]), // Height  
    Buffer.from([0x08, 0x06, 0x00, 0x00, 0x00]), // 8-bit RGBA, no compression, no filter, no interlace
  ]);
  
  const ihdrCrc = Buffer.from([0x4F, 0x6E, 0x75, 0x75]); // Pre-calculated CRC
  
  // IDAT chunk (minimal compressed data)
  const idat = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x16]), // Length: 22 bytes
    Buffer.from('IDAT'),
    Buffer.from([0x08, 0x1D, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0xFE, 0xFF]),
    Buffer.from([0xA5, 0xAB, 0x2F, 0x29]), // Pre-calculated CRC
  ]);
  
  // IEND chunk
  const iend = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // Length: 0
    Buffer.from('IEND'),
    Buffer.from([0xAE, 0x42, 0x60, 0x82]), // CRC
  ]);
  
  return Buffer.concat([header, ihdr, ihdrCrc, idat, iend]);
}

// Crear directorio si no existe
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// Crear imágenes básicas
const icon1024 = createPNG(1024, 1024);
const splash = createPNG(1242, 2688); // iPhone 12 Pro Max resolution

fs.writeFileSync('./assets/icon.png', icon1024);
fs.writeFileSync('./assets/adaptive-icon.png', icon1024);
fs.writeFileSync('./assets/favicon.png', createPNG(48, 48));
fs.writeFileSync('./assets/splash.png', splash);

console.log('✅ Assets created successfully!');