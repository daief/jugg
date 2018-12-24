import { JuggConfig } from '../interface';

/**
 * ref:
 * - https://github.com/facebook/create-react-app/blob/581c453/packages/react-scripts/config/webpack.config.prod.js#L120-L154
 */
export default (opts: JuggConfig) => ({
  sourceMap: opts.sourceMap,
  cache: true,
  parallel: true,
});
