const config = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  tsCustomTransformers: {
    before: ['@axew/jugg-plugin-react/lib/ts-rhl-transformer']
  }
};

module.exports = config;
