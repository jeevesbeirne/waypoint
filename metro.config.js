const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Resolve .wasm files on web
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];

module.exports = config;
