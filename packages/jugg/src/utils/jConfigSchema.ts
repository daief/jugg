import Joi from 'joi';
import Config from 'webpack-chain';
import { JuggConfig, JuggWebpack } from '../interface';

const pluginSchemaArray = Joi.array().items(
  Joi.string(),
  Joi.array().items(Joi.string().required(), Joi.object()),
);

/**
 * 配置规则
 */
export const schema = Joi.object().keys({
  publicPath: Joi.string(),
  outputDir: Joi.string(),
  plugins: pluginSchemaArray,
  webpack: Joi.alternatives(Joi.object(), Joi.func()),
  define: Joi.object(),
  chunks: Joi.bool(),
  sourceMap: Joi.bool(),
  tsCustomTransformers: Joi.object().keys({
    before: pluginSchemaArray,
    after: pluginSchemaArray,
  }),
  filename: Joi.string(),
  html: Joi.alternatives(false, Joi.object()),

  // css
  css: Joi.object({
    // modules: Joi.boolean(),
    // extract: Joi.alternatives().try(Joi.boolean(), Joi.object()),
    // sourceMap: Joi.boolean(),
    loaderOptions: Joi.object({
      // css: Joi.object(),
      // less: Joi.object(),
      postcss: Joi.object(),
    }),
  }),
});

/**
 * 校验
 * @param config 配置
 */
export function validateConfig(config: JuggConfig) {
  return Joi.validate(config, schema);
}

/**
 * 默认值
 */
export function defaults(): JuggConfig {
  return {
    publicPath: '/',
    outputDir: 'dist',
    plugins: [],
    webpack: {},
    define: {},
    chunks: true,
    sourceMap: true,
    tsCustomTransformers: {},
    filename: '[name].[chunkhash]',
    html: {},
    css: {
      loaderOptions: {
        postcss: {},
      },
    },
  };
}

export function stringifyEqual(left: any, right: any) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export const PROP_COMPARE: {
  [k: string]: (left: any, right: any) => boolean;
} = {
  plugins: stringifyEqual,
  webpack: (left: JuggWebpack, right: JuggWebpack) => {
    const leftCfg = new Config();
    const rightCfg = new Config();

    if (typeof left === 'function' && typeof right === 'function') {
      const leftObjectCfg = left({
        config: leftCfg,
        webpack: leftCfg.toConfig(),
      });
      const rightObjectCfg = right({
        config: rightCfg,
        webpack: rightCfg.toConfig(),
      });

      const chainCompareResult =
        (leftCfg as any).toString() === (rightCfg as any).toString();

      return (
        chainCompareResult &&
        JSON.stringify(leftObjectCfg) === JSON.stringify(rightObjectCfg)
      );
    }

    return JSON.stringify(left) === JSON.stringify(right);
  },
  define: stringifyEqual,
  tsCustomTransformers: stringifyEqual,
  html: stringifyEqual,
  css: stringifyEqual,
};
