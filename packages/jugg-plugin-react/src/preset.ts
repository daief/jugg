export interface JReactPresetOption {
  removePropTypes?: boolean;
  reactRequire?: boolean;
}

export default (opts: JReactPresetOption) => {
  const { removePropTypes = false, reactRequire = false } = opts;

  const plugins = [];

  // order of these plugin
  // https://github.com/vslinko/babel-plugin-react-require/issues/17#issuecomment-428912696
  if (process.env.NODE_ENV === 'production' && removePropTypes === true) {
    plugins.push(require.resolve('babel-plugin-transform-react-remove-prop-types'));
  }

  if (reactRequire === true) {
    plugins.push(require.resolve('babel-plugin-react-require'));
  }

  return {
    presets: [require.resolve('@babel/preset-react')],
    plugins,
  };
};
