const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add TypeScript file extensions
config.resolver.sourceExts.push('ts', 'tsx');

// Enable platform-specific extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;