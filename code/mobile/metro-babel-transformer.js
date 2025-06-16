
const upstreamTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = function({ src, filename, options }) {
  // Usar a configuração do babel.config.js existente
  return upstreamTransformer.transform({
    src,
    filename,
    options
  });
};