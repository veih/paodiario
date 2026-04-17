const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Custom resolver to handle missing wasm files
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
