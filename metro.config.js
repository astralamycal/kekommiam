/**
 * @file metro.config.js
 * @description Metro configuration to support .wasm assets for expo-sqlite on web.
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'wasm' to asset extensions so Metro can bundle wa-sqlite.wasm properly on web
config.resolver.assetExts.push('wasm');

module.exports = config;