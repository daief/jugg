// ref: https://github.com/EndemolShineGroup/cosmiconfig-typescript-loader
// XXX use what tsconfig ?
import 'ts-node/register';

/**
 * read a ts file
 * @param filePath
 */
export default async function(filePath: string) {
  try {
    const result = require(filePath);
    return result.default || result;
  } catch (error) {
    // Replace with logger class OR throw a more specific error
    throw error;
  }
}
