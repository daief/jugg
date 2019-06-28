import { join } from 'path';
import { JuggConfig } from '../interface';

export function matchTranspileDependencies(
  option: JuggConfig['transpileDependencies'],
  path: string,
): boolean {
  if (typeof option === 'function') {
    return option(path);
  }

  if (Array.isArray(option)) {
    for (const item of option) {
      const regex =
        typeof item === 'string'
          ? new RegExp(join('node_modules', item, '/'), 'i')
          : item;
      if (regex.test(path)) {
        return true;
      }
    }
  }

  return false;
}
