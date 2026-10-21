const path = require('path');
const pkg = require('../package.json');

module.exports = {
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Codegen currently expects explicit platform entries for local examples.
        ios: {},
        android: {},
      },
    },
  },
};
