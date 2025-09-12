const sharp = require('sharp');
const fs = require('fs');

async function createAssets() {
  try {
    // Crear imagen de 1024x1024 con fondo transparente para icon y adaptive-icon
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
    .png()
    .toFile('./assets/icon.png');

    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
    .png()
    .toFile('./assets/adaptive-icon.png');

    // Crear favicon de 48x48
    await sharp({
      create: {
        width: 48,
        height: 48,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
    .png()
    .toFile('./assets/favicon.png');

    // Crear splash screen de 1242x2688
    await sharp({
      create: {
        width: 1242,
        height: 2688,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toFile('./assets/splash.png');

    console.log('✅ Valid PNG assets created successfully with Sharp!');
  } catch (error) {
    console.error('❌ Error creating assets:', error);
  }
}

createAssets();