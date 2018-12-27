import Joi from 'joi';
import { JuggConfig } from '../interface';

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
  webpack: (left, right) => {
    // TODO
    // simply use stringify
    return JSON.stringify(left) === JSON.stringify(right);
  },
  define: (left, right) => {
    return JSON.stringify(left) === JSON.stringify(right);
  },
};
