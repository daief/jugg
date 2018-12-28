import { PluginCfgSchema } from '@axew/jugg/types';

/**
 * ref:
 *  babel-preset-umi@1.2.1
 *  @vue/babel-preset-app@3.0.5
 */

export interface IJuggPreset {
  // https://babeljs.io/docs/en/babel-preset-env
  useBuiltIns?: string | boolean;
  loose?: boolean;
  targets?: {
    browsers: string[];
    [k: string]: any;
  };
  modules?: string | boolean;
  env?: {
    [k: string]: any;
  };
  // https://babeljs.io/docs/en/babel-plugin-transform-runtime
  transformRuntime?: {
    [k: string]: any;
  };
}

export default (_: any, opts: IJuggPreset = {}): any => {
  const {
    useBuiltIns = 'usage',
    loose = false,
    targets = {
      browsers: [
        'Chrome >= 49',
        'Firefox >= 45',
        'Safari >= 10',
        'Edge >= 13',
        'iOS >= 10',
        'Android >= 4.4',
      ],
    },
    modules = false,
    env = {},
    transformRuntime = {},
  } = opts;

  const exclude = [
    'transform-typeof-symbol',
    'transform-unicode-regex',
    'transform-sticky-regex',
    'transform-new-target',
    'transform-modules-umd',
    'transform-modules-systemjs',
    'transform-modules-amd',
    'transform-literals',
  ];

  const presets: PluginCfgSchema[] = [];
  const plugins: PluginCfgSchema[] = [];

  plugins.push(
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    [require.resolve('@babel/plugin-proposal-object-rest-spread'), { loose, useBuiltIns }],
    require.resolve('@babel/plugin-proposal-optional-catch-binding'),
    require.resolve('@babel/plugin-proposal-async-generator-functions'),

    // 下面两个的顺序的配置都不能动
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-export-default-from'),
    [require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), { loose }],
    [require.resolve('@babel/plugin-proposal-optional-chaining'), { loose }],
    [
      require.resolve('@babel/plugin-proposal-pipeline-operator'),
      {
        proposal: 'minimal',
      },
    ],
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
    require.resolve('babel-plugin-macros'),

    [
      require('@babel/plugin-transform-runtime'),
      {
        ...transformRuntime,
      },
    ]
  );

  // pass options along to babel-preset-env
  presets.push([
    require('@babel/preset-env'),
    {
      useBuiltIns,
      targets,
      exclude,
      loose,
      modules,
      ...env,
    },
  ]);

  return {
    presets,
    plugins,
  };
};
