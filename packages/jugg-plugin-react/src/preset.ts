export default () => {
  const plugins = [require.resolve('babel-plugin-react-require')];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(require.resolve('babel-plugin-transform-react-remove-prop-types'));
  }

  return {
    presets: [require.resolve('@babel/preset-react')],
    plugins,
  };
};
