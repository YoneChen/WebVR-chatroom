module.exports = {
  plugins: {
    'postcss-cssnext': {
      browsers: ['last 2 versions', '> 5%'],
    },
    'cssnano': { reduceIdents: false, zindex: false }
    // 'precss': {}
  },
};