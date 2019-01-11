const p =
  process.env.NODE_ENV === 'development'
    ? require('./ts-rhl-transformer.dev')
    : require('./ts-rhl-transformer.prod');

exports.createTransformer = p.createTransformer;
exports.default = p.default;
