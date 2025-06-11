module.exports = function(api) {
  api.cache(true);

  const plugins = [
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": ".env",
      "blacklist": null,
      "whitelist": null,
      "safe": true,
      "allowUndefined": true
    }],
    "babel-plugin-inline-import",
    'react-native-reanimated/plugin'
  ];

  // MUITO IMPORTANTE: só adicionar istanbul em condições bem específicas
  if (process.env.COVERAGE === 'true') {
    plugins.push(['babel-plugin-istanbul', {
      exclude: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/coverage/**',
        '**/node_modules/**',
      ]
    }]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};