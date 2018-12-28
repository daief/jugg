import Joi from 'joi';
import { JuggConfig, JuggWebpack } from '../interface';
import Config from 'webpack-chain';

/**
 * 配置规则
 */
export const schema = Joi.object().keys({
  publicPath: Joi.string(),
  outputDir: Joi.string(),
  plugins: Joi.array().items(
    Joi.string(),
    Joi.array().items(Joi.string().required(), Joi.object())
  ),
  webpack: Joi.alternatives(Joi.object(), Joi.func()),
  define: Joi.object(),
  chunks: Joi.bool(),
  sourceMap: Joi.bool(),
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
  };
}

export const PROP_COMPARE: {
  [k: string]: (left: any, right: any) => boolean;
} = {
  plugins: (left, right) => {
    return JSON.stringify(left) === JSON.stringify(right);
  },
  webpack: (left: JuggWebpack, right: JuggWebpack) => {
    const leftCfg = new Config();
    const rightCfg = new Config();

    if (typeof left === 'function' && typeof right === 'function') {
      const leftObjectCfg = left({ config: leftCfg, webpack: leftCfg.toConfig() });
      const rightObjectCfg = right({ config: rightCfg, webpack: rightCfg.toConfig() });

      const chainCompareResult = (leftCfg as any).toString() === (rightCfg as any).toString();

      return chainCompareResult && JSON.stringify(leftObjectCfg) === JSON.stringify(rightObjectCfg);
    }

    return JSON.stringify(left) === JSON.stringify(right);
  },
  define: (left, right) => {
    return JSON.stringify(left) === JSON.stringify(right);
  },
};
