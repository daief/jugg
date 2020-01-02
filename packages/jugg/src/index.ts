import * as TYPES from './interface';
import Jugg from './Jugg';

export { CHAIN_CONFIG_MAP } from './env/chainCfgMap';

export { Jugg, TYPES };

export { extendConfig } from './utils';

// command methods
import { excute as build } from './run/build';
import { excute as dev } from './run/dev';
import { excute as inspect } from './run/inspect';

export const commands = {
  build,
  dev,
  inspect,
};
