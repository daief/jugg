// ref: https://github.com/EndemolShineGroup/cosmiconfig-typescript-loader
import { register } from 'ts-node';

register({
  transpileOnly: true,
  typeCheck: false,
});

/**
 * read a ts file
 * @param filePath
 */
export default function(filePath: string) {
  try {
    // disbale config cache
    delete require.cache[require.resolve(filePath)];
    const result = require(filePath);
    return result.default || result;
  } catch (error) {
    // Replace with logger class OR throw a more specific error
    throw error;
  }
}
